import clsx from 'clsx';

type BackgroundTextProps = {
  children: React.ReactNode;
  rotation?: 'left' | 'right'; // Control the angle
  className?: string; // Allow passing extra classes for positioning
};

export const BackgroundText = ({ children, rotation = 'left', className }: BackgroundTextProps) => {
  // Base styles that are always applied
  const baseClasses = 'absolute font-newsreader text-[#D6D6D1] text-center leading-[100%]';

  // Conditional styles based on the 'rotation' prop
  const rotationClasses = {
    left: 'rotate-15',
    right: '-rotate-15',
  };

  return (
    // We use clsx to merge the base, rotational, and any passed-in classes
    <p className={clsx(baseClasses, rotationClasses[rotation], className)}>
      {children}
    </p>
  );
};