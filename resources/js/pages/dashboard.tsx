import { Head, usePage } from '@inertiajs/react';
import type { SharedData } from '@inertiajs/core';
import { Copy, KeyRound } from 'lucide-react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { flash } = usePage<SharedData>().props;
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash?.generated_password && (
                    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                        <KeyRound className="h-5 w-5 shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold">Welcome to your new Seller Dashboard!</h3>
                            <p className="text-sm opacity-90">
                                Your login requires your phone number and an auto-generated password. Please copy and save your password securely now.
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
                
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
