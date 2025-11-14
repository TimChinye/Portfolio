import { useState, useLayoutEffect, RefObject } from 'react';

type AnimationRefs = {
	containerRef: RefObject<HTMLDivElement | null>;
	topParaRef: RefObject<HTMLParagraphElement | null>;
	bottomParaRef: RefObject<HTMLParagraphElement | null>;
	buttonRef: RefObject<HTMLAnchorElement | null>;
};

export function useVideoAnimation({ containerRef, topParaRef, bottomParaRef, buttonRef }: AnimationRefs) {
	const [heightRange, setHeightRange] = useState([0, 0]);
	const [radiusRange, setRadiusRange] = useState([0, 0]);
	const [isReady, setIsReady] = useState(false);

	useLayoutEffect(() => {
		const calculateRanges = () => {
			if (!(containerRef.current && topParaRef.current && bottomParaRef.current && buttonRef.current && buttonRef.current.parentElement)) return;

			const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

			// 1. Calculate START Height
			const buttonHeight = buttonRef.current.parentElement.offsetHeight;
			const buttonMargin = 2 * rootFontSize;
			const startHeightPx = buttonHeight + buttonMargin;

			// 2. Calculate END Height
			const containerHeight = containerRef.current.offsetHeight;
			const topParaHeight = topParaRef.current.offsetHeight;
			const bottomParaHeight = bottomParaRef.current.offsetHeight;
			const gap = 2 * rootFontSize; // from `gap-8`
			const endHeightPx = containerHeight - topParaHeight - bottomParaHeight - (gap * 2);

			if (startHeightPx > 0 && endHeightPx > 0) {
				setHeightRange([startHeightPx, endHeightPx]);

				// 3. Calculate Border Radius Range
				const startRadiusPx = startHeightPx / 2;
				const endRadiusPx = rootFontSize / 2;
				setRadiusRange([startRadiusPx, endRadiusPx]);

				setIsReady(true);
			}
		};

		calculateRanges();

		const observer = new ResizeObserver(calculateRanges);
		if (containerRef.current) observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, [containerRef, topParaRef, bottomParaRef, buttonRef]); // Added refs to dependency array for correctness

	return { heightRange, radiusRange, isReady };
}