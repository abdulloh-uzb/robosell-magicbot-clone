import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Instagram, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Conversation {
    sender_id: string;
    sender_name: string | null;
    last_message: {
        text: string;
        direction: 'in' | 'out';
        created_at: string;
    } | null;
    unread_count: number;
}

interface Props {
    conversations: Conversation[];
    has_account: boolean;
}

export default function InstagramChatIndex({ conversations, has_account }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [convList, setConvList] = useState<Conversation[]>(conversations);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Instagram DMs', href: '/instagram/chat' },
    ];

    useEffect(() => {
        if (!window.Echo || !auth?.user?.id) return;

        const channel = window.Echo.private(`seller.${auth.user.id}`);

        channel.listen('.InstagramMessageReceived', (data: any) => {
            setConvList((prev) => {
                const idx = prev.findIndex((c) => c.sender_id === data.sender_id);
                if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = {
                        ...updated[idx],
                        last_message: {
                            text: data.text,
                            direction: 'in',
                            created_at: data.created_at,
                        },
                        unread_count: updated[idx].unread_count + 1,
                    };
                    return updated;
                }
                return prev;
            });
        });

        return () => {
            channel.stopListening('.InstagramMessageReceived');
        };
    }, [auth?.user?.id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Instagram DMs" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Instagram DMs</h2>
                        <p className="text-muted-foreground mt-2">Direct messages from your Instagram account.</p>
                    </div>
                    {!has_account && (
                        <Button asChild>
                            <Link href="/settings/instagram">
                                <Instagram className="h-4 w-4 mr-2" />
                                Connect Instagram
                            </Link>
                        </Button>
                    )}
                </div>

                {!has_account ? (
                    <div className="rounded-lg border p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                            <Instagram className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-lg font-medium">Instagram not connected</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Connect your Instagram Business account to see DMs here.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/settings/instagram">Connect Instagram</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-lg border">
                        {convList.length === 0 ? (
                            <div className="text-muted-foreground flex flex-col items-center justify-center py-20">
                                <Instagram className="mb-4 h-12 w-12 opacity-20" />
                                <p className="text-lg font-medium">No DMs yet</p>
                                <p className="mt-1 text-sm">When someone messages you on Instagram, it'll appear here.</p>
                            </div>
                        ) : (
                            convList.map((conv, i) => (
                                <Link
                                    key={conv.sender_id}
                                    href={`/instagram/chat/${conv.sender_id}`}
                                    className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 ${i < convList.length - 1 ? 'border-b' : ''}`}
                                >
                                    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">
                                                {conv.sender_name ?? conv.sender_id}
                                            </span>
                                            {conv.last_message && (
                                                <span className="text-muted-foreground text-xs">
                                                    {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-0.5 flex items-center justify-between gap-2">
                                            <p className="text-muted-foreground line-clamp-1 text-sm">
                                                {conv.last_message
                                                    ? (conv.last_message.direction === 'out' ? 'You: ' : '') + conv.last_message.text
                                                    : 'No messages yet'}
                                            </p>
                                            {conv.unread_count > 0 && (
                                                <Badge className="h-5 min-w-5 rounded-full px-1.5 text-xs">
                                                    {conv.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
