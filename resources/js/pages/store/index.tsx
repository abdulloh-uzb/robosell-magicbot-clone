import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ImageIcon, Plus, Check, Search } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

interface Banner {
    id: number;
    image: string;
    title: string | null;
    link: string | null;
}

interface Category {
    id: number;
    name: string;
    image: string | null;
    products_count: number;
    products: Product[];
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: string;
    is_featured: boolean;
    images: { url: string }[];
    variants: { price: string }[];
}

function BannerSlider({ banners }: { banners: Banner[] }) {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 4000);
    };

    useEffect(() => {
        if (banners.length <= 1) { return; }
        startTimer();
        return () => {
            if (timerRef.current) { clearInterval(timerRef.current); }
        };
    }, [banners.length]);

    const goTo = (index: number) => {
        setCurrent(index);
        if (timerRef.current) { clearInterval(timerRef.current); }
        startTimer();
    };

    const prev = () => goTo((current - 1 + banners.length) % banners.length);
    const next = () => goTo((current + 1) % banners.length);

    if (banners.length === 0) { return null; }

    const banner = banners[current];
    const content = (
        <div className="relative w-full overflow-hidden rounded-2xl aspect-[16/6]">
            <img
                src={`/storage/${banner.image}`}
                alt={banner.title ?? 'Banner'}
                className="w-full h-full object-cover transition-all duration-500"
            />
            {banner.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <p className="text-white font-bold text-lg drop-shadow">{banner.title}</p>
                </div>
            )}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); prev(); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); next(); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.preventDefault(); goTo(i); }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="mb-4">
            {banner.link ? (
                <Link href={banner.link}>{content}</Link>
            ) : (
                content
            )}
        </div>
    );
}

function ProductCard({ product, botUsername, botId }: { product: Product; botUsername: string; botId: number }) {
    const { addToCart } = useCart(botId);
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        const price = product.variants?.[0]?.price ?? product.price;
        addToCart({ id: product.id, name: product.name, price }, 1, product.variants?.[0] ? Number(product.variants[0].price) : undefined);
        setAdded(true);
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        setTimeout(() => setAdded(false), 1000);
    };

    const displayPrice = product.variants?.[0]
        ? Number(product.variants[0].price).toFixed(2)
        : Number(product.price).toFixed(2);

    return (
        <Card className="overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <Link href={`/store/${botUsername}/product/${product.id}`}>
                <div className="w-full aspect-square bg-gray-50 overflow-hidden">
                    {product.images?.[0] ? (
                        <img src={product.images[0].url} className="w-full h-full object-cover" alt={product.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="text-gray-300 h-10 w-10" />
                        </div>
                    )}
                </div>
            </Link>
            <CardContent className="p-3">
                <Link href={`/store/${botUsername}/product/${product.id}`}>
                    <h4 className="font-semibold text-sm leading-tight line-clamp-2 text-gray-800 mb-1">{product.name}</h4>
                </Link>
                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-base text-gray-900">${displayPrice}</span>
                    <Button
                        size="sm"
                        variant={added ? 'secondary' : 'default'}
                        className={`h-7 rounded-full px-3 text-xs shadow-sm transition-all duration-300 ${added ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}`}
                        onClick={handleAdd}
                        disabled={added}
                    >
                        {added ? (
                            <><Check className="h-3 w-3 mr-1" /> Added</>
                        ) : (
                            <><Plus className="h-3 w-3 mr-1" /> Add</>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

interface PageProps {
    bot: any;
    categories: Category[];
    banners: Banner[];
    featured_products: Product[];
}

export default function Index({ bot, categories, banners, featured_products }: PageProps) {
    const [search, setSearch] = useState('');

    const filteredCategories = search.trim()
        ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        : categories;

    const categoriesWithProducts = categories.filter((c) => c.products.length > 0);

    return (
        <>
            <Head title={`${bot.name} - Bosh sahifa`} />

            {/* Banner Slider */}
            <BannerSlider banners={banners} />

            {/* Search */}
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Mahsulotlar va toifalarni qidirish"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
            </div>

            {/* Categories */}
            <section className="mb-6">
                <h3 className="text-base font-bold mb-3 text-gray-800">Toifalar</h3>
                {filteredCategories.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {filteredCategories.map((category) => (
                            <Link key={category.id} href={`/store/${bot.username}/category/${category.id}`} className="block group">
                                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                                    {category.image ? (
                                        <img
                                            src={`/storage/${category.image}`}
                                            alt={category.name}
                                            className="h-12 w-12 rounded-xl object-cover mb-1.5 group-hover:scale-110 transition-transform duration-200"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform duration-200">
                                            <span className="text-gray-500 font-bold text-sm uppercase">{category.name.substring(0, 2)}</span>
                                        </div>
                                    )}
                                    <span className="text-xs font-medium text-gray-700 line-clamp-2 leading-tight">{category.name}</span>
                                    <span className="text-[10px] text-gray-400 mt-0.5">{category.products_count}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 py-4 text-center">Toifa topilmadi</p>
                )}
            </section>

            {/* Featured Products */}
            {!search && featured_products.length > 0 && (
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-800">Mashhur tovarlar</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {featured_products.map((product) => (
                            <ProductCard key={product.id} product={product} botUsername={bot.username} botId={bot.id} />
                        ))}
                    </div>
                </section>
            )}

            {/* Per-category sections */}
            {!search && categoriesWithProducts.map((category) => (
                <section key={category.id} className="mb-7">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-800">{category.name}</h3>
                        <Link
                            href={`/store/${bot.username}/category/${category.id}`}
                            className="text-xs text-primary font-medium hover:underline"
                        >
                            Barchasi →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {category.products.map((product) => (
                            <ProductCard key={product.id} product={product} botUsername={bot.username} botId={bot.id} />
                        ))}
                    </div>
                </section>
            ))}

            {categories.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200 mt-4 flex flex-col items-center justify-center">
                    <span className="text-4xl mb-3">📭</span>
                    <h3 className="text-lg font-semibold text-gray-600">Hozircha bo'sh</h3>
                    <p className="text-sm text-gray-400 mt-1">Toifalar mavjud emas.</p>
                </div>
            )}
        </>
    );
}

Index.layout = (page: ReactNode) => <StoreLayout>{page}</StoreLayout>;
