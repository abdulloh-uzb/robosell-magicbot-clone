<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiChatConversationState extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'handed_off_to_seller' => 'boolean',
            'last_reply_at' => 'datetime',
        ];
    }

    public function bot(): BelongsTo
    {
        return $this->belongsTo(Bot::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function instagramAccount(): BelongsTo
    {
        return $this->belongsTo(InstagramAccount::class);
    }

    public static function forTelegram(int $botId, int $customerId): self
    {
        return self::firstOrCreate(
            ['bot_id' => $botId, 'customer_id' => $customerId],
            ['platform' => 'telegram']
        );
    }

    public static function forInstagram(int $accountId, string $senderInstagramId): self
    {
        return self::firstOrCreate(
            ['instagram_account_id' => $accountId, 'sender_instagram_id' => $senderInstagramId],
            ['platform' => 'instagram']
        );
    }

    public function canAiReply(int $maxReplies): bool
    {
        if ($this->handed_off_to_seller) {
            return false;
        }

        return $this->ai_reply_count < $maxReplies;
    }

    public function markAiReplied(): void
    {
        $this->increment('ai_reply_count');
        $this->forceFill(['last_reply_at' => now()])->save();
    }

    public function markOffTopic(): void
    {
        $this->increment('off_topic_count');
    }

    public function markHandedOff(): void
    {
        $this->forceFill(['handed_off_to_seller' => true])->save();
    }

    public function isFirstOffTopic(): bool
    {
        return (int) ($this->off_topic_count ?? 0) === 0;
    }
}
