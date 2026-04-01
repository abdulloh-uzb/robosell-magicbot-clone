<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Bot;
use App\Models\Customer;
use App\Models\InstagramMessage;
use App\Models\TelegramMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use SergiX44\Nutgram\Nutgram;
use Throwable;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $botId = session('bot_id');
        $instagramAccount = $request->user()->instagramAccount()->first();

        $conversations = collect();

        // 1. Fetch Telegram Conversations
        if ($botId) {
            $telegramConvs = TelegramMessage::query()
                ->where('bot_id', $botId)
                ->whereNotNull('customer_id')
                ->with('customer')
                ->selectRaw('customer_id, MAX(created_at) as last_message_at')
                ->groupBy('customer_id')
                ->orderByDesc('last_message_at')
                ->get()
                ->map(function ($row) use ($botId) {
                    $lastMessage = TelegramMessage::where('bot_id', $botId)
                        ->where('customer_id', $row->customer_id)
                        ->latest()
                        ->first();

                    $unreadCount = TelegramMessage::where('bot_id', $botId)
                        ->where('customer_id', $row->customer_id)
                        ->where('direction', 'in')
                        ->where('is_read', false)
                        ->count();

                    return [
                        'id' => (string) $row->customer_id,
                        'platform' => 'telegram',
                        'name' => trim($row->customer->first_name.' '.$row->customer->last_name),
                        'username' => $row->customer->username,
                        'last_message' => $lastMessage ? [
                            'text' => $lastMessage->text,
                            'direction' => $lastMessage->direction,
                            'created_at' => $lastMessage->created_at,
                        ] : null,
                        'unread_count' => $unreadCount,
                        'updated_at' => $lastMessage ? $lastMessage->created_at : $row->last_message_at,
                    ];
                });

            $conversations = $conversations->merge($telegramConvs);
        }

        // 2. Fetch Instagram Conversations
        if ($instagramAccount) {
            $instagramConvs = InstagramMessage::query()
                ->where('instagram_account_id', $instagramAccount->id)
                ->selectRaw('sender_instagram_id, sender_name, MAX(created_at) as last_message_at')
                ->groupBy('sender_instagram_id', 'sender_name')
                ->orderByDesc('last_message_at')
                ->get()
                ->map(function ($row) use ($instagramAccount) {
                    $lastMessage = InstagramMessage::where('instagram_account_id', $instagramAccount->id)
                        ->where('sender_instagram_id', $row->sender_instagram_id)
                        ->latest()
                        ->first();

                    $unreadCount = InstagramMessage::where('instagram_account_id', $instagramAccount->id)
                        ->where('sender_instagram_id', $row->sender_instagram_id)
                        ->where('direction', 'in')
                        ->where('is_read', false)
                        ->count();

                    return [
                        'id' => (string) $row->sender_instagram_id,
                        'platform' => 'instagram',
                        'name' => $row->sender_name ?? $row->sender_instagram_id,
                        'username' => null,
                        'last_message' => $lastMessage ? [
                            'text' => $lastMessage->text,
                            'direction' => $lastMessage->direction,
                            'created_at' => $lastMessage->created_at,
                        ] : null,
                        'unread_count' => $unreadCount,
                        'updated_at' => $lastMessage ? $lastMessage->created_at : $row->last_message_at,
                    ];
                });

            $conversations = $conversations->merge($instagramConvs);
        }

        // Sort globally by newest message
        $conversations = $conversations->sortByDesc('updated_at')->values()->all();

        return Inertia::render('seller/chat/index', [
            'conversations' => $conversations,
        ]);
    }

    public function messages(Request $request, string $platform, string $id)
    {
        $botId = session('bot_id');
        $instagramAccount = $request->user()->instagramAccount()->first();

        if ($platform === 'telegram') {
            TelegramMessage::where('bot_id', $botId)
                ->where('customer_id', $id)
                ->where('direction', 'in')
                ->where('is_read', false)
                ->update(['is_read' => true]);

            $messages = TelegramMessage::where('bot_id', $botId)
                ->where('customer_id', $id)
                ->oldest()
                ->get()
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'direction' => $m->direction,
                    'text' => $m->text,
                    'created_at' => $m->created_at,
                ]);

            return response()->json(['messages' => $messages]);
        }

        if ($platform === 'instagram' && $instagramAccount) {
            InstagramMessage::where('instagram_account_id', $instagramAccount->id)
                ->where('sender_instagram_id', $id)
                ->where('direction', 'in')
                ->where('is_read', false)
                ->update(['is_read' => true]);

            $messages = InstagramMessage::where('instagram_account_id', $instagramAccount->id)
                ->where('sender_instagram_id', $id)
                ->oldest()
                ->get()
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'direction' => $m->direction,
                    'text' => $m->text,
                    'created_at' => $m->created_at,
                ]);

            return response()->json(['messages' => $messages]);
        }

        return response()->json(['messages' => []]);
    }

    public function send(Request $request, string $platform, string $id)
    {
        $request->validate(['text' => 'required|string|max:4096']);

        if ($platform === 'telegram') {
            $bot = Bot::where('seller_id', $request->user()->id)->find(session('bot_id'));

            if (! $bot) {
                return response()->json(['status' => 'error', 'message' => 'No active bot selected.'], 422);
            }

            $customer = Customer::findOrFail($id);

            $message = TelegramMessage::create([
                'bot_id' => $bot->id,
                'customer_id' => $customer->id,
                'direction' => 'out',
                'text' => $request->text,
            ]);

            try {
                $nutgram = new Nutgram($bot->token);
                $sent = $nutgram->sendMessage(
                    $request->text,
                    ['chat_id' => $customer->telegram_id]
                );
                if ($sent) {
                    $message->update(['telegram_message_id' => $sent->message_id]);
                }
            } catch (Throwable $e) {
                report($e);
            }

            return response()->json([
                'status' => 'success',
                'message' => [
                    'id' => $message->id,
                    'direction' => 'out',
                    'text' => $message->text,
                    'created_at' => $message->created_at,
                ],
            ]);
        }

        if ($platform === 'instagram') {
            $account = $request->user()->instagramAccount()->firstOrFail();

            $message = InstagramMessage::create([
                'seller_id' => $request->user()->id,
                'instagram_account_id' => $account->id,
                'sender_instagram_id' => $id,
                'direction' => 'out',
                'text' => $request->text,
            ]);

            try {
                $response = Http::post("https://graph.instagram.com/v22.0/{$account->instagram_user_id}/messages", [
                    'recipient' => ['id' => $id],
                    'message' => ['text' => $request->text],
                    'access_token' => $account->access_token,
                ]);

                if ($response->successful()) {
                    $message->update(['instagram_message_id' => $response->json('message_id')]);
                }
            } catch (\Throwable $e) {
                report($e);
            }

            return response()->json([
                'status' => 'success',
                'message' => [
                    'id' => $message->id,
                    'direction' => 'out',
                    'text' => $message->text,
                    'created_at' => $message->created_at,
                ],
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid platform'], 400);
    }
}
