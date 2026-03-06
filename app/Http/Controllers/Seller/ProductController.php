<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'variants', 'images'])->latest()->paginate(10);
        $categories = Category::all();

        return Inertia::render('seller/products/index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $data = $request->safe()->except(['images', 'variants']);
        $product = Product::create($data);

        $this->syncImages($product, $request);
        $this->syncVariants($product, $request);

        return back()->with('success', 'Product created successfully.');
    }

    public function update(StoreProductRequest $request, Product $product)
    {
        $data = $request->safe()->except(['images', 'variants']);
        $product->update($data);

        $this->syncImages($product, $request);
        $this->syncVariants($product, $request);

        return back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        // Delete images from storage
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $product->delete();

        return back()->with('success', 'Product deleted successfully.');
    }

    public function export()
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=products.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $products = Product::with('category')->get();
        $columns = ['ID', 'Name', 'Description', 'Price', 'Quantity', 'Category'];

        $callback = function () use ($products, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($products as $product) {
                fputcsv($file, [
                    $product->id,
                    $product->name,
                    $product->description,
                    $product->price,
                    $product->quantity,
                    $product->category ? $product->category->name : '',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));

        $header = array_shift($data);

        foreach ($data as $row) {
            if (count($row) < 5) {
                continue;
            }

            $categoryName = $row[5] ?? null;
            $categoryId = null;

            if ($categoryName) {
                $category = Category::firstOrCreate(['name' => $categoryName]);
                $categoryId = $category->id;
            }

            Product::updateOrCreate(
                ['name' => $row[1]],
                [
                    'description' => $row[2],
                    'price' => $row[3],
                    'quantity' => $row[4],
                    'category_id' => $categoryId,
                ]
            );
        }

        return back()->with('success', 'Products imported successfully.');
    }

    private function syncImages(Product $product, Request $request): void
    {
        if (! $request->hasFile('images')) {
            return;
        }

        $sortOrder = $product->images()->max('sort_order') ?? 0;

        foreach ($request->file('images') as $image) {
            $path = $image->store('products', 'public');
            $product->images()->create([
                'path' => $path,
                'sort_order' => ++$sortOrder,
            ]);
        }
    }

    private function syncVariants(Product $product, Request $request): void
    {
        if (! $request->has('variants')) {
            return;
        }

        $incomingIds = [];

        foreach ($request->input('variants', []) as $variantData) {
            if (! empty($variantData['id'])) {
                $variant = $product->variants()->find($variantData['id']);
                if ($variant) {
                    $variant->update([
                        'name' => $variantData['name'],
                        'price' => $variantData['price'],
                        'quantity' => $variantData['quantity'],
                        'sku' => $variantData['sku'] ?? null,
                    ]);
                    $incomingIds[] = $variant->id;
                }
            } else {
                $variant = $product->variants()->create([
                    'name' => $variantData['name'],
                    'price' => $variantData['price'],
                    'quantity' => $variantData['quantity'],
                    'sku' => $variantData['sku'] ?? null,
                ]);
                $incomingIds[] = $variant->id;
            }
        }

        // Delete removed variants
        $product->variants()->whereNotIn('id', $incomingIds)->delete();
    }
}
