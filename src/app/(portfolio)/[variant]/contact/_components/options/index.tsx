"use client";

import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import clsx from 'clsx';
import type { ContactMethod } from '@/sanity/lib/queries';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Section } from '@/components/ui/Section';

// --- Types ---
type ThemeImage = {
    light?: string;
    dark?: string;
};

type ContactOptionsProps = {
    data: {
        directTitle: string;
        contactMethods: ContactMethod[];
        emailTitle: string;
        emailAddress: string;
        emailQrCode?: ThemeImage;
    };
};

// --- Sub-Component: QR Tooltip (Custom SVG Version) ---
// Added 'scale' prop to easily resize the entire bubble while keeping the QR aligned
const QrTooltip = ({ codes, scale = 2 }: { codes: ThemeImage; scale?: number }) => {
    // Helper to determine if we have any code to show
    const hasCode = codes.light || codes.dark;
    if (!hasCode) return null;

    // Base dimensions (in rem) derived from the original Tailwind classes
    const width = `${7 * scale}rem`;
    const height = `${8.8125 * scale}rem`;
    const qrSize = `${4.5 * scale}rem`;
    const qrTop = `${3.125 * scale}rem`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 5, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 5, x: "-50%" }}
            transition={{ duration: 0.25, ease: [0, 0.5, 0.5, 1] }}
            className="absolute bottom-[calc(100%+1rem)] left-1/2 z-50 origin-bottom pointer-events-none"
        >
            <div
                className="relative drop-shadow-2xl"
                style={{ width, height }}
            >

                {/* The User Provided SVG */}
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 112 141"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 size-full"
                >
                    {/* Background Fill */}
                    <path
                        d="M95.605 0.005C104.251 0.224 111.193 7.301 111.193 16V82.222L111.187 82.635C110.981 90.741 104.673 96.798 96.799 98.142C90.015 99.299 79.212 110.021 78.235 111.863L66.914 133.206C62.099 142.283 49.094 142.283 44.279 133.206L32.958 111.863C30.464 107.16 19.478 98.538 14.75 98.173C6.498 97.535 0 90.638 0 82.222V16C0 7.163 7.164 0 16 0H95.193L95.605 0.005Z"
                        className="fill-[#F5F5EF] dark:fill-[#1A1A17] transition-colors duration-300"
                    />
                    {/* Border Stroke */}
                    <path
                        d="M16 2H95.1689L95.5791 2.00391C103.132 2.20835 109.193 8.39702 109.193 16V82.2217L109.188 82.584C109.01 89.5632 103.575 94.9569 96.4629 96.1709C94.4032 96.5222 92.203 97.557 90.1396 98.8027C88.0455 100.067 85.9448 101.639 84.0596 103.208C82.1709 104.78 80.4675 106.376 79.165 107.705C78.5144 108.369 77.9525 108.978 77.5127 109.494C77.1098 109.967 76.7029 110.483 76.4678 110.926L65.1475 132.269C61.0841 139.929 50.1092 139.929 46.0459 132.269L34.7246 110.926C33.9657 109.495 32.6527 107.911 31.1504 106.387C29.6221 104.836 27.795 103.245 25.9062 101.802C24.0198 100.36 22.0353 99.039 20.1865 98.0439C18.398 97.0814 16.5199 96.3035 14.9043 96.1787C7.68558 95.6206 2 89.5845 2 82.2217V16C2 8.26765 8.26849 2 16 2Z"
                        className="stroke-[#2F2F2B40] dark:stroke-[#F5F5EF40] stroke-opacity-25 dark:stroke-opacity-25 transition-colors duration-300"
                        strokeWidth="2"
                    />
                </svg>

                {/* QR Placement */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md"
                    style={{
                        top: qrTop,
                        width: qrSize,
                        height: qrSize
                    }}
                >

                    {/* Light Mode QR */}
                    {codes.light && (
                        <div className="absolute inset-0 dark:hidden">
                            <Image src={codes.light} alt="QR Code" fill className="object-cover" />
                        </div>
                    )}

                    {/* Dark Mode QR */}
                    {codes.dark && (
                        <div className="absolute inset-0 hidden dark:block">
                            <Image src={codes.dark} alt="QR Code" fill className="object-cover" />
                        </div>
                    )}

                    {/* Fallback */}
                    {!codes.dark && codes.light && (
                        <div className="absolute inset-0 hidden dark:block mix-blend-difference">
                            <Image src={codes.light} alt="QR Code" fill className="object-cover invert" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// --- Sub-Component: Contact Pill (Single or Split) ---
const ContactPill = ({ method }: { method: ContactMethod }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [hoveredSide, setHoveredSide] = useState<'single' | 'left' | 'right' | null>(null);

    const basePillStyles = clsx(
        "relative flex items-center justify-center border border-[#2F2F2B40] dark:border-[#F5F5EF40] border-[.25rem]",
        "bg-transparent text-[1.25rem] font-figtree font-bold uppercase text-[#2F2F2B] dark:text-[#F5F5EF] leading-none",
        "transition-colors duration-300"
    );

    // --- SPLIT LINK RENDER ---
    if (method._type === 'splitLink') {
        return (
            <div className={clsx(basePillStyles, "rounded-full")}>

                {/* Left Link */}
                <div className="relative h-full">
                    <a
                        href={method.leftUrl}
                        className="relative block px-6 py-3 h-full transition-colors rounded-l-full"
                        onMouseEnter={() => setHoveredSide('left')}
                        onMouseLeave={() => setHoveredSide(null)}
                    >
                        {method.leftLabel}
                    </a>
                    <AnimatePresence>
                        {!isMobile && hoveredSide === 'left' && method.leftQrCode && (
                            <QrTooltip codes={method.leftQrCode} />
                        )}
                    </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="w-[0.2rem] h-[1.25em] bg-[#2F2F2B40] dark:bg-[#F5F5EF40]" />

                {/* Right Link */}
                <div className="relative h-full">
                    <a
                        href={method.rightUrl}
                        className="relative block px-6 py-3 h-full transition-colors rounded-r-full"
                        onMouseEnter={() => setHoveredSide('right')}
                        onMouseLeave={() => setHoveredSide(null)}
                    >
                        {method.rightLabel}
                    </a>
                    <AnimatePresence>
                        {!isMobile && hoveredSide === 'right' && method.rightQrCode && (
                            <QrTooltip codes={method.rightQrCode} />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // --- SINGLE LINK RENDER ---
    return (
        <div className="relative">
            <a
                href={method.url}
                className={clsx(basePillStyles, "block rounded-full px-6 py-3")}
                onMouseEnter={() => setHoveredSide('single')}
                onMouseLeave={() => setHoveredSide(null)}
            >
                {method.label}
            </a>
            <AnimatePresence>
                {!isMobile && hoveredSide === 'single' && method.qrCode && (
                    <QrTooltip codes={method.qrCode} />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Main Component ---
export function ContactOptions({ data }: ContactOptionsProps) {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isEmailHovered, setIsEmailHovered] = useState(false);

    return (
        <Section
            bgClasses="bg-transparent"
            className="overflow-visible px-8 rounded-none flex flex-col text-center items-center justify-center gap-32"
            wrapperClassName="m-0 mt-64 z-10 relative"
            fillScreen={false}
        >
            {/* Group 1: Direct Contact */}
            <div className="flex flex-col items-center gap-4">
                {data.contactMethods?.length > 0 && (
                    <>
                        <h2 className="font-figtree text-[#2F2F2B] dark:text-[#F5F5EF] text-[clamp(2.5rem,5vw,4rem)] leading-tight">
                            {data.directTitle}
                        </h2>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                            {data.contactMethods?.map((method) => (
                                <ContactPill key={method._key} method={method} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Group 2: Email */}
            <div className="flex flex-col items-center gap-8">
                <h2 className="font-newsreader tracking-tighter text-[#2F2F2B] dark:text-[#F5F5EF] text-[clamp(5rem,10vw,12.5rem)] leading-none">
                    {data.emailTitle}
                </h2>

                <div
                    className="relative group"
                    onMouseEnter={() => setIsEmailHovered(true)}
                    onMouseLeave={() => setIsEmailHovered(false)}
                >
                    <AnimatePresence>
                        {!isMobile && isEmailHovered && data.emailQrCode && (
                            <QrTooltip codes={data.emailQrCode} />
                        )}
                    </AnimatePresence>
                    <a
                        href={`mailto:${data.emailAddress}`}
                        className="inline-block rounded-full border-4 border-[#2F2F2B40] dark:border-[#F5F5EF40] px-8 py-4 text-[clamp(1.25rem,3vw,2.3125rem)] font-figtree font-bold uppercase text-[#2F2F2B] dark:text-[#F5F5EF] transition-colors duration-300"
                    >
                        {data.emailAddress}
                    </a>
                </div>
            </div>
        </Section>
    );
}