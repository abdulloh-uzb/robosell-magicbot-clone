<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TelegramMessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $sellerId,
        public array $messageData,
    ) {
        //
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('seller.' . $this->sellerId),
        ];
    }

    public function broadcastWith(): array
    {
        return $this->messageData;
    }

    public function broadcastAs(): string
    {
        return 'TelegramMessageReceived';
    }
}
