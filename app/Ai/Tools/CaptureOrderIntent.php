<?php

namespace App\Ai\Tools;

use App\Ai\Support\ChatContext;
use App\Ai\Support\ToolOutcome;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Notifications\SellerAiEventNotification;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class CaptureOrderIntent implements Tool
{
    public function __construct(
        protected ChatContext $context,
        protected ToolOutcome $outcome,
    ) {}

    public function description(): string
    {
        return 'Capture the customer\'s purchase intent as a draft order when they have clearly confirmed a specific product and quantity. The seller will follow up to finalise. Only use product_id values returned earlier by SearchProducts — never invent IDs.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'product_id' => $schema->integer()
                ->description('The ID of the product the customer wants. Must match a product returned by SearchProducts.')
                ->required(),
            'variant_id' => $schema->integer()
                ->description('Variant ID if the customer picked one; use 0 if the product has no variant or is default.')
                ->min(0)
                ->required(),
            'quantity' => $schema->integer()
                ->description('How many units the customer wants. Default 1 if not specified.')
                ->min(1)
                ->required(),
            'customer_notes' => $schema->string()
                ->description('Extra notes for the order, or an empty string if none.')
                ->required(),
        ];
    }

    public function handle(Request $request): string
    {
        $productId = (int) ($request['product_id'] ?? 0);
        $variantId = (int) ($request['variant_id'] ?? 0);
        $variantId = $variantId > 0 ? $variantId : null;
        $quantity = max(1, (int) ($request['quantity'] ?? 1));
        $notesRaw = (string) ($request['customer_notes'] ?? '');
        $notes = $notesRaw !== '' ? $notesRaw : null;

        $product = Product::query()
            ->withoutGlobalScope('seller')
            ->where('seller_id', $this->context->sellerId())
            ->when(
                $this->context->botId(),
                fn ($q) => $q->where('bot_id', $this->context->botId())
            )
            ->find($productId);

        if (! $product) {
            return json_encode([
                'success' => false,
                'error' => 'Product not found in this shop. Do not retry with a different ID.',
            ], JSON_UNESCAPED_UNICODE);
        }

        $unitPrice = (float) $product->price;

        if ($variantId) {
            $variant = ProductVariant::query()
                ->where('product_id', $product->id)
                ->find($variantId);

            if ($variant) {
                $unitPrice = (float) $variant->price;
            } else {
                $variantId = null;
            }
        }

        $customerId = $this->context->customer?->id;

        if (! $customerId) {
            return json_encode([
                'success' => false,
                'error' => 'Customer identity unknown for this channel; cannot create an order record.',
            ], JSON_UNESCAPED_UNICODE);
        }

        $order = Order::query()->create([
            'seller_id' => $this->context->sellerId(),
            'bot_id' => $this->context->botId(),
            'customer_id' => $customerId,
            'total_amount' => $unitPrice * $quantity,
            'status' => OrderStatus::AiCaptured->value,
            'payment_status' => 'unpaid',
        ]);

        OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'variant_id' => $variantId,
            'quantity' => $quantity,
            'price' => $unitPrice,
        ]);

        $this->outcome->orderCaptured = true;
        $this->outcome->capturedOrderId = $order->id;

        $this->context->seller->notify(new SellerAiEventNotification(
            event: 'order_captured',
            payload: [
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'variant_id' => $variantId,
                'quantity' => $quantity,
                'total_amount' => $order->total_amount,
                'customer_notes' => $notes,
                'platform' => $this->context->platform,
                'customer_name' => $this->context->customer?->first_name,
            ],
        ));

        return json_encode([
            'success' => true,
            'order_id' => $order->id,
            'message' => 'Draft order captured; seller will follow up.',
        ], JSON_UNESCAPED_UNICODE);
    }
}
