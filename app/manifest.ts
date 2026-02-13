import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ScanX',
        short_name: 'ScanX',
        description: 'Secure Device-Locked Attendance System',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/logo.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
            },
        ],
    };
}
