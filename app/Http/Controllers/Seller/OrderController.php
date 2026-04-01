<?php

namespace App\Http\Controllers\Seller;

use App\Enums\OrderStatus;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;
use SergiX44\Nutgram\Nutgram;
use Throwable;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = $request->query('tab', 'all');
        $search = $request->query('search', '');

        $query = Order::with(['customer', 'items.product'])->latest();

        // Tab filter
        match ($tab) {
            'pending' => $query->where('status', 'pending'),
            'confirmed' => $query->where('status', 'confirmed'),
            'shipped' => $query->where('status', 'shipped'),
            'delivered' => $query->where('status', 'delivered'),
            'cancelled' => $query->where('status', 'cancelled'),
            'overdue' => $query->where('status', 'pending')->where('created_at', '<', Carbon::now()->subDay()),
            default => null,
        };

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($q) => $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%"));
            });
        }

        $orders = $query->paginate(15)->withQueryString();

        // Tab counts
        $base = Order::query();
        $counts = [
            'all' => $base->count(),
            'pending' => (clone $base)->where('status', 'pending')->count(),
            'confirmed' => (clone $base)->where('status', 'confirmed')->count(),
            'shipped' => (clone $base)->where('status', 'shipped')->count(),
            'delivered' => (clone $base)->where('status', 'delivered')->count(),
            'cancelled' => (clone $base)->where('status', 'cancelled')->count(),
            'overdue' => (clone $base)->where('status', 'pending')->where('created_at', '<', Carbon::now()->subDay())->count(),
        ];

        return Inertia::render('seller/orders/index', [
            'orders' => $orders,
            'counts' => $counts,
            'tab' => $tab,
            'search' => $search,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['customer', 'items.product']);

        return Inertia::render('seller/orders/show', [
            'order' => $order,
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'status' => ['required', new Enum(OrderStatus::class)],
        ]);

        $order->update(['status' => $request->status]);

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

        return back()->with('success', 'Order status updated.');
    }
}
