import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ScanX Attendance',
        short_name: 'ScanX',
        description: 'Verified Device-Locked Academic Attendance System',
        start_url: '/',
        display: 'standalone',
        background_color: '#F8F9FA',
        theme_color: '#0E4E59',
        icons: [
            {
                src: '/logo.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
            },
            {
                src: '/logo.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
            },
        ],
    };
}
