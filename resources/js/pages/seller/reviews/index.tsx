import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Star } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reviews', href: '/reviews' },
];

interface Review {
    id: number;
    rating: number;
    body: string | null;
    created_at: string;
    product: { id: number; name: string } | null;
    customer: { id: number; name: string; username: string | null } | null;
}

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                />
            ))}
        </div>
    );
}

export default function Index({ reviews }: { reviews: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviews" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
                    <p className="text-muted-foreground mt-2">
                        Customer reviews for your products.
                    </p>
                </div>

                <div className="rounded-md border border-sidebar-border dark:border-sidebar-border">
                    <div className="w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border dark:border-sidebar-border bg-muted/50 transition-colors">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Product</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Customer</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Rating</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Comment</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No reviews yet.
                                        </td>
                                    </tr>
                                ) : (
                                    reviews.data.map((review: Review) => (
                                        <tr
                                            key={review.id}
                                            className="border-b border-sidebar-border dark:border-sidebar-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                {review.product?.name ?? '—'}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {review.customer?.name || review.customer?.username || '—'}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <StarDisplay rating={review.rating} />
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground max-w-xs">
                                                <p className="line-clamp-2">{review.body || '—'}</p>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground text-xs whitespace-nowrap">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {reviews.last_page > 1 && (
                    <div className="flex items-center gap-2 justify-end text-sm text-muted-foreground">
                        <span>Page {reviews.current_page} of {reviews.last_page}</span>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
