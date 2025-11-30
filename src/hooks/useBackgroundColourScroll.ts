import { type RefObject, useLayoutEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useScroll, UseScrollOptions, useTransform, type MotionStyle } from 'motion/react';
import { parsebackgroundColourClasses } from '@/components/ui/Section';

interface UseBackgroundColourScrollOptions {
  target: RefObject<HTMLElement | null>;
  endBgClasses: string;
  animationRange?: UseScrollOptions['offset'];
}

export const useBackgroundColourScroll = ({
  target,
  endBgClasses,
  animationRange = ['0.25 end', 'end end']
}: UseBackgroundColourScrollOptions): { style: MotionStyle } => {
  const { resolvedTheme } = useTheme();
  const [startColor, setStartColor] = useState<string | null>(null);

  const endColors = parsebackgroundColourClasses(endBgClasses);
  const currentEndColor = resolvedTheme === 'dark' ? endColors.dark : endColors.light;

  useLayoutEffect(() => {
    if (!target.current?.previousElementSibling) {
      setStartColor(currentEndColor);
      return;
    }

    const prevInnerElement = target.current.previousElementSibling.children[0] as HTMLElement;
    const prevColor =
      resolvedTheme === 'dark'
        ? prevInnerElement?.dataset?.bgDark
        : prevInnerElement?.dataset?.bgLight;

    setStartColor(prevColor || currentEndColor);
  
  }, [resolvedTheme, currentEndColor, target]);

  const { scrollYProgress } = useScroll({
    target,
    offset: animationRange,
  });

  const backgroundColor = useTransform(scrollYProgress, (value) => {
    if (!startColor || startColor === currentEndColor) {
      return currentEndColor;
    }
    return `color-mix(in oklab, ${startColor}, ${currentEndColor} ${value * 100}%)`;
  });

  return { style: { backgroundColor } };
};