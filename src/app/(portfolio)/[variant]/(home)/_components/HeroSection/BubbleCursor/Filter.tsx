type Filter = {
  baseFrequency: string;
  scale: string;
};

export const Filter = (props: Filter) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="absolute w-0 h-0" aria-hidden="true">
    <defs>
      <filter id="glass-distortion">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={`${props.baseFrequency || '0.008 0.008'}`}
          numOctaves="2"
          seed="92"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurred"
          scale={`${props.scale || '77'}`}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);