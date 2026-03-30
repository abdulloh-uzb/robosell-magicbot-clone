import type { ReactNode } from 'react';
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Banknote, CreditCard, Wallet, ChevronRight } from 'lucide-react';
import axios from 'axios';

const PAYMENT_META: Record<string, { label: string; icon: React.FC<any>; color: string; bg: string }> = {
    click: { label: 'Click', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    payme: { label: 'Payme', icon: Wallet, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    cash: { label: 'Naqd pul', icon: Banknote, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
};

export default function CartView({ bot, payment_methods }: { bot: any; payment_methods: string[] }) {
    const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart(bot.id);
    const [step, setStep] = useState<'cart' | 'payment'>('cart');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(payment_methods[0] ?? null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const availableMethods = payment_methods.length > 0 ? payment_methods : ['cash'];

    const handleCheckout = async () => {
        if (items.length === 0 || !selectedMethod) { return; }

        setIsCheckingOut(true);
        try {
            const response = await axios.post(`/store/${bot.username}/checkout`, {
                items: items.map((i) => ({
                    product_id: i.product_id,
                    variant_id: i.variant_id ?? null,
                    quantity: i.quantity,
                })),
                payment_method: selectedMethod,
            });

            if (response.data.success) {
                clearCart();

                if (response.data.redirect_url) {
                    window.location.href = response.data.redirect_url;
                    return;
                }

                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.showAlert("Buyurtma muvaffaqiyatli qabul qilindi!", () => {
                        router.visit(`/store/${bot.username}/orders`);
                    });
                } else {
                    router.visit(`/store/${bot.username}/orders`);
                }
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Buyurtma berishda xatolik yuz berdi.";
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
        <>
            <Head title={`Savat - ${bot.name}`} />

            <div className="flex items-center gap-3 mb-6 bg-white/95 backdrop-blur-md sticky top-14 py-2 z-30 -mx-4 px-4 border-b border-gray-100 shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
                    onClick={() => step === 'payment' ? setStep('cart') : undefined}
                    asChild={step === 'cart'}
                >
                    {step === 'cart' ? (
                        <Link href={`/store/${bot.username}`}>
                            <ArrowLeft className="h-4 w-4 text-gray-700" />
                        </Link>
                    ) : (
                        <ArrowLeft className="h-4 w-4 text-gray-700" onClick={() => setStep('cart')} />
                    )}
                </Button>
                <div className="flex-1">
                    <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                        {step === 'cart' ? 'Savat' : "To'lov usulini tanlang"}
                    </h2>
                    {step === 'cart' && <p className="text-xs text-gray-500">{items.length} ta mahsulot</p>}
                </div>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-5 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mx-2 mt-8">
                    <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 opacity-30" />
                    </div>
                    <p className="text-lg font-semibold text-gray-600">Savat bo'sh</p>
                    <Button asChild className="rounded-full px-8 h-12 shadow-sm">
                        <Link href={`/store/${bot.username}`}>Mahsulotlarga o'tish</Link>
                    </Button>
                </div>
            ) : step === 'cart' ? (
                <div className="space-y-6">
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.product_id} className="flex gap-4 p-3 border border-gray-100 rounded-2xl bg-white shadow-sm">
                                <Link href={`/store/${bot.username}/product/${item.product_id}`} className="block shrink-0">
                                    <div className="h-24 w-24 bg-gray-100 rounded-xl flex items-center justify-center">
                                        <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">IMG</span>
                                    </div>
                                </Link>
                                <div className="flex flex-col justify-between flex-1 py-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <Link href={`/store/${bot.username}/product/${item.product_id}`} className="hover:opacity-80 transition-opacity">
                                            <h3 className="font-bold leading-tight line-clamp-2 text-sm text-gray-800">{item.name}</h3>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0 -mr-2 -mt-2"
                                            onClick={() => removeFromCart(item.product_id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-end justify-between mt-3">
                                        <span className="font-bold text-base leading-none text-gray-900">${item.price}</span>
                                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-full pl-1 pr-3 py-1 border border-gray-200">
                                            <button
                                                className="h-6 w-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 text-gray-700"
                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-sm font-bold w-5 text-center text-gray-800">{item.quantity}</span>
                                            <button
                                                className="h-6 w-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 text-gray-700"
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

                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex justify-between items-center text-lg font-extrabold text-gray-900">
                            <span>Jami</span>
                            <span className="text-2xl">${totalPrice.toFixed(2)}</span>
                        </div>
                        <Button
                            className="w-full text-base font-bold h-14 rounded-xl shadow-lg gap-2"
                            size="lg"
                            onClick={() => setStep('payment')}
                        >
                            Buyurtma berish
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                /* Payment method selection step */
                <div className="space-y-6">
                    <div className="space-y-3">
                        {availableMethods.map((method) => {
                            const meta = PAYMENT_META[method];
                            if (!meta) { return null; }
                            const Icon = meta.icon;
                            const selected = selectedMethod === method;
                            return (
                                <button
                                    key={method}
                                    onClick={() => setSelectedMethod(method)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
                                        selected
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : 'border-gray-100 bg-white hover:border-gray-200'
                                    }`}
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${meta.bg} border`}>
                                        <Icon className={`h-6 w-6 ${meta.color}`} />
                                    </div>
                                    <span className="flex-1 text-left font-bold text-gray-900">{meta.label}</span>
                                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                                        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex justify-between items-center text-base font-semibold text-gray-700">
                            <span>Jami to'lov</span>
                            <span className="text-xl font-extrabold text-gray-900">${totalPrice.toFixed(2)}</span>
                        </div>
                        <Button
                            className="w-full text-base font-bold h-14 rounded-xl shadow-lg"
                            size="lg"
                            onClick={handleCheckout}
                            disabled={isCheckingOut || !selectedMethod}
                        >
                            {isCheckingOut ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Yuklanmoqda...
                                </span>
                            ) : (
                                `${selectedMethod ? PAYMENT_META[selectedMethod]?.label ?? selectedMethod : ''} orqali to'lash`
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

CartView.layout = (page: ReactNode) => <StoreLayout>{page}</StoreLayout>;
