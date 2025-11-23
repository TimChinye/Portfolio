type ContentProgressBarProps = {
  projectNumber: number;
  progress: number; // A value from 0 to 100
};

export function ContentProgressBar({ projectNumber, progress }: ContentProgressBarProps) {
  const finalProgress = Math.max(Math.min(progress, 100), 0);

  return (
    <div className="pt-32 pb-16 px-4 md:px-8 flex flex-col text-center items-center gap-4">
      <div className="text-[#7A751A] font-figtree text-4xl font-bold leading-none w-[2ch]">
        { projectNumber }
      </div>

      {/* Progress Track */}
      <div className="relative grow rounded-full w-1 bg-[#E4E191]">
        
        {/* Progress Thumb (Fill) */}
        <div
          className="relative rounded-[inherit] w-full bg-[#7A751A]"
          style={{ height: `${finalProgress}%` }}
        >
          {false && finalProgress > 0 && (
            <span className="absolute bottom-0 -translate-x-1/2 translate-y-1/2 text-white bg-[#7A751A] px-2 rounded-sm text-sm leading-relaxed">
              {Math.round(finalProgress)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}