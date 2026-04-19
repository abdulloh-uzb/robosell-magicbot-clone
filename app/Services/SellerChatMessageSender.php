<?php

namespace App\Services;

use App\Models\Bot;
use App\Models\Customer;
use App\Models\InstagramAccount;
use App\Models\InstagramMessage;
use App\Models\TelegramMessage;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use SergiX44\Nutgram\Nutgram;
use Throwable;

class SellerChatMessageSender
{
    public function sendTelegram(Bot $bot, Customer $customer, string $text): TelegramMessage
    {
        $message = TelegramMessage::create([
            'bot_id' => $bot->id,
            'customer_id' => $customer->id,
            'direction' => 'out',
            'text' => $text,
        ]);

        try {
            $nutgram = new Nutgram($bot->token);
            $sent = $nutgram->sendMessage(
                $text,
                $customer->telegram_id,
            );
            if ($sent) {
                $message->update(['telegram_message_id' => $sent->message_id]);
            }
        } catch (Throwable $e) {
            report($e);
        }

        $message->refresh();

        return $message;
    }

    public function sendInstagram(User $seller, InstagramAccount $account, string $recipientInstagramScopedId, string $text): InstagramMessage
    {
        $message = InstagramMessage::create([
            'seller_id' => $seller->id,
            'instagram_account_id' => $account->id,
            'sender_instagram_id' => $recipientInstagramScopedId,
            'direction' => 'out',
            'text' => $text,
        ]);

        try {
            $response = Http::post("https://graph.instagram.com/v22.0/{$account->instagram_user_id}/messages", [
                'recipient' => ['id' => $recipientInstagramScopedId],
                'message' => ['text' => $text],
                'access_token' => $account->access_token,
            ]);

            if ($response->successful()) {
                $message->update(['instagram_message_id' => $response->json('message_id')]);
            }
        } catch (Throwable $e) {
            report($e);
        }

        $message->refresh();

        return $message;
    }
}
