import type { ReactNode } from 'react';
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, ImageIcon, Minus, Plus, Star } from 'lucide-react';
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

interface Review {
    id: number;
    rating: number;
    body: string | null;
    created_at: string;
    customer: { id: number; name: string; username: string | null };
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
    reviews: Review[];
}

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                    <Star
                        className={`h-5 w-5 transition-colors ${
                            star <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

export default function ProductView({ bot, product }: { bot: any; product: Product }) {
    const { addToCart } = useCart(bot.id);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] ?? null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Review state
    const [rating, setRating] = useState(0);
    const [reviewBody, setReviewBody] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const isTelegramUser = typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp?.initData;

    const hasVariants = product.variants && product.variants.length > 0;
    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const currentStock = selectedVariant ? selectedVariant.quantity : product.quantity;
    const isOutOfStock = currentStock === 0;
    const displayImages = product.images && product.images.length > 0 ? product.images : null;

    const avgRating = product.reviews.length
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

    const handleAddToCart = () => {
        if (isOutOfStock) { return; }
        addToCart({ id: product.id, name: product.name, price: currentPrice }, quantity, selectedVariant?.id);
        setQuantity(1);
        setIsAdded(true);
        if ((window as any).Telegram?.WebApp?.HapticFeedback) {
            (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        setTimeout(() => setIsAdded(false), 1000);
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) { return; }
        setSubmittingReview(true);
        router.post(
            `/store/${bot.username}/product/${product.id}/review`,
            { rating, body: reviewBody },
            {
                onFinish: () => {
                    setSubmittingReview(false);
                    setRating(0);
                    setReviewBody('');
                },
            },
        );
    };

    return (
        <>
            <Head title={`${product.name} - ${bot.name}`} />

            <div className="bg-white/95 sticky top-14 z-30 -mx-4 mb-4 flex items-center gap-3 border-b px-4 py-2 shadow-sm backdrop-blur-md">
                <Button variant="ghost" size="icon" asChild className="bg-gray-100 hover:bg-gray-200 h-9 w-9 rounded-full">
                    <Link href={`/store/${bot.username}/category/${product.category_id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1" />
            </div>

            <div className="space-y-6">
                {/* Image gallery */}
                <div className="space-y-2">
                    <div className="bg-gray-50 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl shadow-inner">
                        {displayImages ? (
                            <img src={displayImages[activeImageIndex]?.url} className="h-full w-full object-cover" alt={product.name} />
                        ) : (
                            <span className="text-gray-300 flex flex-col items-center">
                                <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                                <span className="text-sm font-medium text-gray-400">{product.name}</span>
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
                        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-gray-900">{product.name}</h1>
                        <span className="text-primary shrink-0 text-2xl font-black">${Number(currentPrice).toFixed(2)}</span>
                    </div>
                    {product.category && (
                        <p className="text-primary/80 mb-2 text-sm font-semibold uppercase tracking-wide">{product.category.name}</p>
                    )}
                    {product.reviews.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-4">
                            <StarRating value={Math.round(avgRating)} readonly />
                            <span className="text-sm text-gray-500">{avgRating.toFixed(1)} ({product.reviews.length} ta sharh)</span>
                        </div>
                    )}
                    <div className="text-gray-500 prose prose-sm leading-relaxed">
                        <p>{product.description || 'Tavsif mavjud emas.'}</p>
                    </div>
                </div>

                {/* Variant selector */}
                {hasVariants && (
                    <div className="px-1">
                        <p className="mb-2 text-sm font-semibold text-gray-700">Variant tanlang:</p>
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
                                              ? 'border-gray-200 text-gray-400 line-through opacity-50'
                                              : 'border-gray-200 hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    {v.name}
                                    {v.quantity === 0 && <span className="ml-1 text-xs">(tugagan)</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add to cart */}
                <div className="border border-gray-100 mt-8 flex flex-col gap-5 rounded-2xl bg-gray-50 p-5 shadow-sm">
                    {isOutOfStock ? (
                        <p className="text-center text-sm font-medium text-red-500">Tugagan</p>
                    ) : (
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800">Miqdor</span>
                            <div className="bg-white flex items-center gap-2 rounded-full border border-gray-200 p-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-white hover:bg-gray-50 shadow-xs"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-white hover:bg-gray-50 shadow-xs"
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
                                <Check className="h-5 w-5" /> Savatga qo'shildi!
                            </span>
                        ) : (
                            `Savatga qo'shish • $${(currentPrice * quantity).toFixed(2)}`
                        )}
                    </Button>
                </div>

                {/* Reviews section */}
                <div className="px-1 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Sharhlar {product.reviews.length > 0 && `(${product.reviews.length})`}</h2>

                    {/* Review form — only for Telegram users */}
                    {isTelegramUser && (
                        <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                            <p className="text-sm font-semibold text-gray-700">Sharh qoldiring</p>
                            <StarRating value={rating} onChange={setRating} />
                            <textarea
                                value={reviewBody}
                                onChange={(e) => setReviewBody(e.target.value)}
                                placeholder="Fikringizni yozing (ixtiyoriy)..."
                                maxLength={500}
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={rating === 0 || submittingReview}
                                className="w-full rounded-xl"
                            >
                                Yuborish
                            </Button>
                        </form>
                    )}

                    {/* Reviews list */}
                    {product.reviews.length > 0 ? (
                        <div className="space-y-3">
                            {product.reviews.map((review) => (
                                <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-sm text-gray-800">
                                            {review.customer.name || review.customer.username || 'Foydalanuvchi'}
                                        </span>
                                        <StarRating value={review.rating} readonly />
                                    </div>
                                    {review.body && (
                                        <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 py-4 text-center">Hozircha sharh yo'q. Birinchi bo'lib yozing!</p>
                    )}
                </div>
            </div>
        </>
    );
}

ProductView.layout = (page: ReactNode) => <StoreLayout>{page}</StoreLayout>;
