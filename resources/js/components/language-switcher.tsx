import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const locales = [
    { code: 'en', label: 'English' },
    { code: 'uz', label: "O'zbek" },
    { code: 'ru', label: 'Русский' },
];

export function LanguageSwitcher() {
    const { locale } = usePage<{ locale: string }>().props;

    const switchLocale = (code: string) => {
        router.post('/locale', { locale: code }, { preserveState: true, preserveScroll: true });
    };

    const current = locales.find((l) => l.code === locale);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="uppercase text-xs font-semibold">{current?.code ?? 'en'}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((l) => (
                    <DropdownMenuItem
                        key={l.code}
                        onClick={() => switchLocale(l.code)}
                        className={locale === l.code ? 'font-semibold' : ''}
                    >
                        {l.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
