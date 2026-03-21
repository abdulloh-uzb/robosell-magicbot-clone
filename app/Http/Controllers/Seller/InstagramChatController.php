<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\InstagramMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class InstagramChatController extends Controller
{
    public function index(Request $request): Response
    {
        $account = $request->user()->instagramAccount()->first();

        $conversations = [];

        if ($account) {
            $conversations = InstagramMessage::query()
                ->where('instagram_account_id', $account->id)
                ->selectRaw('sender_instagram_id, sender_name, MAX(created_at) as last_message_at')
                ->groupBy('sender_instagram_id', 'sender_name')
                ->orderByDesc('last_message_at')
                ->get()
                ->map(function ($row) use ($account) {
                    $lastMessage = InstagramMessage::where('instagram_account_id', $account->id)
                        ->where('sender_instagram_id', $row->sender_instagram_id)
                        ->latest()
                        ->first();

                    $unreadCount = InstagramMessage::where('instagram_account_id', $account->id)
                        ->where('sender_instagram_id', $row->sender_instagram_id)
                        ->where('direction', 'in')
                        ->where('is_read', false)
                        ->count();

                    return [
                        'sender_id' => $row->sender_instagram_id,
                        'sender_name' => $row->sender_name,
                        'last_message' => $lastMessage,
                        'unread_count' => $unreadCount,
                    ];
                });
        }

        return Inertia::render('seller/instagram/index', [
            'conversations' => $conversations,
            'has_account' => $account !== null,
        ]);
    }

    public function show(Request $request, string $senderId): Response
    {
        $account = $request->user()->instagramAccount()->firstOrFail();

        // Mark incoming as read
        InstagramMessage::where('instagram_account_id', $account->id)
            ->where('sender_instagram_id', $senderId)
            ->where('direction', 'in')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = InstagramMessage::where('instagram_account_id', $account->id)
            ->where('sender_instagram_id', $senderId)
            ->oldest()
            ->get();

        $senderName = $messages->first()?->sender_name ?? $senderId;

        return Inertia::render('seller/instagram/show', [
            'sender_id' => $senderId,
            'sender_name' => $senderName,
            'messages' => $messages,
        ]);
    }

    public function send(Request $request, string $senderId): \Illuminate\Http\RedirectResponse
    {
        $request->validate(['text' => 'required|string|max:1000']);

        $account = $request->user()->instagramAccount()->firstOrFail();

        $message = InstagramMessage::create([
            'seller_id' => $request->user()->id,
            'instagram_account_id' => $account->id,
            'sender_instagram_id' => $senderId,
            'direction' => 'out',
            'text' => $request->text,
        ]);

        try {
            $response = Http::post("https://graph.instagram.com/v22.0/{$account->instagram_user_id}/messages", [
                'recipient' => ['id' => $senderId],
                'message' => ['text' => $request->text],
                'access_token' => $account->access_token,
            ]);

            if ($response->successful()) {
                $message->update(['instagram_message_id' => $response->json('message_id')]);
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return back()->with('success', 'Message sent.');
    }
}
