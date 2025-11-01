import { PortfolioIcon } from './PortfolioIcon';

const scale = 0.66;

export const SanityStudioIcon = () => (
  <PortfolioIcon 
    className="text-black" 
    bgClass="fill-white" 
    scale={scale}
    translateX={(1 - scale) * 30}
    translateY={(1 - scale) * 36}
  />
);