<?php

namespace App\Http\Controllers\Seller;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\BotCustomer;
use App\Models\InstagramMessage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        if ($request->user()->hasRole('super_admin')) {
            return redirect()->route('admin.sellers.index');
        }

        $bot = $request->user()->bot;
        $period = $request->query('period', 'daily');

        $instagramAccount = $request->user()->instagramAccount;
        $instagramLeads = $instagramAccount
            ? InstagramMessage::where('instagram_account_id', $instagramAccount->id)
                ->where('direction', 'in')
                ->distinct('sender_instagram_id')
                ->count('sender_instagram_id')
            : 0;

        $stats = [
            'total_orders' => Order::count(),
            'total_products' => Product::count(),
            'telegram_leads' => BotCustomer::count(),
            'instagram_leads' => $instagramLeads,
        ];

        $chartData = match ($period) {
            'weekly' => $this->weeklyOrders(),
            'monthly' => $this->monthlyOrders(),
            default => $this->dailyOrders(),
        };

        $topProducts = OrderItem::query()
            ->select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->whereHas('order')
            ->with('product:id,name')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'name' => $item->product?->name ?? 'Deleted',
                'total_sold' => (int) $item->total_sold,
            ]);

        $statusBreakdown = collect(OrderStatus::cases())->map(fn ($status) => [
            'status' => $status->value,
            'count' => Order::where('status', $status->value)->count(),
        ]);

        return Inertia::render('seller/dashboard', [
            'bot' => $bot,
            'stats' => $stats,
            'chart_data' => $chartData,
            'top_products' => $topProducts,
            'status_breakdown' => $statusBreakdown,
            'period' => $period,
        ]);
    }

    private function dailyOrders(): array
    {
        $days = collect(range(29, 0))->map(fn ($i) => Carbon::today()->subDays($i)->toDateString());

        $counts = Order::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::today()->subDays(29))
            ->groupByRaw('DATE(created_at)')
            ->pluck('count', 'date');

        return $days->map(fn ($date) => [
            'label' => Carbon::parse($date)->format('M d'),
            'count' => (int) ($counts[$date] ?? 0),
        ])->values()->all();
    }

    private function weeklyOrders(): array
    {
        $weeks = collect(range(11, 0))->map(fn ($i) => Carbon::now()->startOfWeek()->subWeeks($i));

        return $weeks->map(function ($start) {
            $end = $start->copy()->endOfWeek();

            return [
                'label' => $start->format('M d'),
                'count' => Order::whereBetween('created_at', [$start, $end])->count(),
            ];
        })->values()->all();
    }

    private function monthlyOrders(): array
    {
        $months = collect(range(11, 0))->map(fn ($i) => Carbon::now()->startOfMonth()->subMonths($i));

        return $months->map(function ($start) {
            $end = $start->copy()->endOfMonth();

            return [
                'label' => $start->format('M Y'),
                'count' => Order::whereBetween('created_at', [$start, $end])->count(),
            ];
        })->values()->all();
    }
}
