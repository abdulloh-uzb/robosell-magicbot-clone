import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

type ProfilePageProps = {
    auth: {
        user: {
            name: string;
            email: string;
            email_verified_at: string | null;
            ai_auto_reply_enabled?: boolean;
            notification_email?: string | null;
            notification_telegram_chat_id?: string | null;
            delivery_info?: string | null;
        };
        is_seller: boolean;
        ai_configured: boolean;
    };
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<ProfilePageProps>().props;
    const [aiAutoReply, setAiAutoReply] = useState(
        () => auth.ai_configured && Boolean(auth.user?.ai_auto_reply_enabled),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {auth.is_seller && (
                                    <>
                                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                                            <div>
                                                <h3 className="text-sm font-medium text-foreground">Chat auto-replies</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    When enabled, new Telegram and Instagram direct messages get an automatic
                                                    reply grounded in your product catalog. The AI refuses off-topic questions
                                                    and hands off complaints, refunds, or missing products to you.
                                                </p>
                                            </div>
                                            {!auth.ai_configured && (
                                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                                    Set an AI provider key (e.g.{' '}
                                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">OPENAI_API_KEY</code>
                                                    ) in your server environment to enable auto-replies.
                                                </p>
                                            )}
                                            <input type="hidden" name="ai_auto_reply_enabled" value={aiAutoReply ? 1 : 0} />
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id="ai_auto_reply_enabled"
                                                    checked={aiAutoReply}
                                                    disabled={!auth.ai_configured}
                                                    onCheckedChange={(v) => setAiAutoReply(v === true)}
                                                />
                                                <Label htmlFor="ai_auto_reply_enabled" className="text-sm font-normal cursor-pointer">
                                                    Enable AI auto-replies for incoming chats
                                                </Label>
                                            </div>
                                            <InputError message={errors.ai_auto_reply_enabled} />

                                            <div className="grid gap-2 pt-2">
                                                <Label htmlFor="delivery_info">Delivery & shop policies</Label>
                                                <Textarea
                                                    id="delivery_info"
                                                    name="delivery_info"
                                                    defaultValue={auth.user.delivery_info ?? ''}
                                                    placeholder="Yetkazib berish Toshkent bo'yicha bepul, boshqa viloyatlarga Yandex Express. To'lov: Click, Payme, naqd."
                                                    rows={3}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    The AI uses this verbatim when a customer asks about delivery or policies.
                                                </p>
                                                <InputError message={errors.delivery_info} />
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                                            <div>
                                                <h3 className="text-sm font-medium text-foreground">AI event notifications</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Where to notify you about orders captured by the AI, off-topic messages,
                                                    and handoffs.
                                                </p>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="notification_email">Notification email</Label>
                                                <Input
                                                    id="notification_email"
                                                    type="email"
                                                    name="notification_email"
                                                    defaultValue={auth.user.notification_email ?? ''}
                                                    placeholder="orders@myshop.uz"
                                                />
                                                <InputError message={errors.notification_email} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="notification_telegram_chat_id">Telegram chat/group ID</Label>
                                                <Input
                                                    id="notification_telegram_chat_id"
                                                    name="notification_telegram_chat_id"
                                                    defaultValue={auth.user.notification_telegram_chat_id ?? ''}
                                                    placeholder="-1001234567890"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    For a group, add your bot to the group first, then paste the group ID here.
                                                </p>
                                                <InputError message={errors.notification_telegram_chat_id} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
