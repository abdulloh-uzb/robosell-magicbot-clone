<?php

namespace App\Ai\Tools;

use App\Ai\Support\ChatContext;
use App\Ai\Support\ToolOutcome;
use App\Notifications\SellerAiEventNotification;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ReportOffTopic implements Tool
{
    public function __construct(
        protected ChatContext $context,
        protected ToolOutcome $outcome,
    ) {}

    public function description(): string
    {
        return 'Call this when the customer asks about anything unrelated to this shop (weather, jokes, code, trivia, politics, general chit-chat, etc.). After calling this tool, stop and do not write any reply — the system will handle it.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'reason' => $schema->string()
                ->description('A short description of the off-topic request (for the seller\'s records).')
                ->required(),
        ];
    }

    public function handle(Request $request): string
    {
        $reason = (string) ($request['reason'] ?? 'off-topic');

        $this->outcome->offTopicReported = true;

        $this->context->seller->notify(new SellerAiEventNotification(
            event: 'off_topic',
            payload: [
                'reason' => $reason,
                'platform' => $this->context->platform,
                'customer_name' => $this->context->customer?->first_name,
                'sender_instagram_id' => $this->context->senderInstagramId,
                'is_first_off_topic' => $this->context->state->isFirstOffTopic(),
            ],
        ));

        return 'off_topic_recorded';
    }
}
