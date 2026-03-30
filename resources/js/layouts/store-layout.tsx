import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import StoreBottomNav from '@/components/store-bottom-nav';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const { url, props } = usePage<{ bot: any }>();
    const bot = props.bot;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-web-app.js';
        script.async = true;
        document.head.appendChild(script);

        let removeListener: (() => void) | null = null;

        script.onload = () => {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();

                const initData = window.Telegram.WebApp.initData;

                import('axios').then((axiosLib) => {
                    axiosLib.default.defaults.headers.common['X-Telegram-Init-Data'] = initData;
                });

                removeListener = router.on('before', (event) => {
                    event.detail.visit.headers['X-Telegram-Init-Data'] = initData;
                });
            }
        };

        return () => {
            if (removeListener) {
                removeListener();
            }
        };
    }, []);

    return (
        <div className="store-layout min-h-screen bg-white text-gray-900 pb-24 font-sans flex flex-col">
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="w-16" />
                    <h1 className="text-xl font-bold tracking-tight">{bot?.name || 'Store'}</h1>
                    <div className="flex justify-end w-16">
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 pb-12">
                {children}
            </main>

            {bot && (
                <StoreBottomNav botUsername={bot.username} botId={bot.id} currentUrl={url} />
            )}
        </div>
    );
}
