import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Radio, RotateCcw } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

function ChannelForm({ bot, onClose }: { bot: any; onClose: () => void }) {
    const form = useForm({ channel_id: bot.channel_id ?? '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.patch(`/settings/bots/${bot.id}/channel`, { onSuccess: onClose });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-md bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
                Add @{bot.username} as admin to your channel/group, then paste the Chat ID (e.g.{' '}
                <code className="font-mono">-1001234567890</code> or <code className="font-mono">@mychannel</code>).
            </p>
            <div className="flex gap-2">
                <Input
                    value={form.data.channel_id}
                    onChange={(e) => form.setData('channel_id', e.target.value)}
                    placeholder="-1001234567890"
                    className="h-8 text-xs"
                />
                <Button type="submit" size="sm" disabled={form.processing}>Save</Button>
                <Button type="button" size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
            </div>
            {form.errors.channel_id && (
                <p className="text-destructive text-xs">{form.errors.channel_id}</p>
            )}
        </form>
    );
}

export default function BotsSettings({ bots }: { bots: any[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingChannelFor, setEditingChannelFor] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/bots', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this bot? This action will break the bot until it receives a new webhook.')) {
            router.delete(`/settings/bots/${id}`);
        }
    };

    const handleResetWebhook = (id: number) => {
        router.post(`/settings/bots/${id}/reset-webhook`);
    };

    return (
        <SettingsLayout>
            <Head title="Bot Settings" />

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Telegram Bots & Channels</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your connected Telegram bots. Connect a channel or group to each bot for broadcasting.
                    </p>
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add New Bot
                    </Button>
                </div>

                <div className="rounded-md border border-sidebar-border overflow-hidden">
                    {bots.length === 0 ? (
                        <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                            No bots connected yet.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {bots.map((bot) => (
                                <div key={bot.id} className="p-4 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-sm">{bot.name}</span>
                                            <Badge variant="outline" className="font-mono text-xs">@{bot.username}</Badge>
                                            {bot.channel_id && (
                                                <Badge variant="secondary" className="text-xs gap-1">
                                                    <Radio className="h-3 w-3" />
                                                    {bot.channel_id}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingChannelFor(editingChannelFor === bot.id ? null : bot.id)}
                                                className="text-xs"
                                            >
                                                <Radio className="h-3.5 w-3.5 mr-1" />
                                                {bot.channel_id ? 'Edit Channel' : 'Connect Channel'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleResetWebhook(bot.id)}
                                                className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                                title="Reset webhook if bot stopped receiving messages"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                                Reset
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(bot.id)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    {editingChannelFor === bot.id && (
                                        <ChannelForm
                                            bot={bot}
                                            onClose={() => setEditingChannelFor(null)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Bot Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Telegram Bot</DialogTitle>
                        <DialogDescription>
                            Enter your Bot Token from @BotFather to connect it to your store.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="token">Bot Token</Label>
                                <Input
                                    id="token"
                                    type="password"
                                    value={data.token}
                                    onChange={(e) => setData('token', e.target.value)}
                                    placeholder="123456789:ABCDefghIJKlmnOPQRstUVwxyz"
                                />
                                {errors.token && (
                                    <p className="text-sm font-medium text-destructive">{errors.token}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Connecting...' : 'Connect Bot'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </SettingsLayout>
    );
}
