import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

interface Category {
    id: number;
    name: string;
    image: string | null;
    products_count: number;
}

export default function Catalog({ bot, categories }: { bot: any; categories: Category[] }) {
    return (
        <>
            <Head title={`Katalog - ${bot.name}`} />

            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Katalog</h2>

            {categories.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/store/${bot.username}/category/${category.id}`}
                            className="block group"
                        >
                            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                                {category.image ? (
                                    <div className="aspect-square w-full overflow-hidden bg-gray-50">
                                        <img
                                            src={`/storage/${category.image}`}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-2xl font-extrabold text-gray-400 uppercase tracking-wider">
                                            {category.name.substring(0, 2)}
                                        </span>
                                    </div>
                                )}
                                <div className="p-3">
                                    <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight">{category.name}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {category.products_count} mahsulot
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200 flex flex-col items-center justify-center">
                    <span className="text-4xl mb-3">📦</span>
                    <h3 className="text-lg font-semibold text-gray-600">Toifalar mavjud emas</h3>
                    <p className="text-sm text-gray-400 mt-1">Hozircha hech narsa yo'q.</p>
                </div>
            )}
        </>
    );
}

Catalog.layout = (page: ReactNode) => <StoreLayout>{page}</StoreLayout>;
