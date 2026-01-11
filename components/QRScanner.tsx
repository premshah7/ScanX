"use client";

import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
    onScan: (data: string) => void;
    onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScanningRef = useRef(false);

    useEffect(() => {
        // Unique ID for the scanner element
        const elementId = "qr-reader";

        const startScanner = async () => {
            try {
                // cleanup previous instance if any
                if (scannerRef.current) {
                    await scannerRef.current.stop().catch(() => { });
                    scannerRef.current.clear();
                }

                const html5QrCode = new Html5Qrcode(elementId);
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                };

                // Prefer back camera
                const cameraConfig = { facingMode: "environment" };

                await html5QrCode.start(
                    cameraConfig,
                    config,
                    (decodedText) => {
                        // Success callback
                        if (isScanningRef.current) return; // Prevent multiple triggers

                        // We don't automatically stop the scanner here, rely on parent to unmount or handle logic
                        // But we can debounce
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // Error callback - this triggers on every frame where QR is not found
                        // So we generally ignore it unless it's a critical failure which start() catches
                    }
                );

                isScanningRef.current = true;

            } catch (err) {
                console.error("Failed to start scanner", err);
                const errorMsg = (err as any)?.message || (err as any)?.toString() || "Unknown camera error";
                if (onError) {
                    // Translate common errors
                    if (errorMsg.includes("Permission denied")) {
                        onError("Permission denied. Reset browser permissions.");
                    } else if (errorMsg.includes("NotAllowedError")) {
                        onError("Camera access denied.");
                    } else {
                        onError(errorMsg);
                    }
                }
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            startScanner();
        }, 100);

        return () => {
            clearTimeout(timer);
            isScanningRef.current = false;
            if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error).finally(() => {
                    scannerRef.current?.clear();
                });
            }
        };
    }, []);

    return (
        <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl border dark:border-gray-700 bg-black relative">
            <div id="qr-reader" className="w-full h-full" />
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    Point camera at QR code
                </span>
            </div>
        </div>
    );
}
