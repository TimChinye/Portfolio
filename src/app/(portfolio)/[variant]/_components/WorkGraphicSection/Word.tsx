import { SVG_MAP, type CharacterKey, type SvgProps } from './CharacterSVGs';
import { CharacterStack } from './CharacterStack';

const CHARACTERS: CharacterKey[] = ["W", "O", "R", "K", "_"];

interface WordProps {
  isClipped: boolean;
}

export const Word = ({ isClipped }: WordProps) => {
  return (
    <div className="flex h-[1em] w-fit items-center justify-center gap-[0.05em]">
      {CHARACTERS.map((char) => {
        const SvgComponent: React.FC<SvgProps> = SVG_MAP[char];

        return isClipped ? (
          <SvgComponent
            key={`${char}-clipped`}
            className="h-full w-auto text-black dark:text-white"
          />
        ) : (
          <CharacterStack
            key={`${char}-stack`}
            SvgComponent={SvgComponent}
          />
        );
      })}
    </div>
  );
};