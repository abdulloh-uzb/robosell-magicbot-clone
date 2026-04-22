<?php

namespace App\Notifications;

use App\Models\User;
use App\Notifications\Channels\TelegramChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SellerAiEventNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $event,
        public array $payload = [],
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if ($notifiable instanceof User) {
            if (filled($notifiable->notification_email)) {
                $channels[] = 'mail';
            }

            if (filled($notifiable->notification_telegram_chat_id) && $notifiable->bot && $notifiable->bot->token) {
                $channels[] = TelegramChannel::class;
            }
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $to = $notifiable instanceof User ? ($notifiable->notification_email ?: $notifiable->email) : null;

        $mail = (new MailMessage)
            ->subject('['.$this->eventLabel().'] AI chat event')
            ->line($this->eventLabel().' bo\'yicha bildirishnoma.');

        foreach ($this->flattenedPayload() as $key => $value) {
            $mail->line("**{$key}**: {$value}");
        }

        if ($to) {
            $mail->to($to);
        }

        return $mail;
    }

    public function toTelegram(object $notifiable): string
    {
        $lines = ['<b>'.e($this->eventLabel()).'</b>'];

        foreach ($this->flattenedPayload() as $key => $value) {
            $lines[] = e($key).': '.e((string) $value);
        }

        return implode("\n", $lines);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'event' => $this->event,
            'payload' => $this->payload,
        ];
    }

    protected function eventLabel(): string
    {
        return match ($this->event) {
            'off_topic' => 'Off-topic message',
            'order_captured' => 'Yangi buyurtma (AI qabul qildi)',
            'handoff_requested' => 'Sotuvchi aralashuvi kerak',
            'product_not_found' => 'Mahsulot topilmadi',
            default => ucfirst(str_replace('_', ' ', $this->event)),
        };
    }

    /**
     * @return array<string, string>
     */
    protected function flattenedPayload(): array
    {
        $flat = [];

        foreach ($this->payload as $key => $value) {
            if (is_scalar($value) || $value === null) {
                $flat[$key] = (string) ($value ?? '—');
            } else {
                $flat[$key] = json_encode($value, JSON_UNESCAPED_UNICODE);
            }
        }

        return $flat;
    }
}
