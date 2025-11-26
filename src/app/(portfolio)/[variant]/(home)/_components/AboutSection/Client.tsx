// app/about/Client.tsx
"use client"

import { CSSProperties, useRef } from 'react';
import { motion, useTransform } from 'motion/react';
import MuxPlayer, { MuxPlayerRefAttributes } from '@mux/mux-player-react';

// UI and Data
import { useSectionScrollProgress } from '@/components/ui/Section';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import type { AboutPageData } from '@/sanity/lib/queries';

// Modularized Components & Hooks
import { ForwardedLink as Link } from '@/components/ui/ForwardedLink';
import { useVideoAnimation } from '@/hooks/useVideoAnimation';
import { useEnforceMuted } from '@/hooks/useEnforceMuted';
import { usePersistentMuxPlayerControls } from '@/hooks/usePersistentMuxPlayerControls';

type ClientProps = {
	data: AboutPageData;
};

export function Client({ data }: ClientProps) {
	// 1. Setup refs
	const containerRef = useRef<HTMLDivElement | null>(null);
	const topParaRef = useRef<HTMLParagraphElement | null>(null);
	const bottomParaRef = useRef<HTMLParagraphElement | null>(null);
	const buttonRef = useRef<HTMLAnchorElement | null>(null);
	const muxPlayerRef = useRef<MuxPlayerRefAttributes | null>(null);

	// 2. Use custom hooks to manage logic and side-effects
	const stickyProgress = useSectionScrollProgress();
	
	const { heightRange, radiusRange, isReady } = useVideoAnimation({
		containerRef,
		topParaRef,
		bottomParaRef,
		buttonRef,
	});

	useEnforceMuted(muxPlayerRef, data.playbackId);
	usePersistentMuxPlayerControls(muxPlayerRef);

	// 3. Prepare animations
	const animatedHeight = useTransform(stickyProgress, [0, 0.75], heightRange);
	const animatedBorderRadius = useTransform(stickyProgress, [0, 0.75], radiusRange);

	// 4. Render the view
	return (
		<div className="px-[0.5em] py-[0.25em] md:px-[0.75em] md:py-[0.375em] leading-none flex h-screen w-full flex-col items-center justify-center overflow-hidden">
			<NoiseOverlay className="-z-1 [mask:linear-gradient(to_bottom,black_70%,transparent)]" opacityClass="opacity-50" baseFrequency={0.25} />
			
			<div ref={containerRef} className="flex size-full flex-col items-center justify-center gap-8 px-4 text-[0.25em] text-center">
				<p ref={topParaRef}>{data.topParagraph}</p>

				<motion.div
					style={{
						height: animatedHeight,
						borderRadius: animatedBorderRadius,
						opacity: isReady ? 1 : 0,
						transition: 'opacity 0.5s',
					}}
					className="relative w-full overflow-hidden"
				>
					<MuxPlayer
						ref={muxPlayerRef}
						playbackId={data.playbackId}
						streamType="on-demand"
						autoPlay
						loop
						muted
						className="h-full grayscale"
						style={{
							'--controls': 'none',
							'--media-object-fit': 'cover',
							'--media-background-color': '#2f2f2b'
						} as CSSProperties}
					/>
					<NoiseOverlay opacityClass="opacity-50" baseFrequency={0.25} />

					<div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full text-[calc(1em/3)] border-[0.2em] border-white flex p-[round(down,0.2em,1px)]">
						<Link
							ref={buttonRef}
							href="/about"
							className="rounded-[inherit] whitespace-nowrap px-6 py-2 text-white transition hover:bg-white/20"
						>
							{data.journeyButtonText}
						</Link>
					</div>
				</motion.div>

				<p ref={bottomParaRef}>{data.bottomParagraph}</p>
			</div>
		</div>
	);
}