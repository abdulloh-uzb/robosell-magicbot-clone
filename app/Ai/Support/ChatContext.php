<?php

namespace App\Ai\Support;

use App\Models\AiChatConversationState;
use App\Models\Bot;
use App\Models\Customer;
use App\Models\InstagramAccount;
use App\Models\User;

class ChatContext
{
    public function __construct(
        public readonly string $platform,
        public readonly User $seller,
        public readonly AiChatConversationState $state,
        public readonly string $language,
        public readonly ?Bot $bot = null,
        public readonly ?Customer $customer = null,
        public readonly ?InstagramAccount $instagramAccount = null,
        public readonly ?string $senderInstagramId = null,
    ) {}

    public function botId(): ?int
    {
        return $this->bot?->id;
    }

    public function sellerId(): int
    {
        return $this->seller->id;
    }
}
