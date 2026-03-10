import { Link } from '@inertiajs/react';
import { Home, ShoppingCart, ListOrdered, User } from 'lucide-react';
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
            name: 'Home',
            href: `/store/${botUsername}`,
            icon: Home,
            isActive: (url: string) => url === `/store/${botUsername}` || url.startsWith(`/store/${botUsername}/category/`) || url.startsWith(`/store/${botUsername}/product/`),
        },
        {
            name: 'Cart',
            href: `/store/${botUsername}/cart`,
            icon: ShoppingCart,
            badge: totalItems > 0 ? totalItems : null,
            isActive: (url: string) => url === `/store/${botUsername}/cart`,
        },
        {
            name: 'Orders',
            href: `/store/${botUsername}/orders`,
            icon: ListOrdered,
            isActive: (url: string) => url === `/store/${botUsername}/orders`,
        },
        {
            name: 'Profile',
            href: `/store/${botUsername}/profile`,
            icon: User,
            isActive: (url: string) => url === `/store/${botUsername}/profile`,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t pb-safe">
            <nav className="flex items-center justify-around h-16 px-4 max-w-md mx-auto">
                {navItems.map((item) => {
                    const active = item.isActive(currentUrl);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${
                                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <div className="relative">
                                <item.icon className={`w-6 h-6 ${active ? 'fill-primary/20' : ''}`} strokeWidth={active ? 2.5 : 2} />
                                {item.badge && (
                                    <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
