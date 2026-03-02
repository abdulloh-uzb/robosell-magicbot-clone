import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { translations } = usePage<{ translations: Record<string, string> }>().props;

    const t = (key: string, replacements?: Record<string, string>): string => {
        let value = translations?.[key] ?? key;

        if (replacements) {
            Object.entries(replacements).forEach(([k, v]) => {
                value = value.replace(`:${k}`, v);
            });
        }

        return value;
    };

    return { t };
}
