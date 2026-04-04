import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

type PageProps = {
    auth: {
        user?: unknown;
    };
};

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<PageProps>().props;

    const faq = [
        {
            q: 'Нужны ли технические знания?',
            a: 'Нет. Если умеешь пользоваться Telegram — умеешь пользоваться ESAVDO.',
        },
        {
            q: 'Как работают защищённые платежи?',
            a: 'Покупатель оплачивает, деньги удерживаются до подтверждения доставки.',
        },
        {
            q: 'У меня уже есть Telegram-бот. Что делать?',
            a: 'Подключаете существующего бота по токену и продолжаете работу.',
        },
    ];

    return (
        <>
            <Head title="ESAVDO — Платформа для малого бизнеса" />
            <style>{`html { scroll-behavior: smooth; }`}</style>

            <div className="min-h-screen bg-[#F7F5F2] text-[#1A1714]">
                <header className="sticky top-0 z-50 border-b border-black/10 bg-[#F7F5F2]/90 backdrop-blur">
                    <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-10">
                        <a href="#" className="font-serif text-2xl font-black tracking-tight">
                            ESA<span className="text-[#1D6B4A]">VDO</span>
                        </a>
                        <nav className="hidden items-center gap-8 text-sm text-[#5C5650] md:flex">
                            <a href="#pain" className="hover:text-black">Проблемы</a>
                            <a href="#features" className="hover:text-black">Возможности</a>
                            <a href="#pricing" className="hover:text-black">Цены</a>
                            <a href="#faq" className="hover:text-black">FAQ</a>
                        </nav>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link href={dashboard()} className="rounded-lg bg-[#1A1714] px-4 py-2 text-sm font-medium text-white">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="px-2 py-2 text-sm text-[#5C5650] hover:text-black">
                                        Kirish
                                    </Link>
                                    {canRegister && (
                                        <Link href={register()} className="rounded-lg bg-[#1A1714] px-4 py-2 text-sm font-medium text-white">
                                            Boshlash
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:pt-24">
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#E8F3EE] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#1D6B4A]">
                            <span className="h-2 w-2 rounded-full bg-[#1D6B4A]" />
                            Платформа для малого бизнеса
                        </div>
                        <h1 className="font-serif text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                            Хватит вести бизнес
                            <br />в <span className="text-[#9E9890] line-through">хаосе</span>.
                            <br />Делай это <span className="italic text-[#1D6B4A]">умно.</span>
                        </h1>
                        <p className="mt-8 max-w-xl text-lg leading-8 text-[#5C5650]">
                            Твоя касса, Telegram-бот и Instagram-магазин работают отдельно — и ты теряешь деньги каждый день. ESAVDO объединяет всё в одно место.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            {canRegister && (
                                <Link href={register()} className="rounded-xl bg-[#1D6B4A] px-7 py-3.5 text-sm font-semibold text-white shadow">
                                    Начать бесплатно →
                                </Link>
                            )}
                            <a href="#pain" className="rounded-xl border border-black/15 px-6 py-3.5 text-sm text-[#5C5650]">
                                Узнать больше ↓
                            </a>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xl">
                        <div className="mb-4 grid grid-cols-3 gap-3">
                            {[{ n: '18', l: 'Заказов' }, { n: '3', l: 'Ожидают' }, { n: '2.1M', l: 'Сум сегодня' }].map((item) => (
                                <div key={item.l} className="rounded-xl border border-black/10 bg-[#F7F5F2] p-3">
                                    <div className="font-serif text-2xl font-bold">{item.n}</div>
                                    <div className="mt-1 text-[11px] uppercase tracking-wide text-[#9E9890]">{item.l}</div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {[
                                '🤖 ИИ ответил автоматически на вопрос клиента',
                                '✈ Telegram: Заказ #247 оплачен через Click',
                                '♥ Instagram: Есть это в красном цвете?',
                            ].map((msg) => (
                                <div key={msg} className="rounded-xl border border-black/10 bg-[#F7F5F2] px-3 py-2 text-sm text-[#5C5650]">
                                    {msg}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#1A1714] py-10 text-white">
                    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 text-center lg:grid-cols-4">
                        {[
                            ['500+', 'Продавцов в листе ожидания'],
                            ['3 мин', 'До первого заказа'],
                            ['14 дн', 'Бесплатный период'],
                            ['24/7', 'ИИ работает вместо вас'],
                        ].map(([value, label]) => (
                            <div key={label}>
                                <div className="font-serif text-4xl font-black">{value}</div>
                                <div className="mt-2 text-xs text-white/60">{label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="pain" className="scroll-mt-24 mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1D6B4A]">Твоя реальность сейчас</p>
                    <h2 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">Ты узнаёшь себя в этих историях?</h2>
                    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[
                            'Клиент перевёл деньги — и исчез',
                            'Сообщения везде — заказы теряются',
                            'Реклама в минус — аудитория не та',
                            'Отвечаешь на одно и то же весь день',
                        ].map((title, i) => (
                            <div key={title} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-widest text-[#E8520A]">Проблема {String(i + 1).padStart(2, '0')}</div>
                                <h3 className="mt-2 font-serif text-2xl font-bold">{title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#5C5650]">Esavdo решает это через автоматизацию, единый дашборд, ИИ-ответы и защищённые платежи.</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="features" className="scroll-mt-24 border-y border-black/10 bg-white py-20">
                    <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1D6B4A]">Что входит в платформу</p>
                        <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">14 инструментов. Одна подписка.</h2>
                        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                ['🎯', 'Подбор рекламных каналов'],
                                ['🔐', 'Защищённые платежи'],
                                ['🤖', 'Авто-ответы на DM'],
                                ['📊', 'Единый дашборд'],
                                ['💳', 'Все местные методы оплаты'],
                                ['🚚', 'Доставка и трекинг'],
                            ].map(([icon, title], idx) => (
                                <div key={title} className={idx === 0 ? 'rounded-2xl bg-[#1D6B4A] p-6 text-white' : 'rounded-2xl border border-black/10 bg-[#F7F5F2] p-6'}>
                                    <div className="text-3xl">{icon}</div>
                                    <h3 className="mt-3 font-serif text-2xl font-bold">{title}</h3>
                                    <p className={idx === 0 ? 'mt-2 text-sm text-white/80' : 'mt-2 text-sm text-[#5C5650]'}>
                                        Реальные инструменты для ежедневной работы малого бизнеса.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
                    <h2 className="font-serif text-4xl font-bold sm:text-5xl">От регистрации до первого заказа — 3 минуты</h2>
                    <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div className="space-y-5">
                            {['Регистрируешься', 'Подключаешь каналы', 'Добавляешь товары', 'Продаёшь — платформа делает остальное'].map((step, i) => (
                                <div key={step} className="flex gap-4 rounded-xl border border-black/10 bg-white p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D6B4A] font-serif text-lg font-bold text-white">{i + 1}</div>
                                    <div>
                                        <h3 className="font-serif text-xl font-bold">{step}</h3>
                                        <p className="mt-1 text-sm text-[#5C5650]">Простой и быстрый запуск без сложной настройки.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3 rounded-2xl border border-black/10 bg-white p-5">
                            <p className="text-sm font-medium text-[#5C5650]">Умный подбор рекламных каналов</p>
                            {[
                                ['@fashion_tashkent', '98%'],
                                ['@uz_shopping', '74%'],
                                ['@big_news_uz', '12%'],
                            ].map(([channel, score]) => (
                                <div key={channel} className="flex items-center justify-between rounded-xl border border-black/10 bg-[#F7F5F2] px-4 py-3">
                                    <div className="text-sm font-medium">{channel}</div>
                                    <div className="font-serif text-xl font-bold text-[#1D6B4A]">{score}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="pricing" className="scroll-mt-24 border-y border-black/10 bg-[#EFECEA] py-20">
                    <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
                        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#1D6B4A]">Тарифы</p>
                        <h2 className="mt-3 text-center font-serif text-4xl font-bold sm:text-5xl">Честные цены</h2>
                        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {[
                                { plan: 'Старт', price: '99 000', popular: false },
                                { plan: 'Про', price: '249 000', popular: true },
                                { plan: 'Бизнес', price: '499 000', popular: false },
                            ].map((item) => (
                                <div key={item.plan} className={item.popular ? 'rounded-2xl bg-[#1D6B4A] p-7 text-white shadow-lg' : 'rounded-2xl border border-black/10 bg-white p-7'}>
                                    <div className="text-xs uppercase tracking-[0.2em] opacity-70">{item.plan}</div>
                                    <div className="mt-4 font-serif text-5xl font-black leading-none">{item.price}</div>
                                    <div className="mt-1 text-sm opacity-70">сум / месяц</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="faq" className="scroll-mt-24 mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
                    <h2 className="font-serif text-4xl font-bold sm:text-5xl">Частые вопросы</h2>
                    <div className="mt-8 space-y-3">
                        {faq.map((item) => (
                            <div key={item.q} className="rounded-xl border border-black/10 bg-white p-5">
                                <h3 className="text-base font-semibold">{item.q}</h3>
                                <p className="mt-2 text-sm leading-7 text-[#5C5650]">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[#1A1714] py-24 text-center text-white">
                    <div className="mx-auto max-w-4xl px-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6EDFA8]">Начни сегодня</p>
                        <h2 className="mt-4 font-serif text-5xl font-black leading-tight sm:text-6xl">
                            Твой бизнес заслуживает <span className="italic text-[#6EDFA8]">нормального инструмента.</span>
                        </h2>
                        <p className="mt-5 text-white/60">Присоединяйся к 500+ продавцам в листе ожидания. 14 дней бесплатно.</p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {canRegister && (
                                <Link href={register()} className="rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[#1A1714]">
                                    Начать бесплатно →
                                </Link>
                            )}
                            <a href="https://t.me/abdulloh_usmonovvv" className="rounded-xl border border-white/20 px-6 py-3.5 text-sm text-white/80">
                                Написать в Telegram
                            </a>
                        </div>
                    </div>
                </section>

                <footer className="grid grid-cols-1 gap-4 border-t border-black/10 bg-white px-6 py-8 text-center lg:grid-cols-3 lg:items-center lg:px-10">
                    <div className="font-serif text-2xl font-black tracking-tight lg:text-left">
                        ESA<span className="text-[#1D6B4A]">VDO</span>
                    </div>
                    <p className="text-sm text-[#9E9890]">© 2026 Esavdo. Центральная Азия.</p>
                    <div className="flex justify-center gap-5 text-sm text-[#9E9890] lg:justify-end">
                        <a href="#">Условия</a>
                        <a href="#">Конфиденциальность</a>
                        <a href="https://t.me/esavdo_uz">Поддержка</a>
                    </div>
                </footer>
            </div>
        </>
    );
}
