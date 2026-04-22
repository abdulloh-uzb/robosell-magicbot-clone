<?php

namespace App\Notifications\Channels;

use App\Models\User;
use Illuminate\Notifications\Notification;
use SergiX44\Nutgram\Nutgram;
use Throwable;

class TelegramChannel
{
    public function send(object $notifiable, Notification $notification): void
    {
        if (! $notifiable instanceof User) {
            return;
        }

        $chatId = $notifiable->notification_telegram_chat_id;

        if (! $chatId) {
            return;
        }

        $bot = $notifiable->bot;

        if (! $bot || ! $bot->token) {
            return;
        }

        if (! method_exists($notification, 'toTelegram')) {
            return;
        }

        $text = $notification->toTelegram($notifiable);

        if (! is_string($text) || $text === '') {
            return;
        }

        try {
            (new Nutgram($bot->token))->sendMessage(
                $text,
                ['chat_id' => $chatId, 'parse_mode' => 'HTML']
            );
        } catch (Throwable $e) {
            report($e);
        }
    }
}
