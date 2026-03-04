import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Instagram, MessageCircle, Package, ShoppingCart } from 'lucide-react';

interface ChartPoint {
    label: string;
    count: number;
}

interface TopProduct {
    name: string;
    total_sold: number;
}

interface StatusBreakdown {
    status: string;
    count: number;
}

function MiniBarChart({ data }: { data: ChartPoint[] }) {
    const max = Math.max(...data.map((d) => d.count), 1);
    // Show only last 14 points to avoid clutter
    const visible = data.slice(-14);

    return (
        <div className="flex h-32 items-end gap-1">
            {visible.map((point, i) => (
                <div key={i} className="group relative flex flex-1 flex-col items-center">
                    <div
                        className="w-full rounded-sm bg-primary/80 transition-all duration-300 group-hover:bg-primary"
                        style={{ height: `${Math.max((point.count / max) * 100, 4)}%` }}
                    />
                    <span className="text-muted-foreground absolute -bottom-5 text-[9px] rotate-45 origin-left hidden group-hover:block">
                        {point.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard({
    bot,
    stats,
    chart_data,
    top_products,
    status_breakdown,
    period,
}: {
    bot: any;
    stats: any;
    chart_data: ChartPoint[];
    top_products: TopProduct[];
    status_breakdown: StatusBreakdown[];
    period: string;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
    ];

    const setPeriod = (p: string) => router.get('/dashboard', { period: p }, { preserveState: true });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seller Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="mb-2">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {bot?.name}!</h2>
                    <p className="text-muted-foreground mt-2">Here's an overview of your store's performance.</p>
                </div>

                {/* Stats cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_orders ?? 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                            <Package className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_products ?? 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Telegram Leads</CardTitle>
                            <MessageCircle className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.telegram_leads ?? 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Instagram Leads</CardTitle>
                            <Instagram className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.instagram_leads ?? 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Orders</CardTitle>
                            <div className="flex gap-1">
                                {['daily', 'weekly', 'monthly'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                                            period === p
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <MiniBarChart data={chart_data ?? []} />
                        <div className="text-muted-foreground mt-6 flex justify-between text-xs">
                            <span>{chart_data?.[0]?.label}</span>
                            <span>{chart_data?.[chart_data.length - 1]?.label}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Top products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {top_products && top_products.length > 0 ? (
                                <div className="space-y-3">
                                    {top_products.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground w-5 text-sm font-medium">
                                                    {i + 1}.
                                                </span>
                                                <span className="line-clamp-1 text-sm font-medium">{p.name}</span>
                                            </div>
                                            <span className="text-muted-foreground text-sm">{p.total_sold} sold</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No sales data yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Status breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {status_breakdown?.map((s) => (
                                    <div key={s.status} className="flex items-center justify-between">
                                        <Badge
                                            variant="secondary"
                                            className={`${statusColors[s.status] ?? ''} capitalize`}
                                        >
                                            {s.status}
                                        </Badge>
                                        <span className="text-sm font-medium">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
