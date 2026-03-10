<?php

namespace App\Http\Middleware;

use App\Models\Bot;
use App\Models\Customer;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyTelegramWebAppData
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $initData = $request->header('X-Telegram-Init-Data');

        if (! $initData) {
            return response()->json(['message' => 'Unauthorized. Missing Telegram Init Data.'], 401);
        }

        // The bot should be passed via route parameter
        $bot = $request->route('bot');
        if (! $bot) {
            return response()->json(['message' => 'Bot not found.'], 404);
        }

        parse_str($initData, $parsedData);
        if (! isset($parsedData['hash'])) {
            return response()->json(['message' => 'Invalid init data.'], 401);
        }

        $hash = $parsedData['hash'];
        unset($parsedData['hash']);

        // Sort alphabetically
        ksort($parsedData);

        $dataCheckString = [];
        foreach ($parsedData as $key => $value) {
            $dataCheckString[] = $key.'='.$value;
        }
        $dataCheckString = implode("\n", $dataCheckString);

        $secretKey = hash_hmac('sha256', $bot->token, 'WebAppData', true);
        $calculatedHash = bin2hex(hash_hmac('sha256', $dataCheckString, $secretKey, true));

        // Note: For real production, we should also check auth_date to prevent replay attacks (e.g., expiry after 24 hours).
        if (! hash_equals($calculatedHash, $hash)) {
            return response()->json(['message' => 'Invalid Telegram Hash signature.'], 401);
        }

        // Authenticated. Get or Create Customer object
        $userJson = json_decode($parsedData['user'], true);

        $customer = Customer::firstOrCreate(
            ['telegram_id' => $userJson['id']],
            [
                'first_name' => $userJson['first_name'] ?? null,
                'last_name' => $userJson['last_name'] ?? null,
                'username' => $userJson['username'] ?? null,
            ]
        );

        // Ensure the customer is attached to this bot
        if (! $customer->bots()->where('bot_id', $bot->id)->exists()) {
            $customer->bots()->attach($bot->id, ['seller_id' => $bot->seller_id]);
        }

        // Attach customer to the request for easy access
        $request->attributes->set('customer', $customer);

        return $next($request);
    }
}
