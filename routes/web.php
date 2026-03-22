<?php

use App\Http\Controllers\Admin\SellerController as AdminSellerController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\Seller\CategoryController;
use App\Http\Controllers\Seller\ChannelController;
use App\Http\Controllers\Seller\ChatController;
use App\Http\Controllers\Seller\CustomerController;
use App\Http\Controllers\Seller\DashboardController;
use App\Http\Controllers\Seller\InstagramChatController;
use App\Http\Controllers\Seller\OrderController;
use App\Http\Controllers\Seller\ProductController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\StoreController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::middleware(['role:seller'])->group(function () {
        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::post('products/import', [ProductController::class, 'import'])->name('products.import');
        Route::get('products/export', [ProductController::class, 'export'])->name('products.export');
        Route::resource('products', ProductController::class)->except(['show']);
        Route::resource('orders', OrderController::class)->only(['index', 'show', 'update']);
        Route::resource('customers', CustomerController::class)->only(['index']);
        Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
        Route::get('chat/{customer}', [ChatController::class, 'show'])->name('chat.show');
        Route::post('chat/{customer}/send', [ChatController::class, 'send'])->name('chat.send');

        Route::get('channel', [ChannelController::class, 'index'])->name('channel.index');
        Route::post('channel/post', [ChannelController::class, 'post'])->name('channel.post');

        Route::get('instagram/chat', [InstagramChatController::class, 'index'])->name('instagram.chat.index');
        Route::get('instagram/chat/{senderId}', [InstagramChatController::class, 'show'])->name('instagram.chat.show');
        Route::post('instagram/chat/{senderId}/send', [InstagramChatController::class, 'send'])->name('instagram.chat.send');
    });
});

Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('sellers', AdminSellerController::class);
});

Route::post('/locale', LocaleController::class)->name('locale.set');

Route::get('/webhook/instagram', [WebhookController::class, 'instagramVerify'])->name('webhook.instagram.verify');
Route::post('/webhook/instagram', [WebhookController::class, 'instagram'])->name('webhook.instagram');

Route::post('/webhook/{bot}', WebhookController::class);

Route::prefix('store/{bot:username}')->name('store.')->group(function () {
    Route::get('/', [StoreController::class, 'index'])->name('index');
    Route::get('/category/{category}', [StoreController::class, 'category'])->name('category');
    Route::get('/product/{product}', [StoreController::class, 'product'])->name('product');
    Route::get('/cart', [StoreController::class, 'cart'])->name('cart');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store')->middleware('telegram.webapp');
    Route::get('/orders', [StoreController::class, 'orders'])->name('orders')->middleware('telegram.webapp');
    Route::get('/profile', [StoreController::class, 'profile'])->name('profile')->middleware('telegram.webapp');
});

require __DIR__.'/settings.php';
