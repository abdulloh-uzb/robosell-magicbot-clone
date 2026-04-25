import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            flash: {
                generated_password?: string;
            };
            bots?: Array<{ id: number; name: string; username: string }>;
            active_bot_id?: number | null;
            [key: string]: unknown;
        };
    }
}
