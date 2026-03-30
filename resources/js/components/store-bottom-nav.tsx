import { Link } from '@inertiajs/react';
import { Home, ShoppingCart, ListOrdered, User, LayoutGrid } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

interface StoreBottomNavProps {
    botUsername: string;
    botId: number;
    currentUrl: string;
}

export default function StoreBottomNav({ botUsername, botId, currentUrl }: StoreBottomNavProps) {
    const { totalItems } = useCart(botId);

    const navItems = [
        {
            name: 'Bosh sahifa',
            href: `/store/${botUsername}`,
            icon: Home,
            isActive: (url: string) => url === `/store/${botUsername}`,
        },
        {
            name: 'Katalog',
            href: `/store/${botUsername}/catalog`,
            icon: LayoutGrid,
            isActive: (url: string) =>
                url === `/store/${botUsername}/catalog` ||
                url.startsWith(`/store/${botUsername}/category/`) ||
                url.startsWith(`/store/${botUsername}/product/`),
        },
        {
            name: 'Savat',
            href: `/store/${botUsername}/cart`,
            icon: ShoppingCart,
            badge: totalItems > 0 ? totalItems : null,
            isActive: (url: string) => url === `/store/${botUsername}/cart`,
        },
        {
            name: 'Buyurtmalar',
            href: `/store/${botUsername}/orders`,
            icon: ListOrdered,
            isActive: (url: string) => url === `/store/${botUsername}/orders`,
        },
        {
            name: 'Profil',
            href: `/store/${botUsername}/profile`,
            icon: User,
            isActive: (url: string) => url === `/store/${botUsername}/profile`,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-1px_8px_rgba(0,0,0,0.06)] pb-safe">
            <nav className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
                {navItems.map((item) => {
                    const active = item.isActive(currentUrl);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors relative ${
                                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {active && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-600" />
                            )}
                            <div className="relative">
                                <item.icon
                                    className={`w-5 h-5 ${active ? 'fill-blue-100' : ''}`}
                                    strokeWidth={active ? 2.5 : 1.8}
                                />
                                {('badge' in item) && item.badge && (
                                    <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[9px] leading-none ${active ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
