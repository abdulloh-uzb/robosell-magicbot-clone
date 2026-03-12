<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'phone_number' => ['required', 'string', 'max:255', 'unique:users,phone'],
            'bot_token' => ['required', 'string'],
        ])->validate();

        $response = Http::get("https://api.telegram.org/bot{$input['bot_token']}/getMe");

        if (! $response->successful() || ! $response->json('ok')) {
            throw ValidationException::withMessages([
                'bot_token' => 'Invalid bot token. Please check and try again.',
            ]);
        }

        $botData = $response->json('result');
        $plainPassword = Str::password(12, true, true, false, false);
        // using simple alphanumeric for readability

        $user = User::create([
            'name' => $botData['first_name'] ?? 'Seller',
            'email' => $input['phone_number'].'@magicbot.local', // dummy email
            'phone' => $input['phone_number'],
            'password' => Hash::make($plainPassword),
        ]);

        $user->assignRole('seller');

        $bot = $user->bot()->create([
            'token' => $input['bot_token'],
            'username' => $botData['username'],
            'name' => $botData['first_name'],
        ]);

        session(['bot_id' => $bot->id]);

        $webhookUrl = config('app.url').'/webhook/'.$bot->id;
        Http::post("https://api.telegram.org/bot{$input['bot_token']}/setWebhook", [
            'url' => $webhookUrl,
        ]);

        session()->flash('generated_password', $plainPassword);

        return $user;
    }
}
