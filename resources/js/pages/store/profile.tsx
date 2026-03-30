import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Button } from '@/components/ui/button';
import { ChevronRight, Settings, HelpCircle, MapPin, Heart, ListOrdered, User } from 'lucide-react';

export default function ProfileView({ bot, customer }: { bot: any, customer: any }) {

    const menuItems = [
        { icon: ListOrdered, label: 'My Orders', href: `/store/${bot.username}/orders`, color: 'text-blue-500', bg: 'bg-blue-50' },
        { icon: Heart, label: 'Wishlist', href: '#', color: 'text-rose-500', bg: 'bg-rose-50' },
        { icon: MapPin, label: 'Saved Addresses', href: '#', color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    const supportItems = [
        { icon: HelpCircle, label: 'Help & Support', href: '#', color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: Settings, label: 'Account Settings', href: '#', color: 'text-gray-500', bg: 'bg-gray-100' },
    ];

    return (
        <>
            <Head title={`Profile - ${bot.name}`} />

            <div className="flex items-center justify-center mb-6 bg-white/95 backdrop-blur-md sticky top-14 py-3 z-30 -mx-4 px-4 border-b border-gray-100 shadow-sm">
                <h2 className="text-xl font-extrabold tracking-tight text-gray-900">My Profile</h2>
            </div>

            <div className="space-y-6">
                {/* User Info Header */}
                <div className="flex items-center gap-4 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border border-blue-100">
                        <User className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold leading-tight text-gray-900">{customer?.first_name || 'Customer'} {customer?.last_name || ''}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {customer?.username ? `@${customer.username}` : 'Telegram User'}
                        </p>
                    </div>
                </div>

                {/* Quick Links / Account Menu */}
                <div className="space-y-3">
                    <h3 className="font-bold text-base px-1 text-gray-800">My Account</h3>
                    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white divide-y divide-gray-100">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${item.bg}`}>
                                        <item.icon className={`h-5 w-5 ${item.color}`} />
                                    </div>
                                    <span className="font-semibold text-gray-800">{item.label}</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Support Menu */}
                <div className="space-y-3">
                    <h3 className="font-bold text-base px-1 text-gray-800">Support & Settings</h3>
                    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white divide-y divide-gray-100">
                        {supportItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${item.bg}`}>
                                        <item.icon className={`h-5 w-5 ${item.color}`} />
                                    </div>
                                    <span className="font-semibold text-gray-800">{item.label}</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

ProfileView.layout = (page: ReactNode) => <StoreLayout>{page}</StoreLayout>;
