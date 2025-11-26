"use client";

import { useState, useEffect, useRef, type RefObject } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";

// --- Types & Constants ---

const REASONS = [
  { value: "project", label: "Hire you for a project" },
  { value: "full-time", label: "Discuss a full-time role" },
  { value: "question", label: "Ask a general question" },
  { value: "collaborate", label: "Collaborate with you" },
];

const OPPORTUNITIES = [
  { value: "remote", label: "Remote" },
  { value: "on-site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

const LOCATIONS = [
  { value: "London", label: "London" },
  { value: "Sheffield", label: "Sheffield" },
  { value: "Essex", label: "Essex" },
  { value: "Other", label: "Other" },
];

const COMPENSATION_PERIODS = [
    { value: "year", label: "Year" },
    { value: "month", label: "Month" },
    { value: "week", label: "Week" },
    { value: "day", label: "Day" },
    { value: "hour", label: "Hour" },
];

// --- Icons ---

const PaperPlaneIcon = () => (
  <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.5106 0.220156C20.9671 0.457617 20.9127 1.18026 20.9146 1.76788C20.9009 3.30936 20.6086 4.81819 20.3494 6.33539C20.3068 6.59394 20.2642 6.85249 20.2203 7.11888C20.1305 7.65979 20.0395 8.20051 19.9473 8.74103C19.807 9.56651 19.672 10.3927 19.5374 11.2192C19.449 11.7476 19.3603 12.2759 19.2713 12.8041C19.2115 13.1721 19.2115 13.1721 19.1505 13.5476C18.6713 16.3095 18.301 17.0596 17.7606 17.2202C16.791 17.5082 14.8355 16.5832 13.3856 15.5639C13.0438 15.3324 13.0438 15.3324 12.6951 15.0961C12.0417 14.6483 11.3998 14.188 10.7606 13.7202C10.5749 13.5891 10.3893 13.458 10.1981 13.3229C9.04205 12.4439 8.90802 12.2807 8.90802 11.4916C8.87217 10.6264 10.2258 9.68719 11.1512 8.87641C11.5163 8.54624 11.8812 8.21583 12.2459 7.88519C12.4213 7.72797 12.5966 7.57074 12.7773 7.40875C13.6373 6.62824 14.4516 5.80302 15.2606 4.97016C14.3199 5.40402 13.4728 5.96919 12.6121 6.54047C12.455 6.64401 12.2979 6.74754 12.136 6.85422C11.6355 7.18401 11.1355 7.51449 10.6356 7.84516C9.97712 8.28068 9.31821 8.71548 8.659 9.14984C8.50871 9.24959 8.35843 9.34935 8.20358 9.45212C6.74291 10.4144 5.98316 10.8339 4.24787 10.6264C2.85894 10.3321 1.5637 9.77368 0.260564 9.22016C-0.148268 8.74251 -0.0841126 8.37367 0.510564 7.97016C1.07067 7.5901 1.55905 7.32059 2.16877 7.04437C2.34479 6.96068 2.52081 6.87699 2.70216 6.79076C5.1778 5.63048 7.70677 4.58557 10.2293 3.53266C10.732 3.32151 11.2346 3.11025 11.7371 2.89887C14.1682 1.87803 14.1682 1.87803 15.1328 1.47989C15.5667 1.30038 15.9995 1.11835 16.4314 0.934298C16.6493 0.843248 16.8672 0.752198 17.0917 0.658388C17.2859 0.576105 17.4802 0.493821 17.6802 0.409045C18.6508 0.0931234 19.653 -0.225891 20.5106 0.220156Z" fill="#86800E"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- Custom Logic Hook ---

function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// --- Helper Components ---

const InputBlank = ({ 
  value, 
  onChange, 
  placeholder, 
  name,
  className 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  placeholder: string;
  name: string;
  className?: string;
}) => (
  <span className={clsx("relative inline-block", className)}>
    <input 
        type="text"
        name={name}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
            "bg-transparent border-b-2 outline-none",
            "border-[#2F2F2B80] dark:border-[#F5F5EF80]",
            "text-(length:--fs-label) leading-normal text-left", 
            "text-[#2F2F2B] dark:text-[#F5F5EF]",
            "placeholder:text-[#2F2F2B80] dark:placeholder:text-[#F5F5EF80] placeholder:text-(length:--fs-label)",
            "w-full transition-[width] duration-300",
            "pb-1 placeholder:-translate-y-1.5"
        )}
    />
  </span>
);

type Option = { value: string; label: string };

const CustomSelect = ({ 
    value, 
    onChange, 
    options, 
    disabled,
    placeholder = "Select..."
}: { 
    value: string; 
    onChange: (v: string) => void; 
    options: Option[];
    disabled?: boolean;
    placeholder?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);

    useClickOutside(containerRef, () => setIsOpen(false));

    const selectedLabel = options.find(o => o.value === value)?.label;

    const toggleOpen = () => {
        if (!disabled) setIsOpen(prev => !prev);
    };

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <span 
            ref={containerRef}
            className="relative inline-block align-middle ml-[0.25em] mr-[0.125em]"
        >
            {/* TRIGGER */}
            <button
                type="button"
                onClick={toggleOpen}
                disabled={disabled}
                className={clsx(
                    "relative flex items-center gap-2 border-2 rounded-[0.25em] px-[0.2em] py-[0.1em] transition-colors",
                    "border-[#2F2F2B80] dark:border-[#F5F5EF80]",
                    "bg-transparent cursor-pointer",
                    disabled ? "opacity-50 cursor-not-allowed bg-[#2F2F2B10] dark:bg-[#F5F5EF10]" : "hover:bg-[#2F2F2B05] dark:hover:bg-[#F5F5EF05]"
                )}
            >
                <span className={clsx(
                    "text-(length:--fs-dropdown) leading-none whitespace-nowrap",
                    value ? "text-[#2F2F2BBF] dark:text-[#F5F5EFBF]" : "text-[#2F2F2B80] dark:text-[#F5F5EF80]"
                )}>
                    {selectedLabel || placeholder}
                </span>
                <span className="text-(length:--fs-dropdown) pointer-events-none">
                    <ChevronDown />
                </span>
            </button>

            {/* DROPDOWN MENU */}
            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10, scaleY: 0.9 }}
                        animate={{ opacity: 1, y: 4, scaleY: 1 }}
                        exit={{ opacity: 0, y: -10, scaleY: 0.9 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={clsx(
                            "absolute left-0 top-full z-50 min-w-full w-max mt-1 py-1",
                            "bg-[#F5F5EF] dark:bg-[#1A1A17]", 
                            "border-2 border-[#2F2F2B40] dark:border-[#F5F5EF40]",
                            "rounded-lg shadow-xl origin-top"
                        )}
                    >
                        {options.map((opt) => (
                            <li key={opt.value}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={clsx(
                                        "w-full text-left px-4 py-2 cursor-pointer",
                                        "text-(length:--fs-dropdown) text-[#2F2F2B] dark:text-[#F5F5EF]",
                                        "hover:bg-[#2F2F2B10] dark:hover:bg-[#F5F5EF10] transition-colors",
                                        value === opt.value && "font-bold bg-[#2F2F2B05] dark:bg-[#F5F5EF05]"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </span>
    );
};

export function PuzzleForm() {
  // --- State ---
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [reason, setReason] = useState("");
  
  // Opportunity / Location State
  const [opportunity, setOpportunity] = useState("");
  const [location, setLocation] = useState("");
  const [otherLocation, setOtherLocation] = useState("");
  
  // Full-Time Specific State
  const [compensationAmount, setCompensationAmount] = useState("");
  const [compensationPeriod, setCompensationPeriod] = useState("year");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [schedule, setSchedule] = useState("");

  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Logic ---
  const showOpportunityLine = ["project", "full-time", "collaborate"].includes(reason);
  const isOpportunityLocked = ["project", "collaborate"].includes(reason);
  const isFullTime = reason === "full-time";

  // Dynamic Placeholder Logic
  const getSalaryPlaceholder = () => {
    switch (compensationPeriod) {
      case "hour": return "£30";
      case "day": return "£250";
      case "week": return "£1,200";
      case "month": return "£5,000";
      case "year":
      default: return "£65,000";
    }
  };

  useEffect(() => {
    if (isOpportunityLocked) {
        setOpportunity("remote");
    }
  }, [reason, isOpportunityLocked]);

  const showLocation = ["on-site", "hybrid"].includes(opportunity);

  // Reset other location if user switches back to a standard location
  useEffect(() => {
    if (location !== "Other") {
      setOtherLocation("");
    }
  }, [location]);

  // Auto-grow Textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = "auto"; // Reset height to recalculate
        textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
    }
  }, [message]);

  // --- Styles ---
  const styleVars = {
    "--fs-main": "clamp(1.5rem, 2.5vw, 2.5rem)", // ~40px target
    "--fs-label": "clamp(0.875rem, 1.25vw, 1.25rem)", // ~20px target
    "--fs-dropdown": "clamp(1rem, 1.5vw, 1.5rem)", // ~24px target
  } as React.CSSProperties;

  return (
    <form 
        className="w-full flex flex-col gap-4 font-figtree text-[#2F2F2B] dark:text-[#F5F5EF]"
        style={styleVars}
        onSubmit={(e) => e.preventDefault()}
    >
        {/* 1. Greeting */}
        <div className="text-(length:--fs-main) leading-none">
            <span>Hi! I&rsquo;m </span>
            <InputBlank 
                value={name} 
                onChange={setName} 
                placeholder="First Name" 
                name="name" 
                className="w-[15%] min-w-[120px]"
            />
            <span> representing </span>
            <InputBlank 
                value={company} 
                onChange={setCompany} 
                placeholder='Company Name (or "Myself")' 
                name="company" 
                className="w-[25%] min-w-[320px]"
            />
            <span>.</span>
        </div>

        {/* 2. Reason */}
        <div className="text-(length:--fs-main) leading-none">
            <span>I am reaching out to </span>
            <CustomSelect 
                value={reason} 
                onChange={setReason} 
                options={REASONS} 
                placeholder="Collaborate with you"
            />
            <span>.</span>
        </div>

        {/* 3. Opportunity (Conditional) */}
        <AnimatePresence>
            {showOpportunityLine && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-(length:--fs-main) leading-none"
                >
                    <span>The opportunity is </span>
                    <CustomSelect 
                        value={opportunity} 
                        onChange={setOpportunity} 
                        options={OPPORTUNITIES}
                        disabled={isOpportunityLocked} 
                        placeholder="Select type"
                    />
                    
                    {showLocation && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <span> and based in </span>
                            <CustomSelect 
                                value={location} 
                                onChange={setLocation} 
                                options={LOCATIONS} 
                                placeholder="London"
                            />
                        </motion.span>
                    )}
                    <span>.</span>

                </motion.div>
            )}
        </AnimatePresence>

        {/* 3b. Specific Location (Other) */}
        <AnimatePresence>
            {showLocation && location === "Other" && (
                    <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-visible text-(length:--fs-main) leading-none relative z-10"
                    >
                    <span>Specifically in </span>
                    <InputBlank 
                        value={otherLocation} 
                        onChange={setOtherLocation} 
                        placeholder="City, Country" 
                        name="otherLocation" 
                        className="w-[30%] min-w-[200px]"
                    />
                    <span>.</span>
                    </motion.div>
            )}
        </AnimatePresence>

        {/* 3c. Full Time Details (Salary/Hours) */}
        <AnimatePresence>
            {isFullTime && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-visible text-(length:--fs-main) leading-none relative z-10"
                >
                    <div className="pt-2">
                        <span>The role pays </span>
                        <InputBlank 
                            value={compensationAmount} 
                            onChange={setCompensationAmount} 
                            placeholder={getSalaryPlaceholder()} 
                            name="compensation" 
                            className="w-[15%] min-w-[100px]"
                        />
                        <span> per </span>
                        <CustomSelect 
                            value={compensationPeriod} 
                            onChange={setCompensationPeriod} 
                            options={COMPENSATION_PERIODS}
                            placeholder="Year" 
                        />
                        <span>.</span>
                    </div>

                    <div className="pt-2">
                        <span>This is a </span>
                        <InputBlank 
                            value={weeklyHours} 
                            onChange={setWeeklyHours} 
                            placeholder="37.5" 
                            name="hours" 
                            className="w-[3ch]"
                        />
                        <span> hour{parseInt(weeklyHours) != 1 && "s"} per week role, ideally </span>
                        <InputBlank 
                            value={schedule} 
                            onChange={setSchedule} 
                            placeholder="ex: &quot;9-5 from Mon-Wed, 8-2 on Friday&quot;" 
                            name="schedule" 
                            className="w-[35%] min-w-[220px]"
                        />
                        <span>.</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* 4. Details / Body */}
        <div className="flex flex-col gap-0 mt-4">
            <h3 className="text-(length:--fs-main) font-normal">
                {isFullTime ? "Here are more specifics:" : "Here are the details:"}
            </h3>
            <div className="grid grid-cols-[auto_1fr] auto-rows-[1fr] gap-4">
                <div className="w-2 min-h-[120px] h-full bg-[#2F2F2B20] dark:bg-[#F5F5EF20] rounded-full shrink-0 mt-1" />
                
                <textarea 
                    ref={textareaRef}
                    value={message}
                    required
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows={1}
                    className={clsx(
                        "w-full bg-transparent resize-none outline-none border-none p-0 mt-1",
                        "text-(length:--fs-label)", 
                        "text-[#2F2F2BBF] dark:text-[#F5F5EFBF]", 
                        "placeholder:text-[#2F2F2B80] dark:placeholder:text-[#F5F5EF80]",
                        "leading-normal min-h-[120px] "
                    )}
                />
            </div>
        </div>

        {/* 5. Email & Submit */}
        <div className="flex flex-col gap-12">
            <div className="text-(length:--fs-main) leading-none">
                <span>Please reply to </span>
                <InputBlank 
                    value={email} 
                    onChange={setEmail} 
                    placeholder="Email Address" 
                    name="email" 
                    className="w-[40%] min-w-[250px]"
                />
                <span>.</span>
            </div>

            <div className="self-end">
                <button
                    type="submit"
                    className={clsx(
                        "group flex items-center gap-3 px-8 py-3 rounded-full cursor-pointer",
                        "border-4 border-[#2F2F2B40] dark:border-[#F5F5EF40]", 
                        "text-[#2F2F2B80] dark:text-[#F5F5EF80]", 
                        "text-(length:--fs-label) font-normal tracking-wide" 
                    )}
                >
                    <span>Send Message</span>
                    <span className="group-hover:-translate-y-0.5 transition-transform duration-300">
                        <PaperPlaneIcon />
                    </span>
                </button>
            </div>
        </div>
    </form>
  );
}