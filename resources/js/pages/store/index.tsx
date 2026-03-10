import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function Index({ bot, categories }: { bot: any, categories: any[] }) {
    return (
        <StoreLayout bot={bot}>
            <Head title={`${bot.name} - Menu`} />
            
            <div className="mb-8 mt-2 space-y-1">
                <h2 className="text-2xl font-extrabold tracking-tight">Welcome to {bot.name}! 🚀</h2>
                <p className="text-muted-foreground">What are you looking for today?</p>
            </div>

            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                Categories
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {categories.map((category) => (
                    <Link key={category.id} href={`/store/${bot.username}/category/${category.id}`} className="block h-full group">
                        <Card className="h-full overflow-hidden border-transparent bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                            <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3 h-full">
                                <div className="h-14 w-14 bg-background shadow-sm rounded-2xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-foreground/70 font-bold text-lg uppercase tracking-wider">{category.name.substring(0,2)}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground/90">{category.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">{category.products_count} {category.products_count === 1 ? 'item' : 'items'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-16 bg-muted/30 rounded-2xl border-dashed border-2 mt-4 flex flex-col items-center justify-center">
                    <span className="text-4xl mb-3">📭</span>
                    <h3 className="text-lg font-semibold text-foreground/80">Check back later</h3>
                    <p className="text-sm text-muted-foreground mt-1">No categories available right now.</p>
                </div>
            )}
        </StoreLayout>
    );
}
