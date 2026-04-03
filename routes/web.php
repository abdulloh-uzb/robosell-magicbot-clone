<?php

use App\Http\Controllers\Admin\SellerController as AdminSellerController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\Seller\BannerController;
use App\Http\Controllers\Seller\CategoryController;
use App\Http\Controllers\Seller\ChannelController;
use App\Http\Controllers\Seller\ChatController;
use App\Http\Controllers\Seller\CustomerController;
use App\Http\Controllers\Seller\DashboardController;
use App\Http\Controllers\Seller\OrderController;
use App\Http\Controllers\Seller\PaymentSettingController;
use App\Http\Controllers\Seller\ProductController;
use App\Http\Controllers\Seller\ReviewController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\ClickWebhookController;
use App\Http\Controllers\Store\PaymentController;
use App\Http\Controllers\Store\PaymeWebhookController;
use App\Http\Controllers\Store\StoreController;
use App\Http\Controllers\WebhookController;
use App\Models\Bot;
use Illuminate\Http\Request;
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
        Route::post('switch-bot', function (Request $request) {
            $bot = Bot::where('seller_id', auth()->id())->findOrFail($request->integer('bot_id'));
            session(['bot_id' => $bot->id]);

            return redirect()->route('dashboard');
        })->name('switch-bot');
        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::resource('banners', BannerController::class)->except(['show', 'create', 'edit']);
        Route::post('products/import', [ProductController::class, 'import'])->name('products.import');
        Route::get('products/export', [ProductController::class, 'export'])->name('products.export');
        Route::patch('products/{product}/toggle-featured', [ProductController::class, 'toggleFeatured'])->name('products.toggle-featured');
        Route::resource('products', ProductController::class)->except(['show']);
        Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
        Route::get('payment-settings', [PaymentSettingController::class, 'index'])->name('payment-settings.index');
        Route::post('payment-settings', [PaymentSettingController::class, 'update'])->name('payment-settings.update');
        Route::resource('orders', OrderController::class)->only(['index', 'show', 'update']);
        Route::resource('customers', CustomerController::class)->only(['index']);
        Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
        Route::get('chat/{platform}/{id}/messages', [ChatController::class, 'messages'])->name('chat.messages');
        Route::post('chat/{platform}/{id}/send', [ChatController::class, 'send'])->name('chat.send');

        Route::get('channel', [ChannelController::class, 'index'])->name('channel.index');
        Route::post('channel/post', [ChannelController::class, 'post'])->name('channel.post');
    });
});

Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('sellers', AdminSellerController::class);
});

Route::post('/locale', LocaleController::class)->name('locale.set');

Route::get('/webhook/instagram', [WebhookController::class, 'instagramVerify'])->name('webhook.instagram.verify');
Route::post('/webhook/instagram', [WebhookController::class, 'instagram'])->name('webhook.instagram');

Route::post('/webhook/{bot}', WebhookController::class);
Route::post('/webhook/click/{bot:username}', [ClickWebhookController::class, 'handle'])->name('webhook.click');
Route::post('/webhook/payme/{bot:username}', [PaymeWebhookController::class, 'handle'])->name('webhook.payme');

Route::prefix('store/{bot:username}')->name('store.')->group(function () {
    Route::get('/', [StoreController::class, 'index'])->name('index');
    Route::get('/catalog', [StoreController::class, 'catalog'])->name('catalog');
    Route::get('/category/{category}', [StoreController::class, 'category'])->name('category');
    Route::get('/product/{product}', [StoreController::class, 'product'])->name('product');
    Route::get('/cart', [StoreController::class, 'cart'])->name('cart');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store')->middleware('telegram.webapp');
    Route::get('/orders', [StoreController::class, 'orders'])->name('orders')->middleware('telegram.webapp');
    Route::get('/profile', [StoreController::class, 'profile'])->name('profile')->middleware('telegram.webapp');
    Route::post('/product/{product}/review', [StoreController::class, 'storeReview'])->name('product.review')->middleware('telegram.webapp');
    Route::get('/payment/click/{order}', [PaymentController::class, 'clickRedirect'])->name('payment.click');
    Route::get('/payment/payme/{order}', [PaymentController::class, 'paymeRedirect'])->name('payment.payme');
    Route::get('/payment/return/{order}', [PaymentController::class, 'return'])->name('payment.return');
});

require __DIR__.'/settings.php';
