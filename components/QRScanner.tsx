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
                // const cameraConfig = { facingMode: "environment" }; // This line is removed

                // List cameras first to debug
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    // Try to find back camera
                    const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
                    const cameraId = backCamera ? backCamera.id : devices[0].id;

                    await html5QrCode.start(
                        cameraId,
                        config,
                        (decodedText) => {
                            if (isScanningRef.current) return;
                            onScan(decodedText);
                        },
                        (errorMessage) => { }
                    );
                    isScanningRef.current = true;
                } else {
                    throw new Error("No camera devices found. Please explicitly allow camera permission.");
                }

            } catch (err) {
                console.error("Failed to start scanner", err);
                const errorMsg = (err as any)?.message || (err as any)?.toString() || "Unknown camera error";
                if (onError) {
                    if (errorMsg.includes("Permission denied")) {
                        onError("Permission denied (System Block). Go to Settings -> Site Settings -> Camera -> Allow.");
                    } else if (errorMsg.includes("No camera devices found")) {
                        onError("No cameras detected. Browser is likely blocking access completely.");
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
