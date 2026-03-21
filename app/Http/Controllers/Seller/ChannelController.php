<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Bot;
use App\Models\TelegramMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use SergiX44\Nutgram\Nutgram;
use Throwable;

class ChannelController extends Controller
{
    public function index(): Response
    {
        $botId = session('bot_id');
        $bot = Bot::find($botId);

        $messages = $bot
            ? TelegramMessage::where('bot_id', $botId)
                ->whereNotNull('group_chat_id')
                ->latest()
                ->limit(100)
                ->get()
            : collect();

        return Inertia::render('seller/channel/index', [
            'bot' => $bot ? [
                'id' => $bot->id,
                'name' => $bot->name,
                'username' => $bot->username,
                'channel_id' => $bot->channel_id,
            ] : null,
            'messages' => $messages,
        ]);
    }

    public function post(Request $request): RedirectResponse
    {
        $request->validate(['text' => 'required|string|max:4096']);

        $bot = Bot::find(session('bot_id'));

        if (! $bot || ! $bot->channel_id) {
            return back()->withErrors(['text' => 'No channel connected.']);
        }

        try {
            $nutgram = new Nutgram($bot->token);
            $sent = $nutgram->sendMessage(
                text: $request->text,
                chat_id: $bot->channel_id,
            );

            TelegramMessage::create([
                'bot_id' => $bot->id,
                'customer_id' => null,
                'group_chat_id' => $bot->channel_id,
                'direction' => 'out',
                'text' => $request->text,
                'telegram_message_id' => $sent?->message_id,
            ]);
        } catch (Throwable $e) {
            report($e);

            return back()->withErrors(['text' => 'Failed to send message: '.$e->getMessage()]);
        }

        return back()->with('success', 'Message posted to channel.');
    }
}
