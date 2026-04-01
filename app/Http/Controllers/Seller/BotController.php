<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Bot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class BotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bots = Bot::where('seller_id', auth()->id())->latest()->get();

        return Inertia::render('settings/bots/index', [
            'bots' => $bots,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'token' => 'required|string|unique:bots,token',
        ]);

        $response = Http::get("https://api.telegram.org/bot{$request->token}/getMe");

        if (! $response->successful() || ! $response->json('ok')) {
            return back()->withErrors(['token' => 'Invalid bot token.']);
        }

        $botData = $response->json('result');

        $bot = $request->user()->bot()->create([
            'token' => $request->token,
            'username' => $botData['username'],
            'name' => $botData['first_name'],
        ]);

        $webhookUrl = config('app.url').'/webhook/'.$bot->id;
        Http::post("https://api.telegram.org/bot{$request->token}/setWebhook", [
            'url' => $webhookUrl,
        ]);

        return back()->with('success', 'Bot added and webhook configured.');
    }

    /**
     * Update the bot's channel/group connection.
     */
    public function update(Request $request, Bot $bot): \Illuminate\Http\RedirectResponse
    {
        abort_if($bot->seller_id !== auth()->id(), 403);

        $request->validate([
            'channel_id' => ['nullable', 'string', 'max:255', 'regex:/^(@[a-zA-Z][a-zA-Z0-9_]{3,}|-[0-9]+)$/'],
        ], [
            'channel_id.regex' => 'Channel ID must be a negative number (e.g. -1001234567890) or a username starting with @ (e.g. @mychannel).',
        ]);

        $bot->update(['channel_id' => $request->channel_id ?: null]);

        return back()->with('success', 'Channel updated.');
    }

    /**
     * Re-register the webhook for the bot.
     */
    public function resetWebhook(Bot $bot): \Illuminate\Http\RedirectResponse
    {
        abort_if($bot->seller_id !== auth()->id(), 403);

        $webhookUrl = config('app.url').'/webhook/'.$bot->id;
        $response = Http::post("https://api.telegram.org/bot{$bot->token}/setWebhook", [
            'url' => $webhookUrl,
        ]);

        if (! $response->successful() || ! $response->json('ok')) {
            return back()->withErrors(['webhook' => 'Failed to reset webhook.']);
        }

        return back()->with('success', 'Webhook reset successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Bot $bot): \Illuminate\Http\RedirectResponse
    {
        abort_if($bot->seller_id !== auth()->id(), 403);

        Http::post("https://api.telegram.org/bot{$bot->token}/deleteWebhook");
        $bot->delete();

        return back()->with('success', 'Bot deleted and webhook removed.');
    }
}
