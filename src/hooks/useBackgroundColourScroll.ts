import { type RefObject, useLayoutEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useScroll, UseScrollOptions, useTransform, type MotionStyle } from 'motion/react';
import { parseColorClasses } from '@/components/ui/Section';

interface UseBackgroundColourScrollOptions {
  /** A ref to the HTML element that triggers the scroll animation. */
  target: RefObject<HTMLElement | null>;
  /** The Tailwind classes for the target element's background, e.g., 'bg-[#fff] dark:bg-[#000]'. */
  endBgClasses: string;
  animationRange?: UseScrollOptions['offset'];
}

/**
 * Creates a scroll-driven background color transition for a target element.
 *
 * The animation starts with the background color of the element's direct
 * preceding sibling and transitions to the color defined in `endBgClasses`.
 * It uses the modern CSS `color-mix()` in the OKLch space for a smooth,
 * perceptually uniform gradient.
 *
 * @returns A style object with an animated `backgroundColor` to be applied to the component.
 */
export const useBackgroundColourScroll = ({
  target,
  endBgClasses,
  animationRange = ['0.25 end', 'end end']
}: UseBackgroundColourScrollOptions): { style: MotionStyle } => {
  const { resolvedTheme } = useTheme();
  const [startColor, setStartColor] = useState<string | null>(null);

  const endColors = parseColorClasses(endBgClasses);
  const currentEndColor = resolvedTheme === 'dark' ? endColors.dark : endColors.light;

  // Before the browser paints, inspect the DOM to find the background color
  // of the preceding section. This will be the starting point for our animation.
  useLayoutEffect(() => {
    if (!target.current?.previousElementSibling) {
      // If there's no previous sibling, the animation starts and ends with the same color.
      setStartColor(currentEndColor);
      return;
    }

    // This assumes the sibling's color data is stored in its first child's dataset.
    // This is a contract between this hook and how the `Section` component is structured.
    const prevInnerElement = target.current.previousElementSibling.children[0] as HTMLElement;
    const prevColor =
      resolvedTheme === 'dark'
        ? prevInnerElement?.dataset?.bgDark
        : prevInnerElement?.dataset?.bgLight;

    setStartColor(prevColor || currentEndColor);
  }, [resolvedTheme, currentEndColor, target]);

  const { scrollYProgress } = useScroll({
    target,
    // The animation spans the entire time the element is sticky.
    offset: animationRange,
  });

  // Transform scroll progress (0 to 1) into a CSS `color-mix` string.
  // This delegates the color interpolation to the browser for high performance.
  const backgroundColor = useTransform(scrollYProgress, (value) => {
    if (!startColor || startColor === currentEndColor) {
      return currentEndColor;
    }
    // As `value` goes from 0 to 1, we mix an increasing percentage of the end color.
    return `color-mix(in oklch, ${startColor}, ${currentEndColor} ${value * 100}%)`;
  });

  return { style: { backgroundColor } };
};