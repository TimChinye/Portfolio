import React, { useId } from 'react';
import clsx from 'clsx';

type KeyCapProps = {
  textColor?: string;
  topColor?: string;
  sideGradientStart?: string;
  sideGradientEnd?: string;
  children: string;
  className?: string;
};

export const KeyCap = ({
  textColor = "#000000",
  topColor = "#EFEFD0",
  sideGradientStart = "#EFEFD0",
  sideGradientEnd = "#DEDA71",
  children,
  className,
}: KeyCapProps) => {
  const gradientId = useId();

  // Dynamic Sizing Logic
  const baseWidth = 204;
  const height = 194;

  const extraWidthPerChar = 80;
  
  const width = baseWidth + (Math.max(0, children.length - 1) * extraWidthPerChar);
  const stretch = width - baseWidth;

  const rotation = 12.5;
  const angleDeg = -1 + rotation;
  const angleRad = angleDeg * (Math.PI / 180);

  const stretchX = stretch * Math.cos(angleRad);
  const stretchY = stretch * Math.sin(angleRad);
  
  // Dynamic SVG Path Generation
  // The paths are based on the 200x194 Figma SVG. We add the `stretch` value
  // to the x-coordinates of the points on the right side of the keycap.

  const rightSidePath = `
    M${115 + stretchX} ${138.396 + stretchY}
    L${97 + stretchX} ${161.3 + stretchY}
    L${114 + stretchX} ${191.025 + stretchY}
    C${116.333 + stretchX} ${191.838 + stretchY} ${123.5 + stretchX} ${193.17 + stretchY} ${133.5 + stretchX} ${192 + stretchY}
    C${143.5 + stretchX} ${190.831 + stretchY} ${151 + stretchX} ${183.279 + stretchY} ${154 + stretchX} ${177.868 + stretchY}
    L${197.5 + stretchX} ${100 + stretchY}
    C${199.5 + stretchX} ${94.868 + stretchY} ${198 + stretchX} ${90 + stretchY} ${198 + stretchX} ${90 + stretchY}
    L${177.5 + stretchX} ${39.9849 + stretchY}
    L${175 + stretchX} ${36.061 + stretchY}
    C${176.2 + stretchX} ${37.6204 + stretchY} ${175.5 + stretchX} ${39.9595 + stretchY} ${175 + stretchX} ${40.9341 + stretchY}
    C${175 + stretchX} ${40.9341 + stretchY} ${126.664 + stretchX} ${140.159 + stretchY} ${115 + stretchX} ${142.396 + stretchY}Z
  `;

  const rightSideBaseShadowPath = `
    M${173.779 + stretchX} ${32.7915 + stretchY}
    L${177.5 + stretchX} ${36.5482 + stretchY}
    L${199.548 + stretchX} ${90.4166 + stretchY}
    C${200.221 + stretchX} ${96.0761 + stretchY} ${199.698 + stretchX} ${99.2651 + stretchY} ${197.479 + stretchX} ${103.363 + stretchY}
    L${197.468 + stretchX} ${103.384 + stretchY}
    L${153.488 + stretchX} ${180.899 + stretchY}
    C${153.486 + stretchX} ${180.901 + stretchY} ${153.484 + stretchX} ${180.904 + stretchY} ${153.482 + stretchX} ${180.907 + stretchY}
    C${144.834 + stretchX} ${193.763 + stretchY} ${127.21 + stretchX} ${196.194 + stretchY} ${113.057 + stretchX} ${191.928 + stretchY}
    L${113.053 + stretchX} ${191.927 + stretchY}
    L${96 + stretchX} ${162.325 + stretchY}
    C${93.5 + stretchX} ${160.325 + stretchY} ${110.788 + stretchX} ${143.45 + stretchY} ${116.11 + stretchX} ${133.939 + stretchY}
    L${116.473 + stretchX} ${139.1072 + stretchY}
    C${116.382 + stretchX} ${142.041 + stretchY} ${120.134 + stretchX} ${135.105 + stretchY} ${126.471 + stretchX} ${126.473 + stretchY}
    L${171.973 + stretchX} ${44.1072 + stretchY}
    C${173.803 + stretchX} ${40.4409 + stretchY} ${174.385 + stretchX} ${37.7453 + stretchY} ${173.937 + stretchX} ${33.8534 + stretchY}
    L${173.779 + stretchX} ${32.7915 + stretchY}Z
  `;
  
  const leftSideBaseShadowPath = `
    M5.22759 98.4824
    L0.0782773 147.028
    C0 156.302 4.74484 158.774 13.1125 162.02
    L${114.237 + stretchX} ${192.54 + stretchY}
    C${119.317 + stretchX} ${193.705 + stretchY} ${127.041 + stretchX} ${194.168 + stretchY} ${134.121 + stretchX} ${192.468 + stretchY}
    L${116.903 + stretchX} ${139.763 + stretchY}
    C${110.306 + stretchX} ${141.464 + stretchY} ${101.616 + stretchX} ${140.691 + stretchY} ${95.0187 + stretchX} ${138.99 + stretchY}
    L16 117.929
    L10.1871 113.098
    L7.5 106.721
    L5.22759 98.4824Z
  `;

  const topFacePath = `
    M${160.532 + stretchX} ${26.1152 + stretchY}
    C128.832 21.4785 109.844 16.069 90.0513 6.79551
    C75.5688 0.14952 59.7991 2.777 53.3624 14.2143
    C39.0409 39.7163 22.9493 67.6912 8.46684 93.1933
    C2.0302 104.476 10.7197 115.759 24.8803 123.023
    C${49.9832 + stretchX} ${136.006 + stretchY} ${62.6955 + stretchX} ${138.015 + stretchY} ${92.3041 + stretchX} ${143.424 + stretchY}
    C${108.235 + stretchX} ${146.516 + stretchY} ${125.453 + stretchX} ${142.806 + stretchY} ${131.729 + stretchX} ${131.369 + stretchY}
    C${146.211 + stretchX} ${105.867 + stretchY} ${160.693 + stretchX} ${80.365 + stretchY} ${175.176 + stretchX} ${54.863 + stretchY}
    C${181.452 + stretchX} ${43.4257 + stretchY} ${176.624 + stretchX} ${28.4336 + stretchY} ${160.532 + stretchX} ${26.1152 + stretchY}Z
  `;
  
  const topFaceShadowPath = `
    M52.2116 13.6157
    C59.1068 1.36363 75.7772 -1.15041 90.6177 5.65988
    L90.6273 5.66429
    C110.268 14.8664 129.119 20.2471 ${160.73 + stretchX} ${24.8707 + stretchY}
    C${169.208 + stretchX} ${26.0926 + stretchY} ${174.829 + stretchX} ${30.692 + stretchY} ${177.448 + stretchX} ${36.5746 + stretchY}
    C${180.049 + stretchX} ${42.417 + stretchY} ${179.644 + stretchX} ${49.4215 + stretchY} ${176.336 + stretchX} ${55.4494 + stretchY}
    L${176.332 + stretchX} ${55.4574 + stretchY}
    L${132.889 + stretchX} ${131.956 + stretchY}
    C${132.888 + stretchX} ${131.959 + stretchY} ${132.886 + stretchX} ${131.96 + stretchY} ${132.885 + stretchX} ${131.963 + stretchY}
    C${129.532 + stretchX} ${138.066 + stretchY} ${123.31 + stretchX} ${142.02 + stretchY} ${116.003 + stretchX} ${144.054 + stretchY}
    C${108.694 + stretchX} ${146.088 + stretchY} ${100.193 + stretchX} ${146.238 + stretchY} ${92.0537 + stretchX} ${144.659 + stretchY}
    C91.002 144.467 89.9713 144.279 88.9604 144.095
    C61.5071 139.09 48.6546 136.747 24.262 124.131
    C17.058 120.436 11.1231 115.659 7.82118 110.252
    C4.4826 104.783 3.85087 98.6692 7.31922 92.5891
    C12.4705 83.5181 17.8237 74.1373 23.2277 64.6675
    C33.0219 47.5044 42.9829 30.0491 52.211 13.6167
    L52.2116 13.6157Z
  `;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      viewBox={`0 ${stretch / 10} ${width} ${height}`}
      fill="none"
      className={clsx(
        'group container-size w-auto origin-bottom-right transition-transform hover:scale-x-95 hover:scale-y-90 transform-gpu',
        '[&>path]:cursor-pointer [&>path]:transition-transform [&>path]:group-hover:scale-y-95 [&>path]:origin-bottom-right',
        !className?.includes('aspect-[') && 'aspect-[1.03091408115/1]',
        className)}
      style={{
        height: `${4.125 + (0.484375 * (children.length - 1))}em`,
        aspectRatio: `${1 + (0.1375 * (children.length - 1))}/1`
      }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1={width}
          y1={height * 0.2}
          x2={width * 0.6}
          y2={height}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={sideGradientStart} />
          <stop offset="1" stopColor={sideGradientEnd} />
        </linearGradient>
      </defs>

      {/* Right Side Black Base */}
      <path d={rightSideBaseShadowPath} fill="black"  fillRule="evenodd" clipRule="evenodd" />

      {/* Right Side Gradient */}
      <path d={rightSidePath} fill={`url(#${gradientId})`}  />

      {/* Left Side Black Base */}
      <path d={leftSideBaseShadowPath} fill="black"  fillRule="evenodd" clipRule="evenodd" />

      {/* Top Face Black Shadow/Outline */}
      <path d={topFaceShadowPath} fill="black"  fillRule="evenodd" clipRule="evenodd" />

      {/* Top Face Color */}
      <path d={topFacePath} fill={topColor}  fillRule="evenodd" clipRule="evenodd" />

      <text
        x={126 + (stretch * 0.5)}
        y={38}
        dominantBaseline="middle"
        textAnchor="middle"
        fill={textColor}
        className={clsx(`
          text-[3em] md:text-[1.5em] font-figtree font-black uppercase
          cursor-pointer
        s`)}
        style={{
          transform: `
            scaleY(1.1)
            skewY(-15deg)
            rotate(${18.75 + rotation - (stretch * 0.00875)}deg)
          `,
        }}
      >
        {children}
      </text>
    </svg>
  );
};