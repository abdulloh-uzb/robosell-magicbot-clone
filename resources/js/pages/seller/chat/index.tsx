import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User } from 'lucide-react';

interface Conversation {
    customer: {
        id: number;
        first_name: string;
        last_name: string;
        username: string | null;
    };
    last_message: {
        text: string;
        direction: 'in' | 'out';
        created_at: string;
    } | null;
    unread_count: number;
}

export default function ChatIndex({ conversations }: { conversations: Conversation[] }) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [convList, setConvList] = useState<Conversation[]>(conversations);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Chat', href: '/chat' },
    ];

    useEffect(() => {
        if (!window.Echo || !auth?.user?.id) return;

        const channel = window.Echo.private(`seller.${auth.user.id}`);

        channel.listen('.TelegramMessageReceived', (data: any) => {
            setConvList((prev) => {
                const idx = prev.findIndex((c) => c.customer.id === data.customer_id);
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
            channel.stopListening('.TelegramMessageReceived');
        };
    }, [auth?.user?.id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Chat</h2>
                    <p className="text-muted-foreground mt-2">Telegram conversations with customers.</p>
                </div>

                <div className="rounded-lg border">
                    {convList.length === 0 ? (
                        <div className="text-muted-foreground flex flex-col items-center justify-center py-20">
                            <MessageCircle className="mb-4 h-12 w-12 opacity-20" />
                            <p className="text-lg font-medium">No conversations yet</p>
                            <p className="mt-1 text-sm">When customers message your bot, they'll appear here.</p>
                        </div>
                    ) : (
                        convList.map((conv, i) => (
                            <Link
                                key={conv.customer.id}
                                href={`/chat/${conv.customer.id}`}
                                className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 ${i < convList.length - 1 ? 'border-b' : ''}`}
                            >
                                <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                    <User className="text-muted-foreground h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">
                                            {conv.customer.first_name} {conv.customer.last_name}
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
            </div>
        </AppLayout>
    );
}
