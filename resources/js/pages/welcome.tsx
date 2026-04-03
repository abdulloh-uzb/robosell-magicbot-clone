import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="MagicBot — Telegram orqali do'kon oching">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white font-sans">

                {/* Navbar */}
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-lg font-semibold tracking-tight">MagicBot</span>
                        </div>
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        Kirish
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Boshlash
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.47l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.829.946l-.561-.857z"/>
                        </svg>
                        Telegram orqali savdo qiling
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
                        Telegram botingizni
                        <br />
                        <span className="text-blue-600">do'konga aylantiring</span>
                    </h1>

                    <div className="mx-auto mb-10 max-w-2xl">
                        <p className="text-center text-xl leading-relaxed text-gray-500 dark:text-gray-400">
                            MagicBot yordamida Telegram va Instagram orqali onlayn do'kon oching. Mahsulotlarni boshqaring, buyurtmalarni kuzating va mijozlar bilan muloqot qiling — hammasi bitta platformada.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {canRegister && (
                            <Link
                                href={register()}
                                className="px-8 py-3.5 rounded-xl bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                            >
                                Bepul boshlash →
                            </Link>
                        )}
                        <Link
                            href={login()}
                            className="px-8 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                        >
                            Hisobga kirish
                        </Link>
                    </div>
                </section>

                {/* Stats */}
                <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '500+', label: "Faol do'konlar" },
                            { value: '50K+', label: 'Buyurtmalar' },
                            { value: '2', label: "To'lov tizimi" },
                            { value: '99.9%', label: 'Uptime' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="max-w-6xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Savdoni osonlashtiruvchi imkoniyatlar</h2>
                        <div className="mx-auto max-w-xl">
                            <p className="text-center text-lg text-gray-500 dark:text-gray-400">
                                Biznes uchun zarur bo'lgan barcha vositalar bitta joyda.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                                    </svg>
                                ),
                                title: "Mahsulot boshqaruvi",
                                description: "Mahsulotlarni toifalar bo'yicha tartibga soling, rasmlar va narxlarni boshqaring, variantlarni (o'lcham, rang) qo'shing.",
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                    </svg>
                                ),
                                title: "Buyurtma kuzatuvi",
                                description: "Buyurtmalarni holat bo'yicha kuzating: kutilmoqda, tasdiqlangan, yetkazilmoqda, yetkazildi. Hamma narsa real vaqtda.",
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                    </svg>
                                ),
                                title: "Yagona inbox",
                                description: "Telegram va Instagram xabarlarini bitta joyda ko'ring va javob bering. Hech qanday xabarni o'tkazib yubormang.",
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                    </svg>
                                ),
                                title: "Click va Payme",
                                description: "O'zbekistoning eng mashhur to'lov tizimlari Click va Payme bilan integratsiya. Onlayn to'lovlarni qabul qiling.",
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                    </svg>
                                ),
                                title: "Tahlil va hisobot",
                                description: "Kunlik, haftalik va oylik savdo statistikasini kuzating. Eng ko'p sotiladigan mahsulotlarni aniqlang.",
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                    </svg>
                                ),
                                title: "Bir nechta botlar",
                                description: "Bitta akkauntdan bir nechta Telegram botlarini boshqaring. Har bir bot uchun alohida do'kon yarating.",
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-100 dark:hover:border-blue-900 hover:shadow-lg hover:shadow-blue-50 dark:hover:shadow-blue-950/20 transition-all"
                            >
                                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
                    <div className="max-w-6xl mx-auto px-6 py-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Qanday ishlaydi?</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Uch oddiy qadamda do'koningizni ishga tushiring.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    step: '01',
                                    title: 'Ro\'yxatdan o\'ting',
                                    description: 'Akkaunt yarating va Telegram botingizni ulang. Bu atigi bir necha daqiqa vaqt oladi.',
                                },
                                {
                                    step: '02',
                                    title: 'Mahsulotlarni qo\'shing',
                                    description: 'Mahsulotlaringizni rasmlar va narxlar bilan qo\'shing, toifalarga bo\'ling.',
                                },
                                {
                                    step: '03',
                                    title: 'Savdo boshlang',
                                    description: 'Mijozlaringiz Telegram orqali buyurtma bersin, to\'lovni qabul qiling.',
                                },
                            ].map((item, i) => (
                                <div key={item.step} className="relative flex flex-col items-center text-center">
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-6 left-[calc(50%+3rem)] right-0 h-px border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
                                    )}
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white text-lg font-bold flex items-center justify-center mb-5 shrink-0">
                                        {item.step}
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="max-w-6xl mx-auto px-6 py-24 text-center">
                    <div className="bg-blue-600 rounded-3xl px-8 py-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            Bugun savdoni boshlang
                        </h2>
                        <div className="mx-auto mb-8 max-w-md">
                            <p className="text-center text-lg text-blue-100">
                                Minglab sotuvchilar allaqachon MagicBot orqali savdo qilmoqda. Siz ham qo'shiling.
                            </p>
                        </div>
                        {canRegister && (
                            <Link
                                href={register()}
                                className="inline-block px-8 py-3.5 rounded-xl bg-white text-blue-600 text-base font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                            >
                                Bepul boshlash →
                            </Link>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-sm">© 2025 MagicBot. Barcha huquqlar himoyalangan.</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
                            <Link href={login()} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Kirish</Link>
                            {canRegister && (
                                <Link href={register()} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Ro'yxatdan o'tish</Link>
                            )}
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
