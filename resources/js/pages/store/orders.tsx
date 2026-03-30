import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Package } from 'lucide-react';

export default function OrdersView({ bot, orders }: { bot: any; orders: any[] }) {
    const [orderList, setOrderList] = useState(orders);

    useEffect(() => {
        if (!window.Echo) return;

        const channels = orderList.map((order: any) => {
            const ch = window.Echo.channel(`order.${order.id}`);
            ch.listen('.OrderStatusUpdated', (data: { id: number; status: string }) => {
                setOrderList((prev) =>
                    prev.map((o: any) => (o.id === data.id ? { ...o, status: data.status } : o)),
                );
            });
            return ch;
        });

        return () => {
            channels.forEach((ch: any) => ch.stopListening('.OrderStatusUpdated'));
        };
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <>
            <Head title={`My Orders - ${bot.name}`} />

            <div className="mb-6 flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200">
                    <Link href={`/store/${bot.username}`}>
                        <ArrowLeft className="h-5 w-5 text-gray-700" />
                    </Link>
                </Button>
                <h2 className="flex-1 text-xl font-bold text-gray-900">Buyurtmalarim</h2>
            </div>

            {orderList.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-20 text-gray-400">
                    <Package className="h-16 w-16 opacity-20" />
                    <p className="text-lg font-medium text-gray-500">Hozircha buyurtma yo'q.</p>
                    <Button asChild>
                        <Link href={`/store/${bot.username}`}>Mahsulotlarga o'tish</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orderList.map((order: any) => (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            {/* Order header */}
                            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-100">
                                <div>
                                    <span className="font-mono text-xs text-gray-400">#{order.id}</span>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {new Date(order.created_at).toLocaleString(undefined, {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize transition-colors duration-500 ${getStatusStyle(typeof order.status === 'object' ? order.status.value : order.status)}`}>
                                    {typeof order.status === 'object' ? order.status.value : order.status}
                                </span>
                            </div>

                            {/* Order items */}
                            <div className="px-4 py-3 space-y-2">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-gray-500 line-clamp-1 pr-4">
                                            {item.quantity}x {item.product?.name || 'Deleted Product'}
                                        </span>
                                        <span className="whitespace-nowrap font-semibold text-gray-800">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="px-4 py-3 border-t border-dashed border-gray-100 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-500">Jami</span>
                                <span className="text-lg font-bold text-gray-900">${order.total_amount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

OrdersView.layout = (page: ReactNode) => <StoreLayout>{page}</StoreLayout>;
