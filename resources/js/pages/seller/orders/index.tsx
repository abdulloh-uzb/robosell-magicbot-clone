import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Eye } from 'lucide-react';

export default function Index({ orders }: { orders: any }) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/orders' },
    ];

    const [orderList, setOrderList] = useState<any[]>(orders.data);
    const [newOrderNotice, setNewOrderNotice] = useState(false);

    useEffect(() => {
        if (!window.Echo || !auth?.user?.id) return;

        const channel = window.Echo.private(`seller.${auth.user.id}`);

        channel.listen('.OrderPlaced', (data: any) => {
            setOrderList((prev) => [data, ...prev]);
            setNewOrderNotice(true);
            setTimeout(() => setNewOrderNotice(false), 5000);
        });

        return () => {
            channel.stopListening('.OrderPlaced');
        };
    }, [auth?.user?.id]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600">
                        {status}
                    </Badge>
                );
            case 'confirmed':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600">
                        {status}
                    </Badge>
                );
            case 'shipped':
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-600">
                        {status}
                    </Badge>
                );
            case 'delivered':
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                        {status}
                    </Badge>
                );
            case 'cancelled':
                return <Badge variant="destructive">{status}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                        <p className="text-muted-foreground mt-2">View and manage your customer orders.</p>
                    </div>
                    {newOrderNotice && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 shadow-sm">
                            <Bell className="h-4 w-4" />
                            New order received!
                        </div>
                    )}
                </div>

                <div className="rounded-md border border-sidebar-border dark:border-sidebar-border">
                    <div className="w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border dark:border-sidebar-border bg-muted/50 transition-colors">
                                    <th className="text-muted-foreground h-10 px-4 text-left font-medium">Order ID</th>
                                    <th className="text-muted-foreground h-10 px-4 text-left font-medium">Customer</th>
                                    <th className="text-muted-foreground h-10 px-4 text-left font-medium">Status</th>
                                    <th className="text-muted-foreground h-10 px-4 text-left font-medium">Total</th>
                                    <th className="text-muted-foreground h-10 px-4 text-left font-medium">Date</th>
                                    <th className="text-muted-foreground h-10 px-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="h-24 text-center">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    orderList.map((order: any) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-sidebar-border dark:border-sidebar-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle font-medium">#{order.id}</td>
                                            <td className="p-4 align-middle">
                                                {order.customer_name ?? `${order.customer?.first_name ?? ''} ${order.customer?.last_name ?? ''}`}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {getStatusBadge(typeof order.status === 'object' ? order.status.value : order.status)}
                                            </td>
                                            <td className="p-4 align-middle">${order.total_amount}</td>
                                            <td className="p-4 align-middle">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {order.id && (
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/orders/${order.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
