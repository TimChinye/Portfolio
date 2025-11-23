"use client";

import Image from 'next/image';
import { motion, useTransform, type MotionValue, type MotionStyle } from 'motion/react';
import type { CSSProperties } from 'react';
import clsx from 'clsx';

import selfieImage from '@/../public/images/selfie.png';
import professionalImage from '@/../public/images/professional.png';

const GrSvg = () => (
  <svg viewBox="0 0 253 343" preserveAspectRatio="none" fill="currentColor" className="h-full shrink-0">
    <path d="M48.2591 342.324C36.986 342.324 27.8028 339.133 20.7096 332.752C13.6164 326.37 8.35984 317.71 4.93991 306.77C1.64664 295.83 0 283.523 0 269.848V72.4761C0 58.9533 2.21663 46.722 6.64988 35.7822C11.0831 24.8425 17.4163 16.1818 25.6495 9.80025C33.8827 3.26677 43.5725 0 54.719 0C63.2055 0 70.8053 1.89929 77.5185 5.69783C84.3584 9.34443 90.1216 14.5104 94.8082 21.1959C99.6214 27.8813 103.231 35.6303 105.638 44.4429C108.171 53.1036 109.438 62.448 109.438 72.4761V123.984H68.3987V72.4761C68.3987 65.7907 67.3854 60.0169 65.3588 55.1548C63.3321 50.2927 59.7855 47.8616 54.719 47.8616C49.7791 47.8616 46.2325 50.4446 44.0792 55.6106C42.0525 60.6247 41.0392 66.2465 41.0392 72.4761V273.95C41.0392 280.484 42.1159 286.258 44.2692 291.272C46.4225 296.134 49.9057 298.565 54.719 298.565C59.7855 298.565 63.3321 296.134 65.3588 291.272C67.3854 286.258 68.3987 280.484 68.3987 273.95V217.884H52.059V171.846H109.438V338.677H85.1184L80.1785 320.444C76.6319 327.282 72.072 332.676 66.4987 336.626C61.0522 340.425 54.9723 342.324 48.2591 342.324Z" />
    <path d="M139.944 338.677V3.64661H180.983C205.556 3.64661 223.669 11.8515 235.322 28.2611C246.976 44.5189 252.802 68.5256 252.802 100.281C252.802 119.122 250.015 135.456 244.442 149.283C238.996 162.957 232.346 172.985 224.493 179.367L252.422 338.677H211.383L188.203 197.372H180.983V338.677H139.944ZM180.983 151.79C188.583 151.79 194.6 149.814 199.033 145.864C203.466 141.761 206.633 135.988 208.533 128.542C210.433 121.097 211.383 112.285 211.383 102.105C211.383 86.1508 209.166 73.9195 204.733 65.4108C200.426 56.7501 192.51 52.4199 180.983 52.4199V151.79Z" />
  </svg>
);
const WthSvg = () => (
  <svg viewBox="0 0 445 336" preserveAspectRatio="none" fill="currentColor" className="h-full shrink-0">
    <path d="M37.6193 335.031L0 0H37.9993L54.3391 174.125L55.099 185.065H58.1389L59.2789 174.125L76.7586 0H106.398L123.878 174.125L125.018 185.065H128.058L128.818 174.125L145.157 0H183.157L145.537 335.031H113.618L94.6183 176.404L92.3383 156.804H90.8184L88.5384 176.404L69.5388 335.031H37.6193Z" />
    <path d="M231.309 335.031V50.5965H192.55V0H311.107V50.5965H272.348V335.031H231.309Z" />
    <path d="M330.119 335.031V0H371.158V138.571H403.077V0H444.117V335.031H403.077V189.167H371.158V335.031H330.119Z" />
  </svg>
);

const OLeft = () => (
  <div className="h-full shrink-0 -mr-[0.05ch]" style={{ width: 'var(--o-cap-width)' }}>
    <svg viewBox="0 0 55 343" preserveAspectRatio="none" fill="currentColor" className="w-full h-full">
      <path d="M54.719,342.324C43.319,342.324 33.503,339.133 25.27,332.752C17.163,326.37 10.893,317.71 6.46,306.77C2.153,295.83 0,283.523 0,269.848L0,72.476C0,58.649 2.153,46.342 6.46,35.554C10.893,24.615 17.163,15.954 25.27,9.572C33.503,3.191 43.319,0 54.719,0L54.719,47.862C50.032,47.862 46.549,50.445 44.269,55.611C42.116,60.625 41.039,66.247 41.039,72.476L41.039,269.848C41.039,276.078 42.116,281.775 44.269,286.941C46.423,291.955 49.906,294.462 54.719,294.462L54.719,342.324Z" />
    </svg>
  </div>
);

const OCentre = ({ widthProgress }: { widthProgress : MotionValue<number> }) => (
  <motion.div className="h-full" style={{
        '--height': 'calc((100cqh - var(--gap)) / 2)',
        '--min-width': 'calc(var(--height) * (868.719 / 353.094))',
        '--max-width': 'calc(100cqw - var(--min-width) - var(--gap) - var(--height))',
        '--width-progress': widthProgress,
        width: 'calc(var(--max-width) * var(--width-progress))',
    } as CSSProperties | MotionStyle}>
    <svg viewBox="54 0 506 343" preserveAspectRatio="none" fill="currentColor" className="w-full h-full">
      <path d="M559.395,294.462L54.729,294.462L54.729,342.324L559.395,342.324L559.395,294.462ZM559.406,0L54.616,0L54.616,47.862L559.406,47.862L559.406,0Z" />
    </svg>
  </motion.div>
);

const ORight = () => (
  <div className="h-full shrink-0 -ml-[0.05ch]" style={{ width: 'var(--o-cap-width)' }}>
    <svg viewBox="559 0 56 343" preserveAspectRatio="none" fill="currentColor" className="w-full h-full">
      <path d="M559.406,47.862L559.401,0C570.79,0.004 580.536,3.195 588.637,9.572C596.87,15.954 603.14,24.615 607.446,35.554C611.88,46.494 614.096,58.801 614.096,72.476L614.096,269.848C614.096,283.523 611.88,295.83 607.446,306.77C603.14,317.71 596.87,326.37 588.637,332.752C580.544,339.123 570.809,342.313 559.434,342.324L559.429,294.46C564.468,294.445 567.998,291.938 570.017,286.941C572.044,281.775 573.057,276.078 573.057,269.848L573.057,72.476C573.057,66.247 571.98,60.625 569.827,55.611C567.678,50.455 564.204,47.872 559.406,47.862Z" />
    </svg>
  </div>
);

type GrowthTextProps = {
  scrollYProgress: MotionValue<number>;
  variant: 'tim' | 'tiger';
  className?: string;
};

export const GrowthText = ({ scrollYProgress, variant, className }: GrowthTextProps) => {
  const imageUrl = variant === 'tim'
    ? selfieImage
    : professionalImage;
    
  const widthProgress = useTransform(scrollYProgress, [0.5, 1], [0, 1], { clamp: true });

  return (
    <div
      className={clsx("flex w-full h-full items-center gap-(--gap)", className)}
      style={{ '--o-cap-width': '2.5vw' } as React.CSSProperties}
    >
      <div className="flex items-center h-full flex-0 gap-[3cqh]">
        <GrSvg />
        
        <div className="flex items-center h-full">
          <OLeft />
          <OCentre widthProgress={widthProgress} />
          <ORight />
        </div>

        <WthSvg />
      </div>
      
      <Image
        src={imageUrl}
        alt={variant === 'tim' ? 'Tim Chinye profile picture' : 'Tiger profile picture'}
        width={200}
        height={200}
        className="h-full w-auto aspect-square object-cover"
        sizes="15vw"
        placeholder="blur" 
      />
    </div>
  );
};