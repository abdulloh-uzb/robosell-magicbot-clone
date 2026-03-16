import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';

export default function Index({ customers }: { customers: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/customers' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                    <p className="text-muted-foreground mt-2">
                        View the customers who interacted with your Telegram bot Store.
                    </p>
                </div>

                <div className="rounded-md border border-sidebar-border dark:border-sidebar-border">
                    <div className="w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border dark:border-sidebar-border bg-muted/50 transition-colors">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">ID</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Username</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Total Orders</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Joined At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="h-24 text-center">
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.data.map((customer: any) => (
                                        <tr key={customer.id} className="border-b border-sidebar-border dark:border-sidebar-border transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{customer.id}</td>
                                            <td className="p-4 align-middle">
                                                {customer.first_name} {customer.last_name}
                                                {customer.is_premium && <Badge className="ml-2 text-[10px]" variant="secondary">Premium</Badge>}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {customer.username ? `@${customer.username}` : '-'}
                                            </td>
                                            <td className="p-4 align-middle">{customer.orders_count || 0}</td>
                                            <td className="p-4 align-middle">{new Date(customer.created_at).toLocaleDateString()}</td>
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
