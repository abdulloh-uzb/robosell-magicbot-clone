import { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Instagram, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Message {
    id: number;
    direction: 'in' | 'out';
    text: string;
    created_at: string;
}

interface Props {
    sender_id: string;
    sender_name: string;
    messages: Message[];
}

export default function InstagramChatShow({ sender_id, sender_name, messages }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [msgList, setMsgList] = useState<Message[]>(messages);
    const bottomRef = useRef<HTMLDivElement>(null);
    const form = useForm({ text: '' });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Instagram DMs', href: '/instagram/chat' },
        { title: sender_name, href: `/instagram/chat/${sender_id}` },
    ];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgList]);

    useEffect(() => {
        if (!window.Echo || !auth?.user?.id) return;

        const channel = window.Echo.private(`seller.${auth.user.id}`);

        channel.listen('.InstagramMessageReceived', (data: any) => {
            if (data.sender_id === sender_id) {
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
            channel.stopListening('.InstagramMessageReceived');
        };
    }, [auth?.user?.id, sender_id]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.text.trim()) return;

        const text = form.data.text;

        form.post(`/instagram/chat/${sender_id}/send`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setMsgList((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        direction: 'out',
                        text,
                        created_at: new Date().toISOString(),
                    },
                ]);
                form.reset('text');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Instagram – ${sender_name}`} />

            <div className="flex h-[calc(100vh-8rem)] flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 border-b px-6 py-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/instagram/chat">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                        <Instagram className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold">{sender_name}</p>
                        <p className="text-muted-foreground text-xs">Instagram DM</p>
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
