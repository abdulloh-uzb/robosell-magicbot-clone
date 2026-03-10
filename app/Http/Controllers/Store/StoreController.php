<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Bot;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function index(Bot $bot)
    {
        $categories = Category::where('bot_id', $bot->id)
            ->withCount('products')
            ->get();

        return Inertia::render('store/index', [
            'bot' => $bot,
            'categories' => $categories,
        ]);
    }

    public function category(Bot $bot, Category $category)
    {
        $products = Product::where('bot_id', $bot->id)
            ->where('category_id', $category->id)
            ->with(['images', 'variants'])
            ->get();

        return Inertia::render('store/category', [
            'bot' => $bot,
            'category' => $category,
            'products' => $products,
        ]);
    }

    public function product(Bot $bot, Product $product)
    {
        $product->load(['category', 'variants', 'images']);

        return Inertia::render('store/product', [
            'bot' => $bot,
            'product' => $product,
        ]);
    }

    public function cart(Bot $bot)
    {
        return Inertia::render('store/cart', [
            'bot' => $bot,
        ]);
    }

    public function orders(Request $request, Bot $bot)
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

    public function profile(Request $request, Bot $bot)
    {
        $customer = $request->attributes->get('customer');

        return Inertia::render('store/profile', [
            'bot' => $bot,
            'customer' => $customer,
        ]);
    }
}
