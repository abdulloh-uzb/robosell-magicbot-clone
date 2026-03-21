import { Head, Link, router, usePage } from '@inertiajs/react';
import { Instagram, ExternalLink, Unlink } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Instagram settings',
        href: '/settings/instagram',
    },
];

interface InstagramAccount {
    id: number;
    username: string;
    instagram_user_id: string;
    token_expires_at: string | null;
}

export default function InstagramSettings() {
    const { instagram_account } = usePage<{ instagram_account: InstagramAccount | null }>().props;

    const disconnect = () => {
        if (confirm('Are you sure you want to disconnect your Instagram account?')) {
            router.delete('/settings/instagram');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Instagram settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Instagram Integration"
                        description="Connect your Instagram Business account to manage DMs from your dashboard."
                    />

                    <div className="rounded-lg border p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                                <Instagram className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold">Instagram Business</p>
                                <p className="text-sm text-muted-foreground">
                                    {instagram_account
                                        ? `Connected as @${instagram_account.username}`
                                        : 'Not connected'}
                                </p>
                            </div>
                        </div>

                        {instagram_account ? (
                            <div className="space-y-3">
                                <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Username</span>
                                        <span className="font-medium">@{instagram_account.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Account ID</span>
                                        <span className="font-medium font-mono text-xs">{instagram_account.instagram_user_id}</span>
                                    </div>
                                    {instagram_account.token_expires_at && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Token expires</span>
                                            <span className="font-medium">
                                                {new Date(instagram_account.token_expires_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/instagram/chat">
                                            <ExternalLink className="h-4 w-4 mr-1" />
                                            View DMs
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={disconnect}>
                                        <Unlink className="h-4 w-4 mr-1" />
                                        Disconnect
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Connect your Instagram Business or Creator account to receive and reply to
                                    direct messages directly from your seller dashboard.
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li>Must be an Instagram Business or Creator account</li>
                                    <li>Requires a connected Facebook Page</li>
                                    <li>Messages sync in real-time via webhooks</li>
                                </ul>
                                <Button asChild>
                                    <a href="/settings/instagram/connect">
                                        <Instagram className="h-4 w-4 mr-2" />
                                        Connect Instagram
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
