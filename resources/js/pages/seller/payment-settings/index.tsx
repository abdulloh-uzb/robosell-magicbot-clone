import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { CheckCircle2, CreditCard, Wallet, Banknote } from 'lucide-react';

interface PaymentMethod {
    type: string;
    enabled: boolean;
    credentials: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Payment Settings', href: '/payment-settings' },
];

const METHOD_META: Record<string, { label: string; icon: React.FC<any>; color: string; fields: { key: string; label: string; placeholder: string }[] }> = {
    click: {
        label: 'Click',
        icon: CreditCard,
        color: 'text-blue-600',
        fields: [
            { key: 'service_id', label: 'Service ID', placeholder: 'Enter service ID' },
            { key: 'merchant_id', label: 'Merchant ID', placeholder: 'Enter merchant ID' },
            { key: 'secret_key', label: 'Secret Key', placeholder: 'Enter secret key' },
        ],
    },
    payme: {
        label: 'Payme',
        icon: Wallet,
        color: 'text-teal-600',
        fields: [
            { key: 'merchant_id', label: 'Merchant ID', placeholder: 'Enter merchant ID' },
            { key: 'secret_key', label: 'Secret Key', placeholder: 'Enter secret key' },
        ],
    },
    cash: {
        label: 'Naqd pul',
        icon: Banknote,
        color: 'text-green-600',
        fields: [],
    },
};

export default function PaymentSettingsIndex({ methods }: { methods: PaymentMethod[] }) {
    const [data, setData] = useState<PaymentMethod[]>(methods);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const update = (type: string, patch: Partial<PaymentMethod>) => {
        setData((prev) => prev.map((m) => (m.type === type ? { ...m, ...patch } : m)));
    };

    const setCredential = (type: string, key: string, value: string) => {
        setData((prev) =>
            prev.map((m) =>
                m.type === type ? { ...m, credentials: { ...m.credentials, [key]: value } } : m,
            ),
        );
    };

    const handleSave = () => {
        setSaving(true);
        router.post(
            '/payment-settings',
            { methods: data },
            {
                onSuccess: () => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 3000);
                },
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">To'lov sozlamalari</h2>
                        <p className="text-muted-foreground mt-1">Qabul qilinadigan to'lov usullarini yoqing va sozlang.</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saved ? (
                            <><CheckCircle2 className="h-4 w-4" /> Saqlandi</>
                        ) : saving ? (
                            <>
                                <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                Saqlanmoqda...
                            </>
                        ) : (
                            'Saqlash'
                        )}
                    </Button>
                </div>

                <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-3">
                    {data.map((method) => {
                        const meta = METHOD_META[method.type];
                        if (!meta) { return null; }
                        const Icon = meta.icon;

                        return (
                            <div
                                key={method.type}
                                className={`rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 ${method.enabled ? 'ring-2 ring-primary/20 border-primary/30' : ''}`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center`}>
                                            <Icon className={`h-5 w-5 ${meta.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base">{meta.label}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {method.enabled ? 'Yoqilgan' : 'O\'chirilgan'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => update(method.type, { enabled: !method.enabled })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                                            method.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                                method.enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Credential fields */}
                                {meta.fields.length > 0 && (
                                    <div className={`space-y-3 transition-opacity duration-200 ${method.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        {meta.fields.map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                                    {field.label}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={method.credentials[field.key] ?? ''}
                                                    onChange={(e) => setCredential(method.type, field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {meta.fields.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        Naqd pulda hech qanday sozlamalar talab qilinmaydi.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
