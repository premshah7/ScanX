"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  /* Safe Cleanup Ref to track if actually running to avoid stale closure issues */
  const isRunningRef = useRef(false);

  const startScanner = async () => {
    // 1. Secure Context Check
    if (typeof window !== "undefined" && !window.isSecureContext) {
      if (onError) onError("Camera Access Blocked: App is running on an insecure connection (HTTP). Please using HTTPS or Localhost.");
      return;
    }

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => onScan(decodedText),
        () => { } // required but ignored
      );

      isRunningRef.current = true;
      setIsStarted(true);
    } catch (err: any) {
      console.error(err);

      // If start failed, ensure we don't think it's running
      isRunningRef.current = false;

      if (onError) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          onError("Camera Permission Denied. Please unblock camera access in your browser settings (look for the lock icon in the URL bar).");
        } else if (err.name === "NotFoundError") {
          onError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          onError("Camera is in use by another application.");
        } else {
          onError(`Camera Error: ${err.message || "Unknown error"}`);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        // Only stop if we flagged it as running
        if (isRunningRef.current) {
          scannerRef.current.stop().catch((err) => {
            console.warn("Failed to stop scanner during cleanup", err);
          }).finally(() => {
            scannerRef.current?.clear();
          });
        } else {
          scannerRef.current.clear();
        }
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        id="qr-reader"
        className="w-full aspect-square rounded-xl border bg-black"
      />

      {!isStarted && (
        <button
          onClick={startScanner}
          className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white"
        >
          Start QR Scan
        </button>
      )}

      <p className="mt-2 text-center text-sm text-gray-400">
        📱 iPhone users: Open in Safari (not installed app)
      </p>
    </div>
  );
}
