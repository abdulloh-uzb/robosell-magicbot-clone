<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Bot;
use App\Models\Customer;
use App\Models\TelegramMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use SergiX44\Nutgram\Nutgram;
use Throwable;

class ChatController extends Controller
{
    public function index()
    {
        $botId = session('bot_id');

        $conversations = TelegramMessage::query()
            ->where('bot_id', $botId)
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
                    'customer' => $row->customer,
                    'last_message' => $lastMessage,
                    'unread_count' => $unreadCount,
                ];
            });

        return Inertia::render('seller/chat/index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Customer $customer)
    {
        $botId = session('bot_id');

        // Mark incoming messages as read
        TelegramMessage::where('bot_id', $botId)
            ->where('customer_id', $customer->id)
            ->where('direction', 'in')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = TelegramMessage::where('bot_id', $botId)
            ->where('customer_id', $customer->id)
            ->oldest()
            ->get();

        return Inertia::render('seller/chat/show', [
            'customer' => $customer,
            'messages' => $messages,
        ]);
    }

    public function send(Request $request, Customer $customer)
    {
        $request->validate(['text' => 'required|string|max:4096']);

        $bot = Bot::find(session('bot_id'));

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

        return back()->with('success', 'Message sent.');
    }
}
