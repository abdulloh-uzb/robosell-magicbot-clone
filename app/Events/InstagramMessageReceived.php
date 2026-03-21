<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InstagramMessageReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $sellerId,
        public array $messageData,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("seller.{$this->sellerId}"),
        ];
    }

    public function broadcastWith(): array
    {
        return array_merge(['type' => 'instagram_message'], $this->messageData);
    }

    public function broadcastAs(): string
    {
        return 'InstagramMessageReceived';
    }
}
