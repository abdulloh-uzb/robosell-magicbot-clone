<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Bot;
use App\Models\Order;
use App\Models\PaymentSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PaymeWebhookController extends Controller
{
    // Payme error codes
    const ERROR_INSUFFICIENT_PRIVILEGE = -32504;

    const ERROR_INTERNAL = -32400;

    const ERROR_TRANSACTION_NOT_FOUND = -31003;

    const ERROR_ORDER_NOT_FOUND = -31050;

    const ERROR_AMOUNT_MISMATCH = -31001;

    const ERROR_TRANSACTION_ALREADY_DONE = -31060;

    // Payme transaction states
    const STATE_CREATED = 1;

    const STATE_COMPLETED = 2;

    const STATE_CANCELLED = -1;

    const STATE_CANCELLED_AFTER_COMPLETE = -2;

    public function handle(Request $request, Bot $bot): JsonResponse
    {
        $setting = PaymentSetting::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('type', 'payme')
            ->where('enabled', true)
            ->first();

        if (! $setting) {
            return $this->error(self::ERROR_INSUFFICIENT_PRIVILEGE, 'Payme not enabled');
        }

        $credentials = $setting->credentials ?? [];
        $secretKey = $credentials['secret_key'] ?? '';
        $merchantId = $credentials['merchant_id'] ?? '';

        // Verify Basic auth: "Paycom:{secret_key}"
        $authHeader = $request->header('Authorization', '');
        $expectedAuth = 'Basic '.base64_encode("Paycom:{$secretKey}");

        if ($authHeader !== $expectedAuth) {
            return $this->error(self::ERROR_INSUFFICIENT_PRIVILEGE, 'Invalid credentials');
        }

        $body = $request->json()->all();
        $method = $body['method'] ?? '';
        $params = $body['params'] ?? [];
        $id = $body['id'] ?? null;

        return match ($method) {
            'CheckPerformTransaction' => $this->checkPerformTransaction($params, $bot, $id),
            'CreateTransaction' => $this->createTransaction($params, $bot, $id),
            'PerformTransaction' => $this->performTransaction($params, $bot, $id),
            'CancelTransaction' => $this->cancelTransaction($params, $bot, $id),
            'CheckTransaction' => $this->checkTransaction($params, $bot, $id),
            default => $this->error(self::ERROR_INTERNAL, 'Unknown method', $id),
        };
    }

    private function checkPerformTransaction(array $params, Bot $bot, mixed $id): JsonResponse
    {
        $orderId = $params['account']['order_id'] ?? null;
        $amount = $params['amount'] ?? 0;

        $order = $this->findOrder($bot, $orderId);

        if (! $order) {
            return $this->error(self::ERROR_ORDER_NOT_FOUND, 'Order not found', $id);
        }

        if ((int) $amount !== (int) ($order->total_amount * 100)) {
            return $this->error(self::ERROR_AMOUNT_MISMATCH, 'Amount mismatch', $id);
        }

        return $this->result(['allow' => true], $id);
    }

    private function createTransaction(array $params, Bot $bot, mixed $id): JsonResponse
    {
        $transactionId = $params['id'] ?? null;
        $orderId = $params['account']['order_id'] ?? null;
        $amount = $params['amount'] ?? 0;

        $order = $this->findOrder($bot, $orderId);

        if (! $order) {
            return $this->error(self::ERROR_ORDER_NOT_FOUND, 'Order not found', $id);
        }

        if ((int) $amount !== (int) ($order->total_amount * 100)) {
            return $this->error(self::ERROR_AMOUNT_MISMATCH, 'Amount mismatch', $id);
        }

        // If already has a transaction, return existing
        if ($order->payment_transaction_id) {
            if ($order->payment_status === 'failed') {
                return $this->error(self::ERROR_TRANSACTION_ALREADY_DONE, 'Transaction cancelled', $id);
            }

            return $this->result([
                'create_time' => $order->updated_at->getTimestampMs(),
                'transaction' => $order->payment_transaction_id,
                'state' => self::STATE_CREATED,
            ], $id);
        }

        $order->update(['payment_transaction_id' => $transactionId]);

        return $this->result([
            'create_time' => Carbon::now()->getTimestampMs(),
            'transaction' => $transactionId,
            'state' => self::STATE_CREATED,
        ], $id);
    }

    private function performTransaction(array $params, Bot $bot, mixed $id): JsonResponse
    {
        $transactionId = $params['id'] ?? null;

        $order = Order::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('payment_transaction_id', $transactionId)
            ->first();

        if (! $order) {
            return $this->error(self::ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found', $id);
        }

        $order->update(['payment_status' => 'paid']);

        return $this->result([
            'transaction' => $transactionId,
            'perform_time' => Carbon::now()->getTimestampMs(),
            'state' => self::STATE_COMPLETED,
        ], $id);
    }

    private function cancelTransaction(array $params, Bot $bot, mixed $id): JsonResponse
    {
        $transactionId = $params['id'] ?? null;

        $order = Order::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('payment_transaction_id', $transactionId)
            ->first();

        if (! $order) {
            return $this->error(self::ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found', $id);
        }

        $state = $order->payment_status === 'paid'
            ? self::STATE_CANCELLED_AFTER_COMPLETE
            : self::STATE_CANCELLED;

        $order->update(['payment_status' => 'failed']);

        return $this->result([
            'transaction' => $transactionId,
            'cancel_time' => Carbon::now()->getTimestampMs(),
            'state' => $state,
        ], $id);
    }

    private function checkTransaction(array $params, Bot $bot, mixed $id): JsonResponse
    {
        $transactionId = $params['id'] ?? null;

        $order = Order::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('payment_transaction_id', $transactionId)
            ->first();

        if (! $order) {
            return $this->error(self::ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found', $id);
        }

        $state = match ($order->payment_status) {
            'paid' => self::STATE_COMPLETED,
            'failed' => self::STATE_CANCELLED,
            default => self::STATE_CREATED,
        };

        return $this->result([
            'create_time' => $order->created_at->getTimestampMs(),
            'perform_time' => $order->payment_status === 'paid' ? $order->updated_at->getTimestampMs() : 0,
            'cancel_time' => $order->payment_status === 'failed' ? $order->updated_at->getTimestampMs() : 0,
            'transaction' => $transactionId,
            'state' => $state,
            'reason' => null,
        ], $id);
    }

    private function findOrder(Bot $bot, mixed $orderId): ?Order
    {
        if (! $orderId) {
            return null;
        }

        return Order::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->find((int) $orderId);
    }

    private function result(array $result, mixed $id): JsonResponse
    {
        return response()->json(['result' => $result, 'id' => $id]);
    }

    private function error(int $code, string $message, mixed $id = null): JsonResponse
    {
        return response()->json([
            'error' => ['code' => $code, 'message' => ['ru' => $message, 'uz' => $message, 'en' => $message]],
            'id' => $id,
        ]);
    }
}
