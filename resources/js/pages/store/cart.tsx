import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import axios from 'axios';

export default function CartView({ bot }: { bot: any }) {
    const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart(bot.id);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        if (items.length === 0) return;
        
        setIsCheckingOut(true);
        try {
            const response = await axios.post(`/store/${bot.username}/checkout`, {
                items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
            });

            if (response.data.success) {
                clearCart();
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.showAlert('Order placed successfully!', () => {
                        window.Telegram.WebApp.close();
                    });
                } else {
                    alert('Order placed successfully!');
                    router.visit(`/store/${bot.username}/orders`);
                }
            }
        } catch (error: any) {
            console.error('Checkout failed', error);
            const msg = error.response?.data?.message || 'Failed to place order. Please try again.';
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.showAlert(msg);
            } else {
                alert(msg);
            }
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <StoreLayout bot={bot}>
            <Head title={`Cart - ${bot.name}`} />
            
            <div className="flex items-center gap-3 mb-6 bg-background/95 backdrop-blur-md sticky top-14 py-2 z-30 -mx-4 px-4 border-b/50 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)]">
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted">
                    <Link href={`/store/${bot.username}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-xl font-extrabold tracking-tight">Your Cart</h2>
                    <p className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-5 bg-muted/20 rounded-3xl border border-dashed mx-2 mt-8">
                    <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 opacity-30" />
                    </div>
                    <p className="text-lg font-semibold text-foreground/80">Your cart is empty</p>
                    <Button asChild className="rounded-full px-8 h-12 shadow-sm">
                        <Link href={`/store/${bot.username}`}>Browse Products</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.product_id} className="flex gap-4 p-3 border border-border/50 rounded-2xl bg-card shadow-sm">
                                <Link href={`/store/${bot.username}/product/${item.product_id}`} className="block shrink-0">
                                    <div className="h-24 w-24 bg-muted/50 rounded-xl flex items-center justify-center">
                                        <span className="text-[10px] text-muted-foreground/40 font-bold tracking-widest uppercase">IMG</span>
                                    </div>
                                </Link>
                                <div className="flex flex-col justify-between flex-1 py-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <Link href={`/store/${bot.username}/product/${item.product_id}`} className="hover:opacity-80 transition-opacity">
                                            <h3 className="font-bold leading-tight line-clamp-2 text-sm">{item.name}</h3>
                                        </Link>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0 -mr-2 -mt-2"
                                            onClick={() => removeFromCart(item.product_id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-end justify-between mt-3">
                                        <span className="font-bold text-base leading-none">${item.price}</span>
                                        <div className="flex items-center gap-1.5 bg-muted/40 rounded-full pl-1 pr-3 py-1 border border-border/50">
                                            <button 
                                                className="h-6 w-6 rounded-full bg-background border shadow-xs flex items-center justify-center hover:bg-muted"
                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                                            <button 
                                                className="h-6 w-6 rounded-full bg-background border shadow-xs flex items-center justify-center hover:bg-muted"
                                                onClick={() => updateQuantity(item.product_id, Math.min(item.quantity + 1, item.max_quantity || 99))}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex justify-between items-center text-lg font-extrabold">
                            <span>Total</span>
                            <span className="text-2xl">${totalPrice.toFixed(2)}</span>
                        </div>
                        <Button 
                            className="w-full text-base font-bold h-14 rounded-xl shadow-lg shadow-primary/20" 
                            size="lg"
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                        >
                            {isCheckingOut ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </span>
                            ) : (
                                'Checkout'
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </StoreLayout>
    );
}
