import Image from 'next/image';
import logoPath from '@/../public/logos/white-portfolio-logo-transparent-bg.svg';

export const PortfolioLogo = () => (
  <Image src={logoPath} alt='Portfolio Logo' />
);