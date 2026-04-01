import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Eye, Search, X, CheckCircle, XCircle, Truck } from 'lucide-react';

interface Order {
    id: number;
    status: string | { value: string };
    payment_method: string | null;
    payment_status: string;
    total_amount: string;
    created_at: string;
    customer?: { first_name?: string; last_name?: string; username?: string } | null;
    customer_name?: string;
}

interface TabCounts {
    all: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    overdue: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/orders' },
];

const TABS = [
    { key: 'all', label: 'Barchasi' },
    { key: 'pending', label: 'Yangi' },
    { key: 'confirmed', label: 'Jarayonda' },
    { key: 'overdue', label: "Muddati o'tgan" },
    { key: 'shipped', label: "Yo'lda" },
    { key: 'delivered', label: 'Tayyor' },
    { key: 'cancelled', label: 'Bekor qilingan' },
];

function statusLabel(status: string): string {
    switch (status) {
        case 'pending': return 'Yangi';
        case 'confirmed': return 'Jarayonda';
        case 'shipped': return "Yo'lda";
        case 'delivered': return 'Tayyor';
        case 'cancelled': return 'Bekor qilingan';
        default: return status;
    }
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: 'bg-green-50 text-green-700 border-green-200',
        confirmed: 'bg-orange-50 text-orange-700 border-orange-200',
        shipped: 'bg-purple-50 text-purple-700 border-purple-200',
        delivered: 'bg-blue-50 text-blue-700 border-blue-200',
        cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            {statusLabel(status)}
        </span>
    );
}

function PaymentBadge({ method, paymentStatus }: { method: string | null; paymentStatus: string }) {
    if (!method) { return null; }
    const isPaid = paymentStatus === 'paid';
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isPaid ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {method.toUpperCase()}
            {isPaid && <span className="text-green-500">✓</span>}
        </span>
    );
}

export default function OrdersIndex({
    orders,
    counts,
    tab,
    search: initialSearch,
}: {
    orders: any;
    counts: TabCounts;
    tab: string;
    search: string;
}) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [orderList, setOrderList] = useState<Order[]>(orders.data);
    const [search, setSearch] = useState(initialSearch ?? '');
    const [newOrderNotice, setNewOrderNotice] = useState(false);

    useEffect(() => {
        if (!window.Echo || !auth?.user?.id) { return; }
        const channel = window.Echo.private(`seller.${auth.user.id}`);
        channel.listen('.OrderPlaced', (data: any) => {
            setOrderList((prev) => [data, ...prev]);
            setNewOrderNotice(true);
            setTimeout(() => setNewOrderNotice(false), 5000);
        });
        return () => { channel.stopListening('.OrderPlaced'); };
    }, [auth?.user?.id]);

    const goToTab = (newTab: string) => {
        router.get('/orders', { tab: newTab, search }, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/orders', { tab, search }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get('/orders', { tab, search: '' }, { preserveState: true, replace: true });
    };

    const updateStatus = (orderId: number, newStatus: string) => {
        router.patch(
            `/orders/${orderId}`,
            { status: newStatus },
            {
                preserveState: true,
                onSuccess: () => {
                    setOrderList((prev) =>
                        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
                    );
                },
            },
        );
    };

    const getStatusStr = (order: Order) =>
        typeof order.status === 'object' ? order.status.value : order.status;

    const customerName = (order: Order) =>
        order.customer_name ??
        `${order.customer?.first_name ?? ''} ${order.customer?.last_name ?? ''}`.trim() ||
        order.customer?.username ||
        '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <div className="flex h-full flex-1 flex-col gap-4 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Buyurtmalar ro'yxati</h2>
                    </div>
                    {newOrderNotice && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 shadow-sm">
                            <Bell className="h-4 w-4" />
                            Yangi buyurtma keldi!
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b overflow-x-auto pb-0 scrollbar-none">
                    {TABS.map((t) => {
                        const count = counts[t.key as keyof TabCounts] ?? 0;
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => goToTab(t.key)}
                                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                    active
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t.label}
                                {count > 0 && (
                                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[18px] text-center ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buyurtma ID'si, mijoz ismi yoki username bo'yicha qidirish"
                        className="w-full rounded-lg border bg-background pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {search && (
                        <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </form>

                {/* Table */}
                <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Buyurtma ID</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Mijoz</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Sana</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Narx</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">To'lov</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Holat</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Harakat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="h-24 text-center text-muted-foreground">
                                            Buyurtma topilmadi.
                                        </td>
                                    </tr>
                                ) : (
                                    orderList.map((order) => {
                                        const status = getStatusStr(order);
                                        return (
                                            <tr key={order.id} className="border-b transition-colors hover:bg-muted/30">
                                                <td className="px-4 py-3 font-mono font-medium">#{order.id}</td>
                                                <td className="px-4 py-3">{customerName(order)}</td>
                                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                    {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                                                </td>
                                                <td className="px-4 py-3 font-semibold">${order.total_amount}</td>
                                                <td className="px-4 py-3">
                                                    <PaymentBadge method={order.payment_method} paymentStatus={order.payment_status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 px-2.5 text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1"
                                                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                                                >
                                                                    <XCircle className="h-3.5 w-3.5" />
                                                                    Bekor
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700 gap-1"
                                                                    onClick={() => updateStatus(order.id, 'confirmed')}
                                                                >
                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                    Qabul
                                                                </Button>
                                                            </>
                                                        )}
                                                        {status === 'confirmed' && (
                                                            <Button
                                                                size="sm"
                                                                className="h-7 px-2.5 text-xs gap-1"
                                                                onClick={() => updateStatus(order.id, 'shipped')}
                                                            >
                                                                <Truck className="h-3.5 w-3.5" />
                                                                Jo'natish
                                                            </Button>
                                                        )}
                                                        {status === 'shipped' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 px-2.5 text-xs gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                onClick={() => updateStatus(order.id, 'delivered')}
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                                Yetkazildi
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                            <Link href={`/orders/${order.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Jami {orders.total} ta buyurtma</span>
                        <div className="flex gap-2">
                            {orders.prev_page_url && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={orders.prev_page_url}>← Oldingi</Link>
                                </Button>
                            )}
                            <span className="flex items-center px-2">{orders.current_page} / {orders.last_page}</span>
                            {orders.next_page_url && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={orders.next_page_url}>Keyingi →</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
