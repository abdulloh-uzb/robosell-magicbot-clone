import { useEffect, useRef, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Bold, Italic, Radio, Send, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Message {
    id: number;
    direction: 'in' | 'out';
    text: string;
    sender_name: string | null;
    created_at: string;
}

interface Bot {
    id: number;
    name: string;
    username: string;
    channel_id: string | null;
}

interface Props {
    bot: Bot | null;
    messages: Message[];
}

export default function ChannelIndex({ bot, messages }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [msgList, setMsgList] = useState<Message[]>(messages);
    const [showChannelForm, setShowChannelForm] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Channel', href: '/channel' },
    ];

    const postForm = useForm({ text: '', parse_mode: 'HTML' });
    const channelForm = useForm({ channel_id: bot?.channel_id ?? '' });

    useEffect(() => {
        if (!window.Echo || !auth?.user?.id) return;

        const channel = window.Echo.private(`seller.${auth.user.id}`);

        channel.listen('.TelegramMessageReceived', (data: any) => {
            if (data.type === 'group') {
                setMsgList((prev) => [
                    {
                        id: data.id,
                        direction: 'in',
                        text: data.text,
                        sender_name: data.sender_name,
                        created_at: data.created_at,
                    },
                    ...prev,
                ]);
            }
        });

        return () => {
            channel.stopListening('.TelegramMessageReceived');
        };
    }, [auth?.user?.id]);

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!postForm.data.text.trim()) return;

        postForm.post('/channel/post', {
            onSuccess: () => {
                setMsgList((prev) => [
                    {
                        id: Date.now(),
                        direction: 'out',
                        text: postForm.data.text,
                        sender_name: null,
                        created_at: new Date().toISOString(),
                    },
                    ...prev,
                ]);
                postForm.reset('text');
            },
        });
    };

    const handleChannelSave = (e: React.FormEvent) => {
        e.preventDefault();
        channelForm.patch(`/settings/bots/${bot?.id}/channel`, {
            onSuccess: () => setShowChannelForm(false),
        });
    };

    const insertTag = (open: string, close: string) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = postForm.data.text.substring(start, end);
        const newText =
            postForm.data.text.substring(0, start) +
            open + selected + close +
            postForm.data.text.substring(end);
        postForm.setData('text', newText);
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start + open.length, start + open.length + selected.length);
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (postForm.data.text.trim() && bot?.channel_id && !postForm.processing) {
                handlePost(e as any);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Channel / Group" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Channel / Group</h2>
                        <p className="text-muted-foreground mt-2">
                            {bot?.channel_id
                                ? `Connected to: ${bot.channel_id}`
                                : 'No channel connected. Add your bot to a Telegram channel or group as admin and save its Chat ID.'}
                        </p>
                    </div>
                    {bot && (
                        <Button variant="outline" size="sm" onClick={() => setShowChannelForm((v) => !v)}>
                            <Settings className="h-4 w-4 mr-1" />
                            {bot.channel_id ? 'Change Channel' : 'Connect Channel'}
                        </Button>
                    )}
                </div>

                {/* Channel connect form */}
                {showChannelForm && bot && (
                    <form onSubmit={handleChannelSave} className="rounded-lg border p-4 space-y-3 max-w-md">
                        <div className="space-y-1">
                            <Label>Telegram Chat ID</Label>
                            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex gap-2 text-sm text-amber-800 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                    Add <strong>@{bot.username}</strong> as <strong>admin</strong> to your channel/group.
                                    Then get the Chat ID using <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">@getidsbot</code> in Telegram.
                                    Channel IDs start with <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">-100</code> (e.g. <code className="font-mono">-1001234567890</code>).
                                </div>
                            </div>
                            <Input
                                value={channelForm.data.channel_id}
                                onChange={(e) => channelForm.setData('channel_id', e.target.value)}
                                placeholder="-1001234567890 or @mychannel"
                            />
                            {channelForm.errors.channel_id && (
                                <p className="text-destructive text-sm">{channelForm.errors.channel_id}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={channelForm.processing}>
                                Save
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setShowChannelForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}

                {/* Post to channel */}
                {bot?.channel_id && (
                    <form onSubmit={handlePost} className="rounded-lg border p-4 space-y-3">
                        {/* Formatting toolbar */}
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground mr-1">Format:</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => insertTag('<b>', '</b>')}
                                title="Bold"
                            >
                                <Bold className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => insertTag('<i>', '</i>')}
                                title="Italic"
                            >
                                <Italic className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 font-mono text-xs"
                                onClick={() => insertTag('<code>', '</code>')}
                                title="Code"
                            >
                                {'</>'}
                            </Button>
                        </div>

                        <Textarea
                            ref={textareaRef}
                            value={postForm.data.text}
                            onChange={(e) => postForm.setData('text', e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Write a post to the channel... (Ctrl+Enter to send)"
                            className="min-h-[100px] resize-y"
                            autoComplete="off"
                        />

                        {postForm.errors.text && (
                            <p className="text-destructive text-sm">{postForm.errors.text}</p>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                {postForm.data.text.length}/4096 · HTML formatting supported · Ctrl+Enter to send
                            </span>
                            <Button type="submit" disabled={postForm.processing || !postForm.data.text.trim()}>
                                <Send className="h-4 w-4 mr-1" />
                                Post
                            </Button>
                        </div>
                    </form>
                )}

                {/* Message feed */}
                <div className="rounded-lg border flex-1 overflow-y-auto max-h-[500px]">
                    {msgList.length === 0 ? (
                        <div className="text-muted-foreground flex flex-col items-center justify-center py-20">
                            <Radio className="mb-4 h-12 w-12 opacity-20" />
                            <p className="text-lg font-medium">No messages yet</p>
                            <p className="mt-1 text-sm">
                                {bot?.channel_id
                                    ? 'Messages from the group and your posts will appear here.'
                                    : 'Connect a channel or group to get started.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {msgList.map((msg) => (
                                <div key={msg.id} className="flex gap-3 p-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {msg.direction === 'in' && msg.sender_name && (
                                                <span className="text-xs font-semibold text-primary">
                                                    {msg.sender_name}
                                                </span>
                                            )}
                                            {msg.direction === 'out' && (
                                                <span className="text-xs font-semibold text-muted-foreground">You (via bot)</span>
                                            )}
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {new Date(msg.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
