<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\InstagramAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class InstagramController extends Controller
{
    public function show(Request $request): Response
    {
        $account = $request->user()
            ->instagramAccount()
            ->first();

        return Inertia::render('settings/instagram', [
            'instagram_account' => $account ? [
                'id' => $account->id,
                'username' => $account->username,
                'instagram_user_id' => $account->instagram_user_id,
                'token_expires_at' => $account->token_expires_at,
            ] : null,
        ]);
    }

    public function connect(Request $request): RedirectResponse
    {
        if ($request->user()->instagramAccount()->exists()) {
            return to_route('instagram.show');
        }

        $scope = rawurlencode('instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights');
        $clientId = config('instagram.app_id');
        $redirectUri = config('instagram.redirect_uri');

        return redirect("https://www.instagram.com/oauth/authorize?force_reauth=true&client_id={$clientId}&redirect_uri={$redirectUri}&response_type=code&scope={$scope}");
    }

    public function callback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            \Log::error('Instagram OAuth error', ['error' => $request->query('error'), 'description' => $request->query('error_description')]);

            return to_route('instagram.show')->with('error', $request->query('error_description', 'Authorization denied.'));
        }

        $request->validate(['code' => 'required|string']);

        \Log::info('Instagram callback', [
            'code' => $request->code,
            'redirect_uri' => config('instagram.redirect_uri'),
            'client_id' => config('instagram.app_id'),
        ]);

        // Exchange code for short-lived token
        $response = Http::asMultipart()->post('https://api.instagram.com/oauth/access_token', [
            ['name' => 'client_id', 'contents' => config('instagram.app_id')],
            ['name' => 'client_secret', 'contents' => config('instagram.app_secret')],
            ['name' => 'grant_type', 'contents' => 'authorization_code'],
            ['name' => 'redirect_uri', 'contents' => config('instagram.redirect_uri')],
            ['name' => 'code', 'contents' => $request->code],
        ]);

        if ($response->failed()) {
            \Log::error('Instagram token exchange failed', ['body' => $response->body(), 'status' => $response->status()]);

            return to_route('instagram.show')->with('error', 'Token exchange failed: '.$response->body());
        }

        $shortToken = $response->json('access_token');
        $instagramUserId = (string) $response->json('user_id');

        // Exchange for long-lived token
        $longResponse = Http::get('https://graph.instagram.com/access_token', [
            'grant_type' => 'ig_exchange_token',
            'client_secret' => config('instagram.app_secret'),
            'access_token' => $shortToken,
        ]);

        $accessToken = $longResponse->json('access_token') ?? $shortToken;
        $expiresIn = $longResponse->json('expires_in');

        // Fetch username
        $profileResponse = Http::get("https://graph.instagram.com/{$instagramUserId}", [
            'fields' => 'username',
            'access_token' => $accessToken,
        ]);
        $username = $profileResponse->json('username') ?? 'unknown';

        // Fetch IGSID (messaging-context ID used in webhook events)
        $igsid = null;
        $convoResponse = Http::get("https://graph.instagram.com/v22.0/{$instagramUserId}/conversations", [
            'platform' => 'instagram',
            'fields' => 'participants',
            'limit' => 1,
            'access_token' => $accessToken,
        ]);
        if ($convoResponse->successful()) {
            $conversations = $convoResponse->json('data') ?? [];
            if (! empty($conversations)) {
                foreach ($conversations[0]['participants']['data'] ?? [] as $participant) {
                    if ($participant['username'] === $username) {
                        $igsid = (string) $participant['id'];
                        break;
                    }
                }
            }
        }

        // Subscribe this account to webhook message events
        Http::post("https://graph.instagram.com/v22.0/{$instagramUserId}/subscribed_apps", [
            'subscribed_fields' => 'messages',
            'access_token' => $accessToken,
        ]);

        \Log::info('Instagram saving account', ['user_id' => $instagramUserId, 'igsid' => $igsid, 'username' => $username, 'seller_id' => $request->user()->id]);
        InstagramAccount::updateOrCreate(
            ['seller_id' => $request->user()->id],
            [
                'instagram_user_id' => $instagramUserId,
                'igsid' => $igsid ?? $instagramUserId,
                'username' => $username,
                'access_token' => $accessToken,
                'token_expires_at' => $expiresIn ? now()->addSeconds($expiresIn) : null,
            ]
        );

        return to_route('instagram.show')->with('status', 'instagram-connected');
    }

    public function disconnect(Request $request): RedirectResponse
    {
        $request->user()->instagramAccount()->delete();

        return to_route('instagram.show')->with('status', 'instagram-disconnected');
    }
}
