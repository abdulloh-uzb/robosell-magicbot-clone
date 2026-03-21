<?php

namespace App\Jobs;

use App\Events\TelegramMessageReceived;
use App\Models\Bot;
use App\Models\Customer;
use App\Models\TelegramMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use SergiX44\Nutgram\Nutgram;
use SergiX44\Nutgram\Telegram\Types\Common\Update;
use Throwable;

class ProcessTelegramWebhook implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Bot $bot,
        public array $payload
    ) {}

    public function handle(): void
    {
        try {
            $nutgram = new Nutgram($this->bot->token);

            $this->registerHandlers($nutgram);

            $update = $nutgram->getContainer()->get(\SergiX44\Nutgram\Hydrator\Hydrator::class)->hydrate($this->payload, Update::class);
            $nutgram->processUpdate($update);
        } catch (Throwable $e) {
            report($e);
        }
    }

    protected function registerHandlers(Nutgram $nutgram): void
    {
        $nutgram->onCommand('start', function (Nutgram $bot) {
            $user = $bot->user();
            if ($user) {
                Customer::updateOrCreate(
                    ['telegram_id' => $user->id],
                    [
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'username' => $user->username,
                    ]
                );
            }

            $webAppUrl = config('app.url')."/store/{$this->bot->username}";

            $bot->sendMessage(
                text: "Welcome to <b>{$this->bot->name}</b>!\n\nClick the button below to browse our products and place an order.",
                parse_mode: \SergiX44\Nutgram\Telegram\Properties\ParseMode::HTML,
                reply_markup: \SergiX44\Nutgram\Telegram\Types\Keyboard\InlineKeyboardMarkup::make()
                    ->addRow(
                        \SergiX44\Nutgram\Telegram\Types\Keyboard\InlineKeyboardButton::make(
                            text: '🛍️ Open Store',
                            web_app: new \SergiX44\Nutgram\Telegram\Types\WebApp\WebAppInfo($webAppUrl)
                        )
                    )
                    ->addRow(
                        \SergiX44\Nutgram\Telegram\Types\Keyboard\InlineKeyboardButton::make(
                            text: '📦 My Orders',
                            web_app: new \SergiX44\Nutgram\Telegram\Types\WebApp\WebAppInfo($webAppUrl.'/orders')
                        )
                    )
            );
        });

        // Save group/channel messages
        $nutgram->onText('.*', function (Nutgram $bot) {
            $user = $bot->user();
            $message = $bot->message();

            if (! $user || ! $message?->text) {
                return;
            }

            $chatType = $message->chat?->type ?? 'private';
            $chatId = (string) $message->chat?->id;

            if (in_array($chatType, ['group', 'supergroup', 'channel'])) {
                // Only save if this bot has this channel/group connected
                if ($this->bot->channel_id === $chatId) {
                    $senderName = trim("{$user->first_name} ".($user->last_name ?? ''));

                    $saved = TelegramMessage::create([
                        'bot_id' => $this->bot->id,
                        'customer_id' => null,
                        'group_chat_id' => $chatId,
                        'sender_telegram_id' => (string) $user->id,
                        'sender_name' => $senderName,
                        'direction' => 'in',
                        'text' => $message->text,
                        'telegram_message_id' => $message->message_id,
                    ]);

                    TelegramMessageReceived::dispatch($this->bot->seller_id, [
                        'id' => $saved->id,
                        'type' => 'group',
                        'group_chat_id' => $chatId,
                        'sender_name' => $senderName,
                        'text' => $saved->text,
                        'direction' => 'in',
                        'created_at' => $saved->created_at->toISOString(),
                    ]);
                }

                return;
            }

            // Private message from customer
            $customer = Customer::where('telegram_id', $user->id)->first();

            if (! $customer) {
                return;
            }

            $saved = TelegramMessage::create([
                'bot_id' => $this->bot->id,
                'customer_id' => $customer->id,
                'direction' => 'in',
                'text' => $message->text,
                'telegram_message_id' => $message->message_id,
            ]);

            TelegramMessageReceived::dispatch($this->bot->seller_id, [
                'id' => $saved->id,
                'type' => 'private',
                'customer_id' => $customer->id,
                'customer_name' => trim("{$customer->first_name} {$customer->last_name}"),
                'text' => $saved->text,
                'direction' => 'in',
                'created_at' => $saved->created_at->toISOString(),
            ]);
        });
    }
}
