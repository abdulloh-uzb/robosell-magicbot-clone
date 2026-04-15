<?php

namespace App\Ai\Tools;

use App\Ai\Support\ChatContext;
use App\Models\Product;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class SearchProducts implements Tool
{
    public function __construct(protected ChatContext $context) {}

    public function description(): string
    {
        return 'Search or browse this shop\'s product catalog. Pass `query` for keyword search or leave it empty to browse featured + recent products. Returns up to `limit` products (default 10) with name, price, stock, description, category, variants, and image URL. This is the ONLY way to learn what products exist — never invent.';
    }

    public function schema(JsonSchema $schema): array
    {
        // OpenAI strict function tools reject JSON Schema "type" unions (e.g. string|null).
        // Use only string / integer, sentinels for “unset”, and parse in handle().
        return [
            'query' => $schema->string()
                ->description('Search keywords, or an empty string to browse general / featured products.')
                ->required(),
            'category' => $schema->string()
                ->description('Category name to narrow (from ListCategories), or an empty string for all categories.')
                ->required(),
            'max_price' => $schema->string()
                ->description('Max price in shop currency as a decimal string (e.g. "99.00"), or an empty string to ignore price.')
                ->required(),
            'limit' => $schema->integer()
                ->description('How many products to return, from 1 to 20. Use 10 if unsure.')
                ->min(1)
                ->max(20)
                ->required(),
        ];
    }

    public function handle(Request $request): string
    {
        $query = trim((string) ($request['query'] ?? ''));
        $category = trim((string) ($request['category'] ?? ''));
        $category = $category !== '' ? $category : null;
        $maxPriceRaw = (string) ($request['max_price'] ?? '');
        $maxPrice = is_numeric($maxPriceRaw) ? (float) $maxPriceRaw : null;
        $limit = (int) ($request['limit'] ?? 10);
        $limit = max(1, min(20, $limit));

        $builder = Product::query()
            ->withoutGlobalScope('seller')
            ->where('seller_id', $this->context->sellerId())
            ->with(['category', 'variants', 'images']);

        if ($this->context->botId()) {
            $builder->where('bot_id', $this->context->botId());
        }

        if ($query !== '') {
            $builder->where(function ($q) use ($query) {
                $q->where('name', 'like', '%'.$query.'%')
                    ->orWhere('description', 'like', '%'.$query.'%');
            });
        }

        if ($category !== null) {
            $builder->whereHas('category', function ($q) use ($category) {
                $q->where('name', 'like', '%'.$category.'%');
            });
        }

        if ($maxPrice !== null) {
            $builder->where('price', '<=', $maxPrice);
        }

        $products = $builder
            ->orderByDesc('is_featured')
            ->latest()
            ->limit($limit)
            ->get();

        if ($products->isEmpty()) {
            return json_encode([
                'results' => [],
                'query_used' => $query,
                'message' => $query === ''
                    ? 'This shop has no products in its catalog. Do not invent any. Tell the customer honestly and offer to hand off to the seller.'
                    : 'No products matched the query. Do not invent alternatives; either try a broader ListCategories call or hand off to the seller.',
            ], JSON_UNESCAPED_UNICODE);
        }

        $results = $products->map(function (Product $product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'stock' => (int) $product->quantity,
                'description' => $product->description,
                'category' => $product->category?->name,
                'is_featured' => (bool) $product->is_featured,
                'variants' => $product->variants->map(fn ($v) => [
                    'id' => $v->id,
                    'name' => $v->name,
                    'price' => (float) $v->price,
                    'stock' => (int) $v->quantity,
                    'sku' => $v->sku,
                ])->all(),
                'image' => $product->image,
            ];
        })->all();

        return json_encode(['results' => $results], JSON_UNESCAPED_UNICODE);
    }
}
