<?php

use App\Http\Controllers\Seller\BotController;
use App\Http\Controllers\Settings\InstagramController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::resource('settings/bots', BotController::class)->except(['show', 'edit', 'create']);
    Route::patch('settings/bots/{bot}/channel', [BotController::class, 'update'])->name('bots.channel.update');
    Route::post('settings/bots/{bot}/reset-webhook', [BotController::class, 'resetWebhook'])->name('bots.reset-webhook');

    Route::get('settings/instagram', [InstagramController::class, 'show'])->name('instagram.show');
    Route::get('settings/instagram/connect', [InstagramController::class, 'connect'])->name('instagram.connect');
    Route::get('settings/instagram/callback', [InstagramController::class, 'callback'])->name('instagram.callback');
    Route::delete('settings/instagram', [InstagramController::class, 'disconnect'])->name('instagram.disconnect');
});
