import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Order {
    id: number;
    total_amount: string;
    payment_status: string;
    payment_method: string;
}

export default function PaymentReturn({ bot, order }: { bot: any; order: Order }) {
    const isPaid = order.payment_status === 'paid';
    const isFailed = order.payment_status === 'failed';

    return (
        <>
            <Head title={`To'lov - ${bot.name}`} />

            <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-center space-y-6 px-4">
                {isPaid ? (
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                ) : isFailed ? (
                    <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-500" />
                    </div>
                ) : (
                    <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-10 w-10 text-yellow-500" />
                    </div>
                )}

                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                        {isPaid ? "To'lov muvaffaqiyatli!" : isFailed ? "To'lov amalga oshmadi" : "To'lov kutilmoqda"}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isPaid
                            ? `Buyurtma #${order.id} uchun $${order.total_amount} to'landi.`
                            : isFailed
                            ? `Buyurtma #${order.id} uchun to'lov bekor qilindi.`
                            : `Buyurtma #${order.id} uchun to'lov tekshirilmoqda.`}
                    </p>
                </div>

                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 w-full max-w-xs space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Buyurtma ID</span>
                        <span className="font-mono font-bold">#{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Summa</span>
                        <span className="font-bold">${order.total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">To'lov usuli</span>
                        <span className="font-semibold uppercase">{order.payment_method}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button asChild variant="outline" className="rounded-full px-6">
                        <Link href={`/store/${bot.username}`}>Bosh sahifa</Link>
                    </Button>
                    <Button asChild className="rounded-full px-6">
                        <Link href={`/store/${bot.username}/orders`}>Buyurtmalarim</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

PaymentReturn.layout = (page: ReactNode) => <StoreLayout>{page}</StoreLayout>;
