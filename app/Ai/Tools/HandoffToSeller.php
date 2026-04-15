<?php

namespace App\Ai\Tools;

use App\Ai\Support\ChatContext;
use App\Ai\Support\ToolOutcome;
use App\Notifications\SellerAiEventNotification;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class HandoffToSeller implements Tool
{
    public function __construct(
        protected ChatContext $context,
        protected ToolOutcome $outcome,
    ) {}

    public function description(): string
    {
        return 'Call this when you cannot confidently help the customer from catalog/shop-info data — e.g. the product is not in the catalog, the customer is filing a complaint, asking for a refund, or the question requires human judgement. After calling this tool, stop and do not write any reply.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'reason' => $schema->string()
                ->description('Why the conversation needs a human seller.')
                ->enum(['product_not_found', 'complaint', 'refund', 'complex_question'])
                ->required(),
            'details' => $schema->string()
                ->description('A short summary for the seller, or an empty string if not applicable.')
                ->required(),
        ];
    }

    public function handle(Request $request): string
    {
        $reason = (string) ($request['reason'] ?? 'complex_question');
        $detailsRaw = (string) ($request['details'] ?? '');
        $details = $detailsRaw !== '' ? $detailsRaw : null;

        $this->outcome->handoffRequested = true;
        $this->outcome->handoffReason = $reason;

        $this->context->seller->notify(new SellerAiEventNotification(
            event: 'handoff_requested',
            payload: [
                'reason' => $reason,
                'details' => $details,
                'platform' => $this->context->platform,
                'customer_name' => $this->context->customer?->first_name,
                'sender_instagram_id' => $this->context->senderInstagramId,
            ],
        ));

        return 'handoff_recorded';
    }
}
