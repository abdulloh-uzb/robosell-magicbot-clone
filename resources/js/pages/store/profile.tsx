import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Settings, HelpCircle, MapPin, Heart, ListOrdered, User } from 'lucide-react';

export default function ProfileView({ bot, customer }: { bot: any, customer: any }) {

    const menuItems = [
        { icon: ListOrdered, label: 'My Orders', href: `/store/${bot.username}/orders`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { icon: Heart, label: 'Wishlist', href: '#', color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { icon: MapPin, label: 'Saved Addresses', href: '#', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    const supportItems = [
        { icon: HelpCircle, label: 'Help & Support', href: '#', color: 'text-primary', bg: 'bg-primary/10' },
        { icon: Settings, label: 'Account Settings', href: '#', color: 'text-muted-foreground', bg: 'bg-muted' },
    ];

    return (
        <StoreLayout bot={bot}>
            <Head title={`Profile - ${bot.name}`} />
            
            <div className="flex items-center justify-center mb-6 bg-background/95 backdrop-blur-md sticky top-14 py-3 z-30 -mx-4 px-4 border-b/50 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)]">
                <h2 className="text-xl font-extrabold tracking-tight">My Profile</h2>
            </div>

            <div className="space-y-6">
                {/* User Info Header */}
                <div className="flex items-center gap-4 bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/20">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold leading-tight">{customer?.first_name || 'Customer'} {customer?.last_name || ''}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {customer?.username ? `@${customer.username}` : 'Telegram User'}
                        </p>
                    </div>
                </div>

                {/* Quick Links / Account Menu */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg px-1">My Account</h3>
                    <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card">
                        <div className="divide-y divide-border/50">
                            {menuItems.map((item, index) => (
                                <Link 
                                    key={index} 
                                    href={item.href}
                                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${item.bg}`}>
                                            <item.icon className={`h-5 w-5 ${item.color}`} />
                                        </div>
                                        <span className="font-semibold text-foreground/90">{item.label}</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Support Menu */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg px-1">Support & Settings</h3>
                    <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card">
                        <div className="divide-y divide-border/50">
                            {supportItems.map((item, index) => (
                                <Link 
                                    key={index} 
                                    href={item.href}
                                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${item.bg}`}>
                                            <item.icon className={`h-5 w-5 ${item.color}`} />
                                        </div>
                                        <span className="font-semibold text-foreground/90">{item.label}</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>
        </StoreLayout>
    );
}
