<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentSettingController extends Controller
{
    public function index(): Response
    {
        $botId = session('bot_id');

        $settings = PaymentSetting::where('bot_id', $botId)
            ->get()
            ->keyBy('type');

        $methods = collect(['click', 'payme', 'cash'])->map(function (string $type) use ($settings) {
            $setting = $settings->get($type);

            return [
                'type' => $type,
                'enabled' => $setting?->enabled ?? false,
                'credentials' => $setting?->credentials ?? [],
            ];
        })->values();

        return Inertia::render('seller/payment-settings/index', [
            'methods' => $methods,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'methods' => ['required', 'array'],
            'methods.*.type' => ['required', 'in:click,payme,cash'],
            'methods.*.enabled' => ['required', 'boolean'],
            'methods.*.credentials' => ['nullable', 'array'],
        ]);

        foreach ($validated['methods'] as $method) {
            PaymentSetting::updateOrCreate(
                ['bot_id' => session('bot_id'), 'type' => $method['type']],
                [
                    'seller_id' => auth()->id(),
                    'enabled' => $method['enabled'],
                    'credentials' => $method['credentials'] ?? null,
                ]
            );
        }

        return back()->with('success', 'Payment settings saved.');
    }
}
