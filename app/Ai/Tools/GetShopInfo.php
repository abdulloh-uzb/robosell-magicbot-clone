<?php

namespace App\Ai\Tools;

use App\Ai\Support\ChatContext;
use App\Models\PaymentSetting;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class GetShopInfo implements Tool
{
    public function __construct(protected ChatContext $context) {}

    public function description(): string
    {
        return 'Get the shop\'s own policies: enabled payment methods and delivery information written by the seller. Use this when the customer asks about payment, delivery, shipping, or shop policies. Never invent policies outside of what this returns.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [];
    }

    public function handle(Request $request): string
    {
        $seller = $this->context->seller;

        $paymentsQuery = PaymentSetting::query()
            ->withoutGlobalScope('seller')
            ->where('seller_id', $seller->id)
            ->where('enabled', true);

        if ($this->context->botId()) {
            $paymentsQuery->where('bot_id', $this->context->botId());
        }

        $payments = $paymentsQuery->pluck('type')->all();

        $data = [
            'shop_name' => $seller->name,
            'accepted_payment_methods' => $payments,
            'delivery_info' => $seller->delivery_info,
            'branches' => [],
        ];

        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}
