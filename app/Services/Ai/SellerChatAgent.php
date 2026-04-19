<?php

namespace App\Services\Ai;

use App\Ai\Support\ChatAction;
use App\Ai\Support\ChatContext;
use App\Ai\Support\ToolOutcome;
use App\Ai\Tools\CaptureOrderIntent;
use App\Ai\Tools\GetShopInfo;
use App\Ai\Tools\HandoffToSeller;
use App\Ai\Tools\ListCategories;
use App\Ai\Tools\ReportOffTopic;
use App\Ai\Tools\SearchProducts;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\UserMessage;
use Laravel\Ai\Promptable;
use Laravel\Ai\Responses\AgentResponse;
use Throwable;

class SellerChatAgent implements Agent, Conversational, HasTools
{
    use Promptable;

    protected ToolOutcome $outcome;

    /**
     * @param  array<int, UserMessage|AssistantMessage>  $history
     */
    public function __construct(
        public ChatContext $context,
        public array $history = [],
    ) {
        $this->outcome = new ToolOutcome;
    }

    public function instructions(): string|\Stringable
    {
        return (string) config('ai_chat.instructions');
    }

    /**
     * @return iterable<UserMessage|AssistantMessage>
     */
    public function messages(): iterable
    {
        return $this->history;
    }

    /**
     * @return iterable<\Laravel\Ai\Contracts\Tool>
     */
    public function tools(): iterable
    {
        return [
            new ListCategories($this->context),
            new SearchProducts($this->context),
            new GetShopInfo($this->context),
            new ReportOffTopic($this->context, $this->outcome),
            new HandoffToSeller($this->context, $this->outcome),
            new CaptureOrderIntent($this->context, $this->outcome),
        ];
    }

    public function toolOutcome(): ToolOutcome
    {
        return $this->outcome;
    }

    /**
     * Run the agent on the given incoming customer message and return
     * a structured action describing what (if anything) to send back.
     */
    public function reply(string $incomingMessage): ChatAction
    {
        $this->outcome->reset();

        try {
            $response = $this->prompt($incomingMessage, model: (string) config('ai_chat.model'));
        } catch (Throwable $e) {
            report($e);

            return ChatAction::silent();
        }

        return $this->resolveAction($response, $this->outcome);
    }

    public function resolveAction(AgentResponse $response, ToolOutcome $outcome): ChatAction
    {
        $lang = $this->context->language;

        if ($outcome->offTopicReported) {
            if ($this->context->state->isFirstOffTopic()) {
                $this->context->state->markOffTopic();

                return ChatAction::refusal($this->localized('off_topic_first_reply', $lang));
            }

            $this->context->state->markOffTopic();

            return ChatAction::silent();
        }

        if ($outcome->handoffRequested) {
            $this->context->state->markHandedOff();

            return ChatAction::handoff($this->localized('handoff_reply', $lang));
        }

        if ($outcome->orderCaptured) {
            return ChatAction::reply($this->localized('order_captured_reply', $lang));
        }

        $text = is_string($response->text ?? null) ? trim($response->text) : '';

        if ($text === '') {
            return ChatAction::silent();
        }

        return ChatAction::reply($text);
    }

    protected function localized(string $key, string $lang): string
    {
        $map = (array) config("ai_chat.{$key}", []);

        return (string) ($map[$lang] ?? $map['uz'] ?? '');
    }
}
