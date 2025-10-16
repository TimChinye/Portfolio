"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { disableDraftMode } from "@/app/(portfolio)/actions";

export function DisableDraftMode() {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        if (window.self === window.top) {
            setShowButton(true);
        }
    }, []);

    if (!showButton) return null;

    const handleClick = () => {
        startTransition(async () => {
            await disableDraftMode();
            router.refresh();
        });
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '1rem',
                right: '1rem',
                padding: '0.5rem 1rem',
                background: 'black',
                color: 'white',
                zIndex: 1000,
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
            }}
        >
            {pending ? (
                <span>Disabling...</span>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                    Disable Draft Mode
                </button>
            )}
        </div>
    );
}