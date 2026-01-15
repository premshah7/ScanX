"use client";

import { Scanner } from '@yudiel/react-qr-scanner';
import { AlertCircle } from 'lucide-react';

interface ModernQRScannerProps {
    onScan: (data: string) => void;
    onError?: (error: string) => void;
}

export default function ModernQRScanner({ onScan, onError }: ModernQRScannerProps) {
    return (
        <div className="w-full max-w-md mx-auto aspect-square overflow-hidden rounded-xl border border-gray-700 bg-black relative shadow-2xl">
            <Scanner
                onScan={(detectedCodes) => {
                    if (detectedCodes && detectedCodes.length > 0) {
                        onScan(detectedCodes[0].rawValue);
                    }
                }}
                onError={(error) => {
                    console.error(error);
                    if (onError) onError(error.message || "Failed to access camera");
                }}
                components={{
                    audio: false,
                    finder: true,
                }}
                styles={{
                    container: {
                        width: '100%',
                        height: '100%',
                    },
                    video: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }
                }}
                scanDelay={500}
                allowMultiple={false}
            />

            {/* Overlay Hint */}
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <p className="inline-block bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/10">
                    Align QR code within frame
                </p>
            </div>
        </div>
    );
}
