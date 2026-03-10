import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, ImageIcon, Minus, Plus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

interface ProductVariant {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface ProductImage {
    id: number;
    url: string;
    variant_id: number | null;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    category_id: number;
    category?: { name: string };
    variants: ProductVariant[];
    images: ProductImage[];
}

export default function ProductView({ bot, product }: { bot: any; product: Product }) {
    const { addToCart } = useCart(bot.id);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
        product.variants?.[0] ?? null,
    );
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const hasVariants = product.variants && product.variants.length > 0;
    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const currentStock = selectedVariant ? selectedVariant.quantity : product.quantity;
    const isOutOfStock = currentStock === 0;

    const displayImages = product.images && product.images.length > 0 ? product.images : null;

    const handleAddToCart = () => {
        if (isOutOfStock) return;

        addToCart(
            { id: product.id, name: product.name, price: currentPrice },
            quantity,
            selectedVariant?.id,
        );
        setQuantity(1);
        setIsAdded(true);

        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }

        setTimeout(() => setIsAdded(false), 1000);
    };

    return (
        <StoreLayout bot={bot}>
            <Head title={`${product.name} - ${bot.name}`} />

            <div className="bg-background/95 sticky top-14 z-30 -mx-4 mb-4 flex items-center gap-3 border-b/50 px-4 py-2 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)] backdrop-blur-md">
                <Button variant="ghost" size="icon" asChild className="bg-muted/40 hover:bg-muted h-9 w-9 rounded-full">
                    <Link href={`/store/${bot.username}/category/${product.category_id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1" />
            </div>

            <div className="space-y-6">
                {/* Image gallery */}
                <div className="space-y-2">
                    <div className="bg-muted/50 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl shadow-inner">
                        {displayImages ? (
                            <img
                                src={displayImages[activeImageIndex]?.url}
                                className="h-full w-full object-cover"
                                alt={product.name}
                            />
                        ) : (
                            <span className="text-muted-foreground/30 flex flex-col items-center text-2xl font-extrabold tracking-[0.2em] uppercase">
                                <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                                <span className="text-sm font-medium tracking-normal">{product.name}</span>
                            </span>
                        )}
                    </div>

                    {displayImages && displayImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {displayImages.map((img, i) => (
                                <button
                                    key={img.id}
                                    onClick={() => setActiveImageIndex(i)}
                                    className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                                        i === activeImageIndex ? 'border-primary' : 'border-transparent opacity-60'
                                    }`}
                                >
                                    <img src={img.url} className="h-full w-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                        <h1 className="text-2xl font-extrabold leading-tight tracking-tight">{product.name}</h1>
                        <span className="text-primary shrink-0 text-2xl font-black">${Number(currentPrice).toFixed(2)}</span>
                    </div>
                    {product.category && (
                        <p className="text-primary/80 mb-5 text-sm font-semibold uppercase tracking-wide">{product.category.name}</p>
                    )}
                    <div className="text-muted-foreground prose prose-sm dark:prose-invert leading-relaxed">
                        <p>{product.description || 'No detailed description available for this product.'}</p>
                    </div>
                </div>

                {/* Variant selector */}
                {hasVariants && (
                    <div className="px-1">
                        <p className="mb-2 text-sm font-semibold">Select variant:</p>
                        <div className="flex flex-wrap gap-2">
                            {product.variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariant(v)}
                                    disabled={v.quantity === 0}
                                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                                        selectedVariant?.id === v.id
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : v.quantity === 0
                                              ? 'border-border text-muted-foreground line-through opacity-50'
                                              : 'border-border hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    {v.name}
                                    {v.quantity === 0 && <span className="ml-1 text-xs">(out)</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-card border-border/50 mt-8 flex flex-col gap-5 rounded-2xl border p-5 shadow-sm">
                    {isOutOfStock ? (
                        <p className="text-center text-sm font-medium text-red-500">Out of stock</p>
                    ) : (
                        <div className="flex items-center justify-between">
                            <span className="text-foreground font-semibold">Quantity</span>
                            <div className="border-border/50 bg-muted/30 flex items-center gap-2 rounded-full border p-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-background hover:bg-background h-8 w-8 rounded-full shadow-xs"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-background hover:bg-background h-8 w-8 rounded-full shadow-xs"
                                    onClick={() => setQuantity((q) => q + 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <Button
                        size="lg"
                        variant={isAdded ? 'secondary' : 'default'}
                        className={`h-14 w-full rounded-xl text-base font-bold transition-all duration-300 ${
                            isAdded
                                ? 'scale-95 bg-green-500/10 text-green-600 shadow-none hover:bg-green-500/20'
                                : 'shadow-primary/20 shadow-lg'
                        }`}
                        onClick={handleAddToCart}
                        disabled={isAdded || isOutOfStock}
                    >
                        {isAdded ? (
                            <span className="animate-in zoom-in flex items-center justify-center gap-2 duration-300">
                                <Check className="h-5 w-5" /> Added to Cart!
                            </span>
                        ) : (
                            `Add to Cart • $${(currentPrice * quantity).toFixed(2)}`
                        )}
                    </Button>
                </div>
            </div>
        </StoreLayout>
    );
}
