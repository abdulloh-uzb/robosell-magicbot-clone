import { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
    id: number;
    direction: 'in' | 'out';
    text: string;
    created_at: string;
}

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    username: string | null;
}

export default function ChatShow({ customer, messages }: { customer: Customer; messages: Message[] }) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [msgList, setMsgList] = useState<Message[]>(messages);
    const bottomRef = useRef<HTMLDivElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Chat', href: '/chat' },
        { title: `${customer.first_name} ${customer.last_name}`, href: `/chat/${customer.id}` },
    ];

    const form = useForm({ text: '' });

    // Scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgList]);

    useEffect(() => {
        if (!window.Echo || !auth?.user?.id) return;

        const channel = window.Echo.private(`seller.${auth.user.id}`);

        channel.listen('.TelegramMessageReceived', (data: any) => {
            if (data.customer_id === customer.id) {
                setMsgList((prev) => [
                    ...prev,
                    {
                        id: data.id,
                        direction: 'in',
                        text: data.text,
                        created_at: data.created_at,
                    },
                ]);
            }
        });

        return () => {
            channel.stopListening('.TelegramMessageReceived');
        };
    }, [auth?.user?.id, customer.id]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.text.trim()) return;

        form.post(`/chat/${customer.id}/send`, {
            onSuccess: () => {
                setMsgList((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        direction: 'out',
                        text: form.data.text,
                        created_at: new Date().toISOString(),
                    },
                ]);
                form.reset('text');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat – ${customer.first_name} ${customer.last_name}`} />

            <div className="flex h-[calc(100vh-8rem)] flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 border-b px-6 py-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/chat">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <p className="font-semibold">
                            {customer.first_name} {customer.last_name}
                        </p>
                        {customer.username && (
                            <p className="text-muted-foreground text-xs">@{customer.username}</p>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                    {msgList.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                                    msg.direction === 'out'
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-muted rounded-bl-sm'
                                }`}
                            >
                                <p>{msg.text}</p>
                                <p
                                    className={`mt-1 text-right text-[10px] ${
                                        msg.direction === 'out' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                    }`}
                                >
                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="flex items-center gap-2 border-t px-6 py-4">
                    <Input
                        value={form.data.text}
                        onChange={(e) => form.setData('text', e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1"
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={form.processing || !form.data.text.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
