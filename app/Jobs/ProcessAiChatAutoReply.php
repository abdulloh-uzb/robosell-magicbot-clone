<?php

namespace App\Jobs;

use App\Ai\Support\ChatAction;
use App\Ai\Support\ChatContext;
use App\Ai\Support\LanguageDetector;
use App\Models\AiChatConversationState;
use App\Models\InstagramMessage;
use App\Models\TelegramMessage;
use App\Models\User;
use App\Services\Ai\SellerChatAgent;
use App\Services\SellerChatMessageSender;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\UserMessage;
use Throwable;

class ProcessAiChatAutoReply implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $platform,
        public ?int $telegramMessageId = null,
        public ?int $instagramMessageId = null,
    ) {}

    public function handle(SellerChatMessageSender $sender): void
    {
        Log::info('ProcessAiChatAutoReply started', [
            'platform' => $this->platform,
            'telegram_message_id' => $this->telegramMessageId,
            'instagram_message_id' => $this->instagramMessageId,
        ]);

        if ($this->platform === 'telegram' && $this->telegramMessageId) {
            $this->handleTelegram($sender);

            return;
        }

        if ($this->platform === 'instagram' && $this->instagramMessageId) {
            $this->handleInstagram($sender);
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('ProcessAiChatAutoReply failed', [
            'platform' => $this->platform,
            'telegram_message_id' => $this->telegramMessageId,
            'instagram_message_id' => $this->instagramMessageId,
            'exception' => $exception?->getMessage(),
        ]);
    }

    protected function handleTelegram(SellerChatMessageSender $sender): void
    {
        $inbound = TelegramMessage::query()
            ->with(['bot', 'customer'])
            ->find($this->telegramMessageId);

        if (! $inbound || ! $inbound->customer_id || ! $inbound->bot || ! $inbound->customer) {
            Log::info('ProcessAiChatAutoReply skipped (telegram): missing inbound or relations');

            return;
        }

        if ($inbound->direction !== 'in') {
            Log::info('ProcessAiChatAutoReply skipped (telegram): not an inbound message');

            return;
        }

        $seller = User::query()->find($inbound->bot->seller_id);

        if (! $seller || ! $seller->ai_auto_reply_enabled) {
            Log::info('ProcessAiChatAutoReply skipped (telegram): seller auto-reply off or unknown seller', [
                'seller_id' => $inbound->bot->seller_id,
            ]);

            return;
        }

        if (! $this->hasAiKeyConfigured()) {
            Log::warning('ProcessAiChatAutoReply skipped (telegram): no AI provider key configured');

            return;
        }

        $state = AiChatConversationState::forTelegram($inbound->bot_id, $inbound->customer_id);

        if (! $state->canAiReply((int) config('ai_chat.max_replies_per_conversation'))) {
            Log::info('ProcessAiChatAutoReply skipped (telegram): max replies reached or handed off', [
                'reply_count' => $state->ai_reply_count,
                'handed_off' => $state->handed_off_to_seller,
            ]);

            return;
        }

        if (! $this->withinRateLimit("telegram:{$inbound->customer_id}")) {
            Log::info('ProcessAiChatAutoReply skipped (telegram): rate limit exceeded');

            return;
        }

        $history = TelegramMessage::query()
            ->where('bot_id', $inbound->bot_id)
            ->where('customer_id', $inbound->customer_id)
            ->where('id', '<', $inbound->id)
            ->latest()
            ->limit((int) config('ai_chat.history_limit', 30))
            ->get()
            ->sortBy('created_at')
            ->values();

        $language = LanguageDetector::detect((string) $inbound->text);

        $context = new ChatContext(
            platform: 'telegram',
            seller: $seller,
            state: $state,
            language: $language,
            bot: $inbound->bot,
            customer: $inbound->customer,
        );

        $agent = new SellerChatAgent($context, $this->historyToMessages($history));

        $action = $agent->reply((string) $inbound->text);

        $this->dispatchTelegramAction($sender, $context, $action);
    }

    protected function handleInstagram(SellerChatMessageSender $sender): void
    {
        $inbound = InstagramMessage::query()
            ->with(['instagramAccount'])
            ->find($this->instagramMessageId);

        if (! $inbound || ! $inbound->instagramAccount) {
            Log::info('ProcessAiChatAutoReply skipped (instagram): missing inbound or account');

            return;
        }

        if ($inbound->direction !== 'in') {
            Log::info('ProcessAiChatAutoReply skipped (instagram): not an inbound message');

            return;
        }

        $seller = User::query()->find($inbound->seller_id);

        if (! $seller || ! $seller->ai_auto_reply_enabled) {
            Log::info('ProcessAiChatAutoReply skipped (instagram): seller auto-reply off or unknown seller', [
                'seller_id' => $inbound->seller_id,
            ]);

            return;
        }

        if (! $this->hasAiKeyConfigured()) {
            Log::warning('ProcessAiChatAutoReply skipped (instagram): no AI provider key configured');

            return;
        }

        $state = AiChatConversationState::forInstagram(
            $inbound->instagram_account_id,
            $inbound->sender_instagram_id,
        );

        if (! $state->canAiReply((int) config('ai_chat.max_replies_per_conversation'))) {
            Log::info('ProcessAiChatAutoReply skipped (instagram): max replies reached or handed off', [
                'reply_count' => $state->ai_reply_count,
                'handed_off' => $state->handed_off_to_seller,
            ]);

            return;
        }

        if (! $this->withinRateLimit("instagram:{$inbound->sender_instagram_id}")) {
            Log::info('ProcessAiChatAutoReply skipped (instagram): rate limit exceeded');

            return;
        }

        $history = InstagramMessage::query()
            ->where('instagram_account_id', $inbound->instagram_account_id)
            ->where('sender_instagram_id', $inbound->sender_instagram_id)
            ->where('id', '<', $inbound->id)
            ->latest()
            ->limit((int) config('ai_chat.history_limit', 30))
            ->get()
            ->sortBy('created_at')
            ->values();

        $language = LanguageDetector::detect((string) $inbound->text);

        $context = new ChatContext(
            platform: 'instagram',
            seller: $seller,
            state: $state,
            language: $language,
            instagramAccount: $inbound->instagramAccount,
            senderInstagramId: (string) $inbound->sender_instagram_id,
        );

        $agent = new SellerChatAgent($context, $this->historyToMessages($history));

        $action = $agent->reply((string) $inbound->text);

        $this->dispatchInstagramAction($sender, $context, $action);
    }

    /**
     * @param  Collection<int, TelegramMessage|InstagramMessage>  $history
     * @return array<int, UserMessage|AssistantMessage>
     */
    protected function historyToMessages(Collection $history): array
    {
        $messages = [];

        foreach ($history as $row) {
            $text = (string) $row->text;

            if ($text === '') {
                continue;
            }

            $messages[] = $row->direction === 'in'
                ? new UserMessage($text)
                : new AssistantMessage($text);
        }

        return $messages;
    }

    protected function dispatchTelegramAction(SellerChatMessageSender $sender, ChatContext $context, ChatAction $action): void
    {
        if (! $action->shouldSend()) {
            Log::info('ProcessAiChatAutoReply silent (telegram)', ['action' => $action->action]);

            return;
        }

        $sender->sendTelegram($context->bot, $context->customer, (string) $action->text);

        $context->state->markAiReplied();

        Log::info('ProcessAiChatAutoReply sent (telegram)', [
            'action' => $action->action,
            'customer_id' => $context->customer->id,
        ]);
    }

    protected function dispatchInstagramAction(SellerChatMessageSender $sender, ChatContext $context, ChatAction $action): void
    {
        if (! $action->shouldSend()) {
            Log::info('ProcessAiChatAutoReply silent (instagram)', ['action' => $action->action]);

            return;
        }

        $sender->sendInstagram(
            $context->seller,
            $context->instagramAccount,
            (string) $context->senderInstagramId,
            (string) $action->text,
        );

        $context->state->markAiReplied();

        Log::info('ProcessAiChatAutoReply sent (instagram)', [
            'action' => $action->action,
            'sender_instagram_id' => $context->senderInstagramId,
        ]);
    }

    protected function hasAiKeyConfigured(): bool
    {
        $provider = (string) config('ai.default', 'openai');

        return filled(config("ai.providers.{$provider}.key"));
    }

    protected function withinRateLimit(string $key): bool
    {
        $limit = (int) config('ai_chat.rate_limit_per_hour');

        if ($limit <= 0) {
            return true;
        }

        return RateLimiter::attempt(
            'ai_chat:'.$key,
            $limit,
            fn () => true,
            3600,
        ) !== false;
    }
}
