import { Head, useForm, router, usePage } from '@inertiajs/react';
import type { SharedData } from '@inertiajs/core';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ban, CheckCircle, KeyRound, Copy } from 'lucide-react';

export default function Index({ sellers }: { sellers: any }) {
    const { flash } = usePage<SharedData>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Sellers', href: '/admin/sellers' },
    ];

    const toggleBlock = (seller: any) => {
        const action = seller.is_blocked ? 'unblock' : 'block';
        if (confirm(`Are you sure you want to ${action} this seller?`)) {
            router.put(`/admin/sellers/${seller.id}`, { action: 'toggle_block' }, {
                preserveScroll: true,
            });
        }
    };

    const resetPassword = (seller: any) => {
        if (confirm(`Generate a new random password for ${seller.name} and flash it to your screen?`)) {
            router.put(`/admin/sellers/${seller.id}`, { action: 'reset_password' }, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Sellers" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Seller Management</h2>
                    <p className="text-muted-foreground mt-2">
                        Super-Admin view of all registered store owners.
                    </p>
                </div>

                {flash?.generated_password && (
                    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                        <KeyRound className="h-5 w-5 shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold">New Password Generated!</h3>
                            <p className="text-sm opacity-90">
                                Please copy and securely share this password with the seller.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-white/50 px-3 py-1.5 dark:bg-black/20">
                            <span className="font-mono text-lg tracking-wider font-bold">{flash.generated_password}</span>
                            <button 
                                onClick={() => navigator.clipboard.writeText(flash.generated_password!)}
                                className="ml-2 rounded p-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                                title="Copy to clipboard"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="rounded-md border border-sidebar-border dark:border-sidebar-border">
                    <div className="w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border dark:border-sidebar-border bg-muted/50 transition-colors">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">ID</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Phone</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Bot Connected</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="h-24 text-center">
                                            No sellers found.
                                        </td>
                                    </tr>
                                ) : (
                                    sellers.data.map((seller: any) => (
                                        <tr key={seller.id} className="border-b border-sidebar-border dark:border-sidebar-border transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{seller.id}</td>
                                            <td className="p-4 align-middle">{seller.name}</td>
                                            <td className="p-4 align-middle">{seller.phone}</td>
                                            <td className="p-4 align-middle">
                                                {seller.bot ? (
                                                    <Badge variant="outline" className="font-mono">@{seller.bot.username}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground italic">None</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {seller.is_blocked ? (
                                                    <Badge variant="destructive">Blocked</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-600 bg-green-50">Active</Badge>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-right space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => resetPassword(seller)}
                                                    title="Reset Password"
                                                >
                                                    <KeyRound className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => toggleBlock(seller)}
                                                    className={seller.is_blocked ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-red-500 hover:text-red-600 hover:bg-red-50'}
                                                    title={seller.is_blocked ? "Unblock Seller" : "Block Seller"}
                                                >
                                                    {seller.is_blocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                                </Button>
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
