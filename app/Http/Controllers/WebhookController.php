<?php

namespace App\Http\Controllers;

use App\Events\InstagramMessageReceived;
use App\Jobs\ProcessTelegramWebhook;
use App\Models\Bot;
use App\Models\InstagramAccount;
use App\Models\InstagramMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WebhookController extends Controller
{
    /**
     * Handle Telegram webhook.
     */
    public function __invoke(Request $request, Bot $bot): JsonResponse
    {
        ProcessTelegramWebhook::dispatch($bot, $request->all());

        return response()->json(['status' => 'ok']);
    }

    /**
     * Verify Instagram webhook (GET).
     */
    public function instagramVerify(Request $request): Response|string
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        \Log::info('Instagram webhook verify', [
            'query_string' => $request->server('QUERY_STRING'),
            'all' => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        if ($mode === 'subscribe' && $token === config('instagram.webhook_verify_token')) {
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        abort(403);
    }

    /**
     * Handle Instagram webhook (POST).
     */
    public function instagram(Request $request): JsonResponse
    {
        $payload = $request->all();

        \Log::info('Instagram webhook received', ['object' => $payload['object'] ?? null, 'payload' => $payload]);

        if (($payload['object'] ?? '') !== 'instagram') {
            return response()->json(['status' => 'ignored']);
        }

        foreach ($payload['entry'] ?? [] as $entry) {
            $instagramUserId = (string) $entry['id'];
            $account = InstagramAccount::where('igsid', $instagramUserId)
                ->orWhere('instagram_user_id', $instagramUserId)
                ->first();

            // Store IGSID for future lookups if it was missing
            if ($account && ! $account->igsid) {
                $account->update(['igsid' => $instagramUserId]);
            }

            if (! $account) {
                continue;
            }

            foreach ($entry['messaging'] ?? [] as $messagingEvent) {
                if (! isset($messagingEvent['message'])) {
                    continue;
                }

                $senderId = (string) $messagingEvent['sender']['id'];
                $text = $messagingEvent['message']['text'] ?? '';
                $messageId = $messagingEvent['message']['mid'] ?? null;

                if (empty($text) || $senderId === $instagramUserId) {
                    continue;
                }

                $message = InstagramMessage::create([
                    'seller_id' => $account->seller_id,
                    'instagram_account_id' => $account->id,
                    'sender_instagram_id' => $senderId,
                    'direction' => 'in',
                    'text' => $text,
                    'instagram_message_id' => $messageId,
                ]);

                $messageData = [
                    'id' => $message->id,
                    'sender_id' => $senderId,
                    'text' => $text,
                    'created_at' => $message->created_at,
                ];

                InstagramMessageReceived::dispatch($account->seller_id, $messageData);
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
