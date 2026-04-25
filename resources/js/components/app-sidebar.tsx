import { Link, router, usePage } from '@inertiajs/react';
import { Bot, ChevronDown, CreditCard, Image, LayoutGrid, MessageCircle, Package, Radio, ShieldAlert, ShoppingCart, Star, Tags, Users } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const navGroups = [
    {
        label: 'Asosiy',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
            { title: 'Buyurtmalar', href: '/orders', icon: ShoppingCart },
            { title: 'Mijozlar', href: '/customers', icon: Users },
        ] as NavItem[],
    },
    {
        label: 'Katalog',
        items: [
            { title: 'Mahsulotlar', href: '/products', icon: Package },
            { title: 'Toifalar', href: '/categories', icon: Tags },
            { title: 'Bannerlar', href: '/banners', icon: Image },
            { title: 'Sharhlar', href: '/reviews', icon: Star },
        ] as NavItem[],
    },
    {
        label: 'Moliya',
        items: [
            { title: "To'lov sozlamalari", href: '/payment-settings', icon: CreditCard },
        ] as NavItem[],
    },
    {
        label: 'Aloqa',
        items: [
            { title: 'Xabarlar', href: '/chat', icon: MessageCircle },
            { title: 'Kanal', href: '/channel', icon: Radio },
        ] as NavItem[],
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Manage Sellers',
        href: '/admin/sellers',
        icon: ShieldAlert,
    },
];

export function AppSidebar() {
    const { auth, bots, active_bot_id } = usePage().props;
    const isSuperAdmin = auth?.is_super_admin;
    const activeBot = bots?.find((b) => b.id === active_bot_id) ?? bots?.[0];

    const switchBot = (botId: number) => {
        router.post('/switch-bot', { bot_id: botId });
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {!isSuperAdmin && bots?.length > 0 && (
                    <div className="px-2 pb-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                                    <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="flex-1 truncate text-left font-medium">
                                        {activeBot ? `@${activeBot.username}` : 'Select bot'}
                                    </span>
                                    {bots.length > 1 && <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                                </button>
                            </DropdownMenuTrigger>
                            {bots.length > 1 && (
                                <DropdownMenuContent align="start" className="w-52">
                                    {bots.map((b) => (
                                        <DropdownMenuItem
                                            key={b.id}
                                            onClick={() => switchBot(b.id)}
                                            className={b.id === active_bot_id ? 'font-semibold' : ''}
                                        >
                                            <Bot className="h-4 w-4 mr-2" />
                                            @{b.username}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent>
                {isSuperAdmin && (
                    <div className="mb-4">
                        <div className="px-4 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Super Admin
                        </div>
                        <NavMain items={adminNavItems} />
                    </div>
                )}

                {!isSuperAdmin && navGroups.map((group) => (
                    <NavMain key={group.label} label={group.label} items={group.items} />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
