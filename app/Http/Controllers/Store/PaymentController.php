<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Bot;
use App\Models\Order;
use App\Models\PaymentSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function clickRedirect(Bot $bot, Order $order): RedirectResponse
    {
        $setting = PaymentSetting::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('type', 'click')
            ->where('enabled', true)
            ->firstOrFail();

        $credentials = $setting->credentials ?? [];
        $serviceId = $credentials['service_id'] ?? '';
        $merchantId = $credentials['merchant_id'] ?? '';
        $returnUrl = url("/store/{$bot->username}/payment/return/{$order->id}");

        $url = 'https://my.click.uz/services/pay?'.http_build_query([
            'service_id' => $serviceId,
            'merchant_id' => $merchantId,
            'amount' => (float) $order->total_amount,
            'transaction_param' => $order->id,
            'return_url' => $returnUrl,
        ]);

        return redirect()->away($url);
    }

    public function paymeRedirect(Bot $bot, Order $order): RedirectResponse
    {
        $setting = PaymentSetting::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('type', 'payme')
            ->where('enabled', true)
            ->firstOrFail();

        $credentials = $setting->credentials ?? [];
        $merchantId = $credentials['merchant_id'] ?? '';
        $amountTiyin = (int) ($order->total_amount * 100);

        $payload = base64_encode("m={$merchantId};ac.order_id={$order->id};a={$amountTiyin};l=uz");
        $url = "https://checkout.paycom.uz/{$payload}";

        return redirect()->away($url);
    }

    public function return(Bot $bot, Order $order): Response
    {
        $order->refresh();

        return Inertia::render('store/payment-return', [
            'bot' => $bot,
            'order' => $order->only(['id', 'total_amount', 'payment_status', 'payment_method']),
        ]);
    }
}
