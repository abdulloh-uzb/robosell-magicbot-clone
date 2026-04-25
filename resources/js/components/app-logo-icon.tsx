import type { SVGAttributes } from 'react';

/** HeyBazaar mark — monogram + accent dot (matches public/favicon.svg). */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                fill="currentColor"
                d="M8 9h3.2v14H8V9Zm12.8 0H24v14h-3.2V9ZM8 14.2h16v3.6H8v-3.6Z"
            />
            <circle cx="24" cy="8" r="4" fill="#E07A1F" />
        </svg>
    );
}
