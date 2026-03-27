<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Bot;
use App\Models\Order;
use App\Models\PaymentSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClickWebhookController extends Controller
{
    // Click error codes
    const ERROR_OK = 0;

    const ERROR_SIGN = -1;

    const ERROR_USER_NOT_FOUND = -5;

    const ERROR_TRANSACTION_NOT_FOUND = -6;

    const ERROR_BAD_REQUEST = -8;

    const ERROR_TRANSACTION_CANCELLED = -9;

    public function handle(Request $request, Bot $bot): JsonResponse
    {
        $setting = PaymentSetting::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('type', 'click')
            ->where('enabled', true)
            ->first();

        if (! $setting) {
            return response()->json(['error' => self::ERROR_BAD_REQUEST, 'error_note' => 'Click not enabled']);
        }

        $credentials = $setting->credentials ?? [];
        $secretKey = $credentials['secret_key'] ?? '';
        $serviceId = $credentials['service_id'] ?? '';

        $clickTransId = $request->input('click_trans_id');
        $merchantTransId = $request->input('merchant_trans_id'); // order_id
        $amount = $request->input('amount');
        $action = (int) $request->input('action'); // 0=prepare, 1=complete
        $error = $request->input('error');
        $signString = $request->input('sign_string');

        // Verify signature
        $expectedSign = md5($clickTransId.$serviceId.$secretKey.$merchantTransId.$amount.$action.$error);

        if ($signString !== $expectedSign) {
            return response()->json(['error' => self::ERROR_SIGN, 'error_note' => 'Invalid sign']);
        }

        $order = Order::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->find((int) $merchantTransId);

        if (! $order) {
            return response()->json(['error' => self::ERROR_USER_NOT_FOUND, 'error_note' => 'Order not found']);
        }

        if ((float) $amount !== (float) $order->total_amount) {
            return response()->json(['error' => self::ERROR_BAD_REQUEST, 'error_note' => 'Amount mismatch']);
        }

        if ($action === 0) {
            // Prepare — just verify
            return response()->json([
                'click_trans_id' => $clickTransId,
                'merchant_trans_id' => $merchantTransId,
                'merchant_prepare_id' => $order->id,
                'error' => self::ERROR_OK,
                'error_note' => 'Success',
            ]);
        }

        if ($action === 1) {
            // Complete — mark as paid
            if ((int) $error < 0) {
                $order->update(['payment_status' => 'failed']);

                return response()->json(['error' => self::ERROR_TRANSACTION_CANCELLED, 'error_note' => 'Cancelled by user']);
            }

            $order->update([
                'payment_status' => 'paid',
                'payment_transaction_id' => (string) $clickTransId,
            ]);

            return response()->json([
                'click_trans_id' => $clickTransId,
                'merchant_trans_id' => $merchantTransId,
                'merchant_confirm_id' => $order->id,
                'error' => self::ERROR_OK,
                'error_note' => 'Success',
            ]);
        }

        return response()->json(['error' => self::ERROR_BAD_REQUEST, 'error_note' => 'Unknown action']);
    }
}
