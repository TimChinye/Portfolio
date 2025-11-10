"use client"

import { CSSProperties, useRef, useState, useLayoutEffect, forwardRef, useEffect } from 'react';
import { motion, useTransform } from 'framer-motion';

import { useSectionScrollProgress } from '@/components/ui/Section';
// Assuming CustomLink uses forwardRef. This is standard for good component libraries.
import { CustomLink } from '@/components/ui/CustomLink';
import type { AboutPageData } from '@/sanity/lib/queries';

import MuxPlayer, { MuxPlayerRefAttributes } from '@mux/mux-player-react';

// A helper to ensure we can pass a ref to a potentially non-forwardRef component.
// This makes our Client component more robust.
const Link = forwardRef<HTMLAnchorElement, React.ComponentProps<typeof CustomLink>>(
	(props, ref) => <CustomLink {...props} ref={ref} />
);
Link.displayName = 'ForwardedCustomLink';

type ClientProps = {
	data: AboutPageData;
};

// Define constants for styling to keep logic clean.

export function Client({ data }: ClientProps) {
	const stickyProgress = useSectionScrollProgress();

	// Refs for all elements we need to measure.
	const containerRef = useRef<HTMLDivElement>(null);
	const topParaRef = useRef<HTMLParagraphElement>(null);
	const bottomParaRef = useRef<HTMLParagraphElement>(null);
	const buttonRef = useRef<HTMLAnchorElement>(null);
	
    const muxPlayerRef = useRef<MuxPlayerRefAttributes>(null);
	
		// State to hold the final, calculated animation ranges in pixels.
		// Initialized to [0, 0] before measurement.
	const [heightRange, setHeightRange] = useState([0, 0]);
	const [radiusRange, setRadiusRange] = useState([0, 0]);

	// State to manage visibility, preventing flicker before measurements are ready.
	const [isReady, setIsReady] = useState(false);

	useLayoutEffect(() => {
		const calculateRanges = () => {
			if (!(containerRef.current && topParaRef.current && bottomParaRef.current && buttonRef.current && buttonRef.current.parentElement)) return;

			const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

			// --- 1. Calculate START Height (Simulating "fit-content") ---
			const buttonHeight = buttonRef.current.parentElement.offsetHeight;
			const buttonMargin = 2 * rootFontSize;
			const startHeightPx = buttonHeight + buttonMargin;

			// --- 2. Calculate END Height (Filling available space) ---
			const containerHeight = containerRef.current.offsetHeight;
			const topParaHeight = topParaRef.current.offsetHeight;
			const bottomParaHeight = bottomParaRef.current.offsetHeight;
			const gap = 2 * rootFontSize; // from `gap-8`
			const endHeightPx = containerHeight - topParaHeight - bottomParaHeight - (gap * 2);

			// Only update state if the calculated values are valid.
			if (startHeightPx > 0 && endHeightPx > 0) {
				setHeightRange([startHeightPx, endHeightPx]);

				// --- 3. Calculate Border Radius Range ---
				const startRadiusPx = startHeightPx / 2;
				const endRadiusPx = rootFontSize / 2;
				setRadiusRange([startRadiusPx, endRadiusPx]);

				// Now that we have all measurements, mark the component as ready to be displayed.
				setIsReady(true);
			}
		};

		calculateRanges();

		const observer = new ResizeObserver(calculateRanges);
		if (containerRef.current) observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, []); // Empty dependency array is correct here.

    useEffect(() => {
        const player = muxPlayerRef.current;
        // The underlying <video> element
        const videoEl = player?.media;

        if (!videoEl) return;

        // This function is our guardian. It checks and corrects the muted state.
        const enforceMuted = () => {
            if (!videoEl.muted) {
                videoEl.muted = true;
            }
        };

        // This handles cases where the browser might try to unmute on play.
        const handlePlay = () => {
            enforceMuted();
        };

        // This is a direct listener for any volume change, the most robust check.
        const handleVolumeChange = () => {
            enforceMuted();
        };

        // This handles the primary problem: tab visibility changes.
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // When the tab becomes visible again, ensure it's muted and try to play.
                enforceMuted();
                videoEl.play().catch(() => {
                    // Autoplay might be blocked, but at least we tried.
                });
            }
        };
        
        // Attach the event listeners
        videoEl.addEventListener('play', handlePlay);
        videoEl.addEventListener('volumechange', handleVolumeChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Initial check on mount
        enforceMuted();

        // IMPORTANT: Cleanup listeners on unmount to prevent memory leaks
        return () => {
            videoEl.removeEventListener('play', handlePlay);
            videoEl.removeEventListener('volumechange', handleVolumeChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [data.playbackId]);

	// Hooks are now called unconditionally on every render.
	const animatedHeight = useTransform(stickyProgress, [0, 0.75], heightRange);
	const animatedBorderRadius = useTransform(stickyProgress, [0, 0.75], radiusRange);

	return (
		<div className="px-[0.5em] py-[0.25em] md:px-[0.75em] md:py-[0.375em] leading-none text-[clamp(4rem,15vw,12rem)] flex h-screen w-full flex-col items-center justify-center overflow-hidden">
			<div ref={containerRef} className="flex h-full w-full flex-col items-center justify-center gap-8 px-4 text-[0.25em] text-center">
				<p ref={topParaRef}>
					{data.topParagraph}
				</p>

				<motion.div
					style={{
						height: animatedHeight,
						borderRadius: animatedBorderRadius,
						opacity: isReady ? 1 : 0,
						transition: 'opacity 0.5s',
					}}
					className="relative w-full overflow-hidden dark:hue-rotate-[21.36deg]"
				>
					<MuxPlayer
                        ref={muxPlayerRef}
						playbackId={data.playbackId}
						streamType="on-demand"
						autoPlay
						loop
						muted
						className="h-full grayscale dark:sepia"
						style={{
							'--controls': 'none',
							'--media-object-fit': 'cover'
						} as CSSProperties}
					/>

					<div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full text-[calc(1em/3)] border-[0.2em] border-white flex p-[round(down,0.2em,1px)]">
						<Link
							ref={buttonRef}
							href="/about"
							className="rounded-[inherit] whitespace-nowrap px-6 py-2 text-white backdrop-blur-sm transition-colors bg-black/20 hover:bg-white/20"
						>
							{data.journeyButtonText}
						</Link>
					</div>
				</motion.div>

				<p ref={bottomParaRef}>
					{data.bottomParagraph}
				</p>
			</div>
		</div>
	);
}