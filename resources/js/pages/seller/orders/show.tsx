import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CopyIcon } from 'lucide-react';

export default function Show({ order }: { order: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/orders' },
        { title: `Order #${order.id}`, href: `/orders/${order.id}` },
    ];

    const form = useForm({
        status: order.status,
    });

    const handleStatusChange = (status: string) => {
        form.setData('status', status);
        form.put(`/orders/${order.id}`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="text-yellow-600 bg-yellow-50">{status}</Badge>;
            case 'processing': return <Badge variant="outline" className="text-blue-600 bg-blue-50">{status}</Badge>;
            case 'completed': return <Badge variant="outline" className="text-green-600 bg-green-50">{status}</Badge>;
            case 'cancelled': return <Badge variant="destructive">{status}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order #${order.id}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold tracking-tight">Order #{order.id}</h2>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-muted-foreground mt-2">
                            Placed on {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        <div className="rounded-md border border-sidebar-border p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Order Items</h3>
                            <Separator />
                            <div className="space-y-4">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                                                {/* Image placeholder */}
                                                <span className="text-xs text-muted-foreground">IMG</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="font-medium">
                                            ${item.price}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span>${order.total_amount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-md border border-sidebar-border p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Customer Info</h3>
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <p><span className="text-muted-foreground">Name:</span> {order.customer?.first_name} {order.customer?.last_name}</p>
                                <p><span className="text-muted-foreground">Telegram ID:</span> {order.customer?.telegram_id}</p>
                                <p><span className="text-muted-foreground">Username:</span> {order.customer?.username ? `@${order.customer.username}` : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="rounded-md border border-sidebar-border p-6 space-y-4 bg-muted/20">
                            <h3 className="font-semibold text-lg">Update Status</h3>
                            <Separator />
                            <div className="space-y-4">
                                <Select 
                                    defaultValue={order.status}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.processing && <p className="text-xs text-muted-foreground">Updating...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
