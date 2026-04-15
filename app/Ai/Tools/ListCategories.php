<?php

namespace App\Ai\Tools;

use App\Ai\Support\ChatContext;
use App\Models\Category;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListCategories implements Tool
{
    public function __construct(protected ChatContext $context) {}

    public function description(): string
    {
        return 'List all product categories for THIS shop with the number of products in each. Call this FIRST whenever the customer asks a broad or browse question such as "what do you have?", "qanday mahsulotlar bor?", "nimangiz bor?", "что у вас есть?". Also call this when the customer mentions a general category name to confirm it exists before searching.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [];
    }

    public function handle(Request $request): string
    {
        $builder = Category::query()
            ->withoutGlobalScope('seller')
            ->where('seller_id', $this->context->sellerId())
            ->withCount('products');

        if ($this->context->botId()) {
            $builder->where('bot_id', $this->context->botId());
        }

        $categories = $builder->orderByDesc('products_count')->get();

        $results = $categories->map(fn (Category $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'product_count' => (int) $c->products_count,
        ])->all();

        return json_encode([
            'categories' => $results,
            'total_categories' => count($results),
            'note' => count($results) === 0
                ? 'This shop has no categories defined. Do not invent any.'
                : 'Use ONLY these category names. Do not invent additional ones.',
        ], JSON_UNESCAPED_UNICODE);
    }
}
