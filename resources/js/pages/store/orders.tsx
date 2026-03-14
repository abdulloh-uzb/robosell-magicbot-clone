import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        }
    };

    return (
        <StoreLayout bot={bot}>
            <Head title={`My Orders - ${bot.name}`} />

            <div className="mb-6 flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/store/${bot.username}`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h2 className="flex-1 text-xl font-bold">My Orders</h2>
            </div>

            {orderList.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center space-y-4 py-20">
                    <Package className="h-16 w-16 opacity-20" />
                    <p className="text-lg font-medium">You haven't ordered anything yet.</p>
                    <Button asChild>
                        <Link href={`/store/${bot.username}`}>Browse Products</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orderList.map((order: any) => (
                        <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <span className="text-muted-foreground font-mono text-xs">#{order.id}</span>
                                    </CardTitle>
                                    <Badge
                                        variant="secondary"
                                        className={`${getStatusColor(typeof order.status === 'object' ? order.status.value : order.status)} capitalize transition-colors duration-500`}
                                    >
                                        {typeof order.status === 'object' ? order.status.value : order.status}
                                    </Badge>
                                </div>
                                <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                                    <Clock className="h-3 w-3" />
                                    {new Date(order.created_at).toLocaleString(undefined, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground line-clamp-1 pr-4">
                                                {item.quantity}x {item.product?.name || 'Deleted Product'}
                                            </span>
                                            <span className="whitespace-nowrap font-medium">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between border-t border-dashed pt-3">
                                    <span className="text-muted-foreground font-semibold">Total</span>
                                    <span className="text-lg font-bold">${order.total_amount}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </StoreLayout>
    );
}
