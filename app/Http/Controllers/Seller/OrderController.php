<?php

namespace App\Http\Controllers\Seller;

use App\Enums\OrderStatus;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use SergiX44\Nutgram\Nutgram;
use Throwable;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['customer', 'items.product'])->latest()->paginate(15);

        return Inertia::render('seller/orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['customer', 'items.product']);

        return Inertia::render('seller/orders/show', [
            'order' => $order,
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => ['required', new Enum(OrderStatus::class)],
        ]);

        $order->update(['status' => $request->status]);

        // Broadcast to store (customer side)
        OrderStatusUpdated::dispatch($order);

        try {
            $order->load(['customer', 'bot']);
            if ($order->customer && $order->bot) {
                $nutgram = new Nutgram($order->bot->token);
                $nutgram->sendMessage(
                    "📦 Your order #{$order->id} status has been updated to: *{$order->status->value}*",
                    ['chat_id' => $order->customer->telegram_id, 'parse_mode' => 'Markdown']
                );
            }
        } catch (Throwable $e) {
            report($e);
        }

        return back()->with('success', 'Order status updated successfully.');
    }
}
