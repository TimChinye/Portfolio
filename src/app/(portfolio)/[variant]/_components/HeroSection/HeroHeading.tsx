import clsx from 'clsx';
import React from 'react';

type HeroHeadingProps = {
  /** The text to display in the main h1 tag. */
  headingText: string;
  /** The fully processed content for the intro paragraph, which may include elements like <br>. */
  introText: React.ReactNode;
  /** The Tailwind class for the main heading container. */
  headingClassName: string;
  /** The Tailwind class for the intro text span. */
  introClassName: string;
  /** Optional additional classes for the container. */
  className?: string;
};

export function HeroHeading({
  headingText,
  introText,
  headingClassName,
  introClassName,
  className
}: HeroHeadingProps) {
  return (
    <header className={clsx("inline-block w-fit text-black dark:text-white", headingClassName, className)}>
      <h1 className={clsx(
        "m-0 leading-[0.75] font-bold select-none",
        'gjpqy'.split('').some(letter => headingText.includes(letter)) && "uppercase"
      )}>
        {headingText}
      </h1>
      <p className="text-[0px] container-inline-size">
        <span className={`-translate-y-1/1 ${introClassName}`}>
          {introText}
        </span>
      </p>
    </header>
  );
}