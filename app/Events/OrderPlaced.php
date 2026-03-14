<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderPlaced implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order)
    {
        //
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('seller.' . $this->order->seller_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'total_amount' => $this->order->total_amount,
            'status' => $this->order->status->value,
            'customer_name' => $this->order->customer?->first_name . ' ' . $this->order->customer?->last_name,
            'items_count' => $this->order->items()->count(),
            'created_at' => $this->order->created_at->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'OrderPlaced';
    }
}
