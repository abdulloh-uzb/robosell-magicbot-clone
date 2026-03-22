import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, Instagram, LayoutGrid, MessageCircle, Package, Radio, ShieldAlert, ShoppingCart, Tags, Users } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import { LanguageSwitcher } from './language-switcher';
import { dashboard } from '@/routes';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Orders',
        href: '/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: Users,
    },
    {
        title: 'Products',
        href: '/products',
        icon: Package,
    },
    {
        title: 'Categories',
        href: '/categories',
        icon: Tags,
    },
    {
        title: 'Inbox',
        href: '/chat',
        icon: MessageCircle,
    },
    {
        title: 'Channel',
        href: '/channel',
        icon: Radio,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
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
    const { auth } = usePage<any>().props;
    const isSuperAdmin = auth?.is_super_admin;
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
                
                {!isSuperAdmin && (
                    <>
                        <div className="px-4 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Seller Dashboard
                        </div>
                        <NavMain items={mainNavItems} />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <div className="px-2 py-1">
                    <LanguageSwitcher />
                </div>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
