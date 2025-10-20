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
            className="fixed bg-[black] text-[white] z-[1000] rounded shadow-[0_2px_10px_rgba(0;0;0;0.2)] flex items-center gap-2 px-4 py-2 right-4 bottom-4"
        >
            {pending ? (
                <span>Disabling...</span>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    className="text-[white] cursor-pointer border-[none]"
                    style={{ background: 'none' }}
                >
                    Disable Draft Mode
                </button>
            )}
        </div>
    );
}