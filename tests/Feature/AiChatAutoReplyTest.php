<?php

use App\Ai\Support\ChatContext;
use App\Ai\Support\ToolOutcome;
use App\Ai\Tools\CaptureOrderIntent;
use App\Ai\Tools\GetShopInfo;
use App\Ai\Tools\HandoffToSeller;
use App\Ai\Tools\ListCategories;
use App\Ai\Tools\ReportOffTopic;
use App\Ai\Tools\SearchProducts;
use App\Enums\OrderStatus;
use App\Jobs\ProcessAiChatAutoReply;
use App\Models\AiChatConversationState;
use App\Models\Bot;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentSetting;
use App\Models\Product;
use App\Models\TelegramMessage;
use App\Models\User;
use App\Notifications\SellerAiEventNotification;
use App\Services\Ai\SellerChatAgent;
use Illuminate\JsonSchema\JsonSchemaTypeFactory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Laravel\Ai\ObjectSchema;
use Laravel\Ai\Tools\Request;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::findOrCreate('seller');
    config(['ai.providers.openai.key' => 'sk-test-key']);
    config(['ai_chat.rate_limit_per_hour' => 50]);
});

function makeSeller(array $overrides = []): User
{
    $seller = User::factory()->create(array_merge([
        'ai_auto_reply_enabled' => true,
    ], $overrides));
    $seller->assignRole('seller');

    return $seller;
}

function makeTelegramContext(User $seller, Bot $bot, Customer $customer, string $language = 'uz'): ChatContext
{
    $state = AiChatConversationState::forTelegram($bot->id, $customer->id);

    return new ChatContext(
        platform: 'telegram',
        seller: $seller,
        state: $state,
        language: $language,
        bot: $bot,
        customer: $customer,
    );
}

// =========================================================================
// Tool: SearchProducts
// =========================================================================

it('SearchProducts returns only products of this seller and bot', function (): void {
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $otherBot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 111, 'first_name' => 'A']);

    Product::create([
        'name' => 'Qizil futbolka',
        'description' => 'cotton',
        'price' => 150000,
        'quantity' => 3,
        'bot_id' => $bot->id,
        'seller_id' => $seller->id,
    ]);
    Product::create([
        'name' => 'Ko\'k shim',
        'description' => 'jeans',
        'price' => 250000,
        'quantity' => 5,
        'bot_id' => $otherBot->id,
        'seller_id' => $seller->id,
    ]);

    $ctx = makeTelegramContext($seller, $bot, $customer);
    $tool = new SearchProducts($ctx);

    $result = json_decode($tool->handle(new Request(['query' => 'futbolka'])), true);

    expect($result['results'])->toHaveCount(1)
        ->and($result['results'][0]['name'])->toBe('Qizil futbolka');
});

it('SearchProducts browses featured+recent when query is empty', function (): void {
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 223, 'first_name' => 'B2']);

    Product::create([
        'name' => 'Oddiy mahsulot',
        'price' => 10000,
        'quantity' => 1,
        'is_featured' => false,
        'bot_id' => $bot->id,
        'seller_id' => $seller->id,
    ]);
    Product::create([
        'name' => 'Top mahsulot',
        'price' => 20000,
        'quantity' => 1,
        'is_featured' => true,
        'bot_id' => $bot->id,
        'seller_id' => $seller->id,
    ]);

    $ctx = makeTelegramContext($seller, $bot, $customer);
    $tool = new SearchProducts($ctx);

    $result = json_decode($tool->handle(new Request), true);

    expect($result['results'])->toHaveCount(2)
        ->and($result['results'][0]['name'])->toBe('Top mahsulot');
});

it('SearchProducts returns empty list when nothing matches', function (): void {
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 222, 'first_name' => 'B']);

    $ctx = makeTelegramContext($seller, $bot, $customer);
    $tool = new SearchProducts($ctx);

    $result = json_decode($tool->handle(new Request(['query' => 'noutbuk'])), true);

    expect($result['results'])->toBe([]);
});

// =========================================================================
// Tool: ListCategories
// =========================================================================

it('ListCategories returns only this shop\'s categories with product counts', function (): void {
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 900, 'first_name' => 'L']);

    $kiyim = Category::create(['name' => 'Kiyim', 'seller_id' => $seller->id, 'bot_id' => $bot->id]);
    Category::create(['name' => 'Poyafzal', 'seller_id' => $seller->id, 'bot_id' => $bot->id]);

    Product::create([
        'name' => 'Futbolka', 'price' => 100, 'quantity' => 1,
        'bot_id' => $bot->id, 'seller_id' => $seller->id, 'category_id' => $kiyim->id,
    ]);
    Product::create([
        'name' => 'Shim', 'price' => 200, 'quantity' => 1,
        'bot_id' => $bot->id, 'seller_id' => $seller->id, 'category_id' => $kiyim->id,
    ]);

    $ctx = makeTelegramContext($seller, $bot, $customer);
    $tool = new ListCategories($ctx);

    $result = json_decode($tool->handle(new Request), true);

    expect($result['categories'])->toHaveCount(2)
        ->and($result['categories'][0]['name'])->toBe('Kiyim')
        ->and($result['categories'][0]['product_count'])->toBe(2);
});

it('ListCategories returns an empty list when the shop has no categories', function (): void {
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 901, 'first_name' => 'M']);

    $ctx = makeTelegramContext($seller, $bot, $customer);
    $tool = new ListCategories($ctx);

    $result = json_decode($tool->handle(new Request), true);

    expect($result['categories'])->toBe([])
        ->and($result['total_categories'])->toBe(0);
});

// =========================================================================
// Tool: GetShopInfo
// =========================================================================

it('GetShopInfo returns enabled payment types and delivery info for this shop', function (): void {
    $seller = makeSeller(['delivery_info' => 'Toshkent bo\'yicha bepul']);
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 333, 'first_name' => 'C']);

    PaymentSetting::create([
        'seller_id' => $seller->id,
        'bot_id' => $bot->id,
        'type' => 'click',
        'enabled' => true,
        'credentials' => [],
    ]);
    PaymentSetting::create([
        'seller_id' => $seller->id,
        'bot_id' => $bot->id,
        'type' => 'payme',
        'enabled' => false,
        'credentials' => [],
    ]);

    $ctx = makeTelegramContext($seller, $bot, $customer);
    $tool = new GetShopInfo($ctx);

    $result = json_decode($tool->handle(new Request), true);

    expect($result['accepted_payment_methods'])->toBe(['click'])
        ->and($result['delivery_info'])->toBe('Toshkent bo\'yicha bepul');
});

// =========================================================================
// Tool: CaptureOrderIntent
// =========================================================================

it('CaptureOrderIntent creates an ai_captured order and notifies the seller', function (): void {
    Notification::fake();

    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 444, 'first_name' => 'D']);

    $product = Product::create([
        'name' => 'Sport krossovka',
        'description' => '',
        'price' => 500000,
        'quantity' => 10,
        'bot_id' => $bot->id,
        'seller_id' => $seller->id,
    ]);

    $ctx = makeTelegramContext($seller, $bot, $customer);
    $outcome = new ToolOutcome;
    $tool = new CaptureOrderIntent($ctx, $outcome);

    $result = json_decode($tool->handle(new Request([
        'product_id' => $product->id,
        'quantity' => 2,
    ])), true);

    expect($result['success'])->toBeTrue()
        ->and($outcome->orderCaptured)->toBeTrue();

    $order = Order::find($result['order_id']);
    expect($order->status)->toBe(OrderStatus::AiCaptured)
        ->and((float) $order->total_amount)->toBe(1000000.0);

    expect(OrderItem::where('order_id', $order->id)->first()->quantity)->toBe(2);

    Notification::assertSentTo($seller, SellerAiEventNotification::class,
        fn ($n) => $n->event === 'order_captured');
});

it('CaptureOrderIntent rejects unknown products', function (): void {
    Notification::fake();

    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 555, 'first_name' => 'E']);

    $ctx = makeTelegramContext($seller, $bot, $customer);
    $outcome = new ToolOutcome;
    $tool = new CaptureOrderIntent($ctx, $outcome);

    $result = json_decode($tool->handle(new Request([
        'product_id' => 9999,
        'quantity' => 1,
    ])), true);

    expect($result['success'])->toBeFalse()
        ->and($outcome->orderCaptured)->toBeFalse()
        ->and(Order::count())->toBe(0);

    Notification::assertNothingSent();
});

// =========================================================================
// Tool: ReportOffTopic + HandoffToSeller
// =========================================================================

it('ReportOffTopic marks the outcome and notifies the seller', function (): void {
    Notification::fake();

    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 666, 'first_name' => 'F']);

    $ctx = makeTelegramContext($seller, $bot, $customer);
    $outcome = new ToolOutcome;
    $tool = new ReportOffTopic($ctx, $outcome);

    $tool->handle(new Request(['reason' => 'weather question']));

    expect($outcome->offTopicReported)->toBeTrue();
    Notification::assertSentTo($seller, SellerAiEventNotification::class,
        fn ($n) => $n->event === 'off_topic');
});

it('HandoffToSeller marks the outcome and notifies the seller', function (): void {
    Notification::fake();

    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 777, 'first_name' => 'G']);

    $ctx = makeTelegramContext($seller, $bot, $customer);
    $outcome = new ToolOutcome;
    $tool = new HandoffToSeller($ctx, $outcome);

    $tool->handle(new Request(['reason' => 'complaint', 'details' => 'broken']));

    expect($outcome->handoffRequested)->toBeTrue()
        ->and($outcome->handoffReason)->toBe('complaint');
    Notification::assertSentTo($seller, SellerAiEventNotification::class,
        fn ($n) => $n->event === 'handoff_requested');
});

// =========================================================================
// SellerChatAgent::resolveAction
// =========================================================================

it('resolveAction sends a refusal on the first off-topic and stays silent on the next one', function (): void {
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 888, 'first_name' => 'H']);

    $ctx = makeTelegramContext($seller, $bot, $customer, 'uz');
    $agent = new SellerChatAgent($ctx);

    $outcome = new ToolOutcome;
    $outcome->offTopicReported = true;

    $response = new Laravel\Ai\Responses\AgentResponse(
        'inv',
        '',
        new Laravel\Ai\Responses\Data\Usage,
        new Laravel\Ai\Responses\Data\Meta('openai', 'gpt-4o-mini'),
    );

    $first = $agent->resolveAction($response, $outcome);
    expect($first->action)->toBe('send_refusal');

    $second = $agent->resolveAction($response, $outcome);
    expect($second->action)->toBe('stay_silent');
});

it('resolveAction short-circuits a handoff request regardless of model text', function (): void {
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 999, 'first_name' => 'I']);

    $ctx = makeTelegramContext($seller, $bot, $customer, 'uz');
    $agent = new SellerChatAgent($ctx);

    $outcome = new ToolOutcome;
    $outcome->handoffRequested = true;

    $response = new Laravel\Ai\Responses\AgentResponse(
        'inv',
        'some model text we must ignore',
        new Laravel\Ai\Responses\Data\Usage,
        new Laravel\Ai\Responses\Data\Meta('openai', 'gpt-4o-mini'),
    );

    $action = $agent->resolveAction($response, $outcome);

    expect($action->action)->toBe('handoff');
    expect($ctx->state->fresh()->handed_off_to_seller)->toBeTrue();
});

it('resolveAction returns the model text when no side-effect tool was called', function (): void {
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 1111, 'first_name' => 'J']);

    $ctx = makeTelegramContext($seller, $bot, $customer, 'uz');
    $agent = new SellerChatAgent($ctx);

    $outcome = new ToolOutcome;
    $response = new Laravel\Ai\Responses\AgentResponse(
        'inv',
        'Narxi 150000 so\'m',
        new Laravel\Ai\Responses\Data\Usage,
        new Laravel\Ai\Responses\Data\Meta('openai', 'gpt-4o-mini'),
    );

    $action = $agent->resolveAction($response, $outcome);

    expect($action->action)->toBe('send_reply')
        ->and($action->text)->toBe('Narxi 150000 so\'m');
});

// =========================================================================
// Job gating
// =========================================================================

it('skips when seller has auto-reply disabled', function (): void {
    Http::fake();
    $seller = makeSeller(['ai_auto_reply_enabled' => false]);
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 1, 'first_name' => 'X']);

    $inbound = TelegramMessage::create([
        'bot_id' => $bot->id,
        'customer_id' => $customer->id,
        'direction' => 'in',
        'text' => 'salom',
    ]);

    ProcessAiChatAutoReply::dispatchSync(platform: 'telegram', telegramMessageId: $inbound->id);

    Http::assertNothingSent();
    expect(AiChatConversationState::count())->toBe(0);
});

it('skips when AI provider key is not configured', function (): void {
    config(['ai.providers.openai.key' => null]);
    Http::fake();

    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 2, 'first_name' => 'Y']);

    $inbound = TelegramMessage::create([
        'bot_id' => $bot->id,
        'customer_id' => $customer->id,
        'direction' => 'in',
        'text' => 'salom',
    ]);

    ProcessAiChatAutoReply::dispatchSync(platform: 'telegram', telegramMessageId: $inbound->id);

    Http::assertNothingSent();
});

it('skips once max replies per conversation is reached', function (): void {
    Http::fake();
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 3, 'first_name' => 'Z']);

    $state = AiChatConversationState::forTelegram($bot->id, $customer->id);
    $state->forceFill(['ai_reply_count' => 999])->save();

    $inbound = TelegramMessage::create([
        'bot_id' => $bot->id,
        'customer_id' => $customer->id,
        'direction' => 'in',
        'text' => 'salom',
    ]);

    ProcessAiChatAutoReply::dispatchSync(platform: 'telegram', telegramMessageId: $inbound->id);

    Http::assertNothingSent();
});

it('skips when the conversation has been handed off to the seller', function (): void {
    Http::fake();
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 4, 'first_name' => 'Q']);

    AiChatConversationState::forTelegram($bot->id, $customer->id)->markHandedOff();

    $inbound = TelegramMessage::create([
        'bot_id' => $bot->id,
        'customer_id' => $customer->id,
        'direction' => 'in',
        'text' => 'salom',
    ]);

    ProcessAiChatAutoReply::dispatchSync(platform: 'telegram', telegramMessageId: $inbound->id);

    Http::assertNothingSent();
});

// =========================================================================
// Job happy path via AI fake
// =========================================================================

it('sends a Telegram AI reply when the agent returns text', function (): void {
    Http::fake([
        'api.telegram.org/*' => Http::response(['ok' => true, 'result' => ['message_id' => 42]], 200),
    ]);

    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 5, 'first_name' => 'R']);

    SellerChatAgent::fake(['Narxi 150000 so\'m']);

    $inbound = TelegramMessage::create([
        'bot_id' => $bot->id,
        'customer_id' => $customer->id,
        'direction' => 'in',
        'text' => 'Qizil futbolka narxi qancha?',
    ]);

    ProcessAiChatAutoReply::dispatchSync(platform: 'telegram', telegramMessageId: $inbound->id);

    $outbound = TelegramMessage::where('direction', 'out')
        ->where('bot_id', $bot->id)
        ->where('customer_id', $customer->id)
        ->first();

    expect($outbound)->not->toBeNull()
        ->and($outbound->text)->toBe('Narxi 150000 so\'m');

    $state = AiChatConversationState::forTelegram($bot->id, $customer->id);
    expect($state->ai_reply_count)->toBe(1);
});

it('OpenAI strict tool parameters use required for all properties and avoid null type unions', function (): void {
    $factory = new JsonSchemaTypeFactory;
    $seller = makeSeller();
    $bot = Bot::factory()->create(['seller_id' => $seller->id]);
    $customer = Customer::create(['telegram_id' => 999001, 'first_name' => 'S']);
    $context = makeTelegramContext($seller, $bot, $customer);
    $outcome = new ToolOutcome;

    $tools = [
        new SearchProducts($context),
        new HandoffToSeller($context, $outcome),
        new CaptureOrderIntent($context, $outcome),
    ];

    foreach ($tools as $tool) {
        $name = class_basename($tool);
        $schema = (new ObjectSchema($tool->schema($factory)))->toSchema();
        $propertyKeys = array_keys($schema['properties'] ?? []);
        expect($schema['required'] ?? [], "{$name} should list all keys in required")
            ->toEqualCanonicalizing($propertyKeys);

        $assertNoNullTypeUnion = function (array $node) use (&$assertNoNullTypeUnion, $name): void {
            foreach ($node as $k => $v) {
                if ($k === 'type' && is_array($v)) {
                    expect($v)->not->toContain('null', "{$name}: OpenAI strict tools must not use JSON Schema null unions; use required fields with sentinels (empty string, 0, etc.)");
                }
                if (is_array($v)) {
                    $assertNoNullTypeUnion($v);
                }
            }
        };
        $assertNoNullTypeUnion($schema);
    }
});
