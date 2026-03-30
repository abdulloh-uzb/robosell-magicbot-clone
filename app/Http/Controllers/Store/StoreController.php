<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Bot;
use App\Models\Category;
use App\Models\Order;
use App\Models\PaymentSetting;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(Bot $bot): Response
    {
        $banners = Banner::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->orderBy('sort_order')
            ->get();

        $categories = Category::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->withCount('products')
            ->with(['products' => function ($query) {
                $query->withoutGlobalScope('seller')
                    ->with(['images', 'variants'])
                    ->latest()
                    ->limit(5);
            }])
            ->get();

        $featuredProducts = Product::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('is_featured', true)
            ->with(['images', 'variants'])
            ->get();

        return Inertia::render('store/index', [
            'bot' => $bot,
            'banners' => $banners,
            'categories' => $categories,
            'featured_products' => $featuredProducts,
        ]);
    }

    public function catalog(Bot $bot): Response
    {
        $categories = Category::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->withCount('products')
            ->get();

        return Inertia::render('store/catalog', [
            'bot' => $bot,
            'categories' => $categories,
        ]);
    }

    public function category(Bot $bot, Category $category): Response
    {
        $products = Product::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('category_id', $category->id)
            ->with(['images', 'variants'])
            ->get();

        return Inertia::render('store/category', [
            'bot' => $bot,
            'category' => $category,
            'products' => $products,
        ]);
    }

    public function product(Bot $bot, Product $product): Response
    {
        $product->load(['category', 'variants', 'images', 'reviews.customer']);

        return Inertia::render('store/product', [
            'bot' => $bot,
            'product' => $product,
        ]);
    }

    public function storeReview(Request $request, Bot $bot, Product $product): RedirectResponse
    {
        $customer = $request->attributes->get('customer');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:0', 'max:5'],
            'body' => ['nullable', 'string', 'max:500'],
        ]);

        Review::updateOrCreate(
            ['product_id' => $product->id, 'customer_id' => $customer->id],
            ['bot_id' => $bot->id, 'rating' => $validated['rating'], 'body' => $validated['body'] ?? null]
        );

        return back();
    }

    public function cart(Bot $bot): Response
    {
        $paymentMethods = PaymentSetting::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('enabled', true)
            ->pluck('type')
            ->values()
            ->toArray();

        return Inertia::render('store/cart', [
            'bot' => $bot,
            'payment_methods' => $paymentMethods,
        ]);
    }

    public function orders(Request $request, Bot $bot): Response
    {
        $customer = $request->attributes->get('customer');

        $orders = Order::withoutGlobalScope('seller')
            ->where('bot_id', $bot->id)
            ->where('customer_id', $customer->id)
            ->with('items.product')
            ->latest()
            ->get();

        return Inertia::render('store/orders', [
            'bot' => $bot,
            'orders' => $orders,
        ]);
    }

    public function profile(Request $request, Bot $bot): Response
    {
        $customer = $request->attributes->get('customer');

        return Inertia::render('store/profile', [
            'bot' => $bot,
            'customer' => $customer,
        ]);
    }
}
