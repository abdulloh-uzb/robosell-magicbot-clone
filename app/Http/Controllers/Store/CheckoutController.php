<?php

namespace App\Http\Controllers\Store;

use App\Events\OrderPlaced;
use App\Http\Controllers\Controller;
use App\Models\Bot;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use SergiX44\Nutgram\Nutgram;
use Throwable;

class CheckoutController extends Controller
{
    public function store(Request $request, Bot $bot)
    {
        $customer = $request->attributes->get('customer');

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $totalAmount = 0;
        $orderItems = [];

        foreach ($validated['items'] as $item) {
            $product = Product::withoutGlobalScope('seller')->where('bot_id', $bot->id)->findOrFail($item['product_id']);

            $price = $product->price;

            if (! empty($item['variant_id'])) {
                $variant = ProductVariant::where('product_id', $product->id)->find($item['variant_id']);
                if ($variant) {
                    $price = $variant->price;
                }
            }

            $orderItems[] = [
                'product_id' => $product->id,
                'variant_id' => $item['variant_id'] ?? null,
                'quantity' => $item['quantity'],
                'price' => $price,
            ];
            $totalAmount += ($price * $item['quantity']);
        }

        $order = Order::create([
            'seller_id' => $bot->seller_id,
            'bot_id' => $bot->id,
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => $totalAmount,
        ]);

        foreach ($orderItems as $item) {
            $item['order_id'] = $order->id;
            OrderItem::create($item);
        }

        // Broadcast to seller dashboard
        $order->load('customer');
        OrderPlaced::dispatch($order);

        try {
            $nutgram = new Nutgram($bot->token);
            $nutgram->sendMessage(
                "🛒 Your order #{$order->id} has been placed successfully!\n*Total:* \${$order->total_amount}",
                ['chat_id' => $customer->telegram_id, 'parse_mode' => 'Markdown']
            );
        } catch (Throwable $e) {
            report($e);
        }

        return response()->json(['success' => true, 'order_id' => $order->id]);
    }
}
