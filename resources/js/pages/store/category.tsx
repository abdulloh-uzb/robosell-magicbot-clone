import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, ImageIcon, Plus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useState } from 'react';

export default function CategoryView({ bot, category, products }: { bot: any, category: any, products: any[] }) {
    const { addToCart } = useCart(bot.id);
    const [addedProductId, setAddedProductId] = useState<number | null>(null);

    const handleAddToCart = (product: any) => {
        const price = product.variants?.[0]?.price ?? product.price;
        addToCart({ id: product.id, name: product.name, price }, 1, product.variants?.[0]?.id);
        
        // Visual feedback effect
        setAddedProductId(product.id);
        
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }

        // Reset after 1s
        setTimeout(() => {
            setAddedProductId(null);
        }, 1000);
    };

    return (
        <StoreLayout bot={bot}>
            <Head title={`${category.name} - ${bot.name}`} />
            
            <div className="flex items-center gap-3 mb-6 bg-background/95 backdrop-blur-md sticky top-14 py-2 z-30 -mx-4 px-4 border-b/50 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)]">
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted">
                    <Link href={`/store/${bot.username}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-xl font-extrabold tracking-tight">{category.name}</h2>
                    <p className="text-xs text-muted-foreground">{products.length} {products.length === 1 ? 'item' : 'items'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => {
                    const isAdded = addedProductId === product.id;
                    return (
                        <Card key={product.id} className="overflow-hidden border-transparent bg-card hover:bg-muted/10 transition-all duration-300 shadow-sm hover:shadow-md">
                            <div className="flex p-3 gap-4">
                                <Link href={`/store/${bot.username}/product/${product.id}`} className="shrink-0 flex-none block">
                                    <div className="w-24 h-24 bg-muted/50 rounded-xl flex items-center justify-center overflow-hidden pointer-events-none">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0].url} className="h-full w-full object-cover" alt="" />
                                        ) : (
                                            <ImageIcon className="text-muted-foreground/30 h-8 w-8" />
                                        )}
                                    </div>
                                </Link>
                                
                                <div className="flex flex-col flex-1 py-1">
                                    <Link href={`/store/${bot.username}/product/${product.id}`} className="hover:opacity-80 transition-opacity">
                                        <h3 className="font-bold leading-tight line-clamp-2 text-sm">{product.name}</h3>
                                    </Link>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1 flex-1">{product.description || 'No description'}</p>
                                    
                                    <div className="flex items-end justify-between mt-2">
                                        <span className="font-bold text-lg leading-none">
                                            ${product.variants?.[0] ? Number(product.variants[0].price).toFixed(2) : Number(product.price).toFixed(2)}
                                        </span>
                                        <Button 
                                            size="sm" 
                                            variant={isAdded ? "secondary" : "default"}
                                            className={`h-8 rounded-full px-4 shadow-sm transition-all duration-300 ${isAdded ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}`} 
                                            onClick={() => handleAddToCart(product)}
                                            disabled={isAdded} // Prevent spamming
                                        >
                                            {isAdded ? (
                                                <><Check className="h-4 w-4 mr-1 animate-in zoom-in duration-300" /> Added</>
                                            ) : (
                                                <><Plus className="h-4 w-4 mr-1" /> Add</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {products.length === 0 && (
                <div className="text-center py-16 bg-muted/30 rounded-2xl border-dashed border-2 mt-4 flex flex-col items-center justify-center">
                    <span className="text-4xl mb-3">📦</span>
                    <h3 className="text-lg font-semibold text-foreground/80">Nothing here yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">This category is empty.</p>
                </div>
            )}
        </StoreLayout>
    );
}
