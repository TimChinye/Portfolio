"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const TIME_ZONE = "Europe/London";

const SCHEDULE = [
    {
        start: 0,
        end: 7,
        type: "rest",
        title: "Starting my day",
        message: "Just starting my day. I'll be at my desk and fully responsive in a couple hours."
    },
    {
        start: 7,
        end: 10,
        type: "commute",
        title: "Handling priorities",
        message: "Catching up & replying to overnight messages. May take a little while, but I'll get back to you!"
    },
    {
        start: 10,
        end: 17,
        type: "noon",
        title: "Currently online and responsive",
        message: "Yep, my laptop and phone is on me. It's a great time to reach out for a quick response."
    },
    {
        start: 17,
        end: 19,
        type: "dinner",
        title: "Winding down",
        message: "You've caught me wrapping up, but I might not have completely signed off yet! Give me a ring!"
    },
    {
        start: 19,
        end: 24,
        type: "rest",
        title: "Offline for the night",
        message: "Probably asleep! I'll be back in action in about [SLEEP_TIMER]."
    }
];

const LABEL_POINTS = [
    { text: "Gym", hour: 5 },
    { text: "Commute", hour: 8 },
    { text: "Noon", hour: 12 },
    { text: "Dinner", hour: 18 },
    { text: "Rest", hour: 22 }
];

function getSegmentColor(type: string, theme?: string) {
    const isDark = theme === 'dark';

    const colours = [
        ["#2F2F2B20", "#F5F5EF20"],
        ["#ECE9A7", "#727248"],
        ["#D9D24D", "#9c9957"]
    ]

    switch (type) {
        case "rest": return colours[0][+isDark];
        case "commute": return colours[1][+isDark];
        case "noon": return colours[2][+isDark];
        case "dinner": return colours[1][+isDark];
        default: return colours[0][+isDark];
    }
}

export function AvailabilityWidget() {
    const { resolvedTheme } = useTheme();

    // State to hold all dynamic values
    const [state, setState] = useState<{
        timeHtml: string; 
        pinLeft: number;
        headerText: string;
        messageText: string;
    } | null>(null);

    useEffect(() => {
        const updateWidget = () => {
            const now = new Date();

            const options: Intl.DateTimeFormatOptions = {
                timeZone: TIME_ZONE,
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZoneName: "short"
            };

            const fmt = new Intl.DateTimeFormat("en-GB", options);
            const parts = fmt.formatToParts(now);
            const getVal = (t: string) => parts.find((p) => p.type === t)?.value || '';

            const h = parseInt(getVal("hour"));
            const m = parseInt(getVal("minute"));
            const s = parseInt(getVal("second"));

            const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
            const tz = getVal("timeZoneName");
            const dateStr = `${getVal("day")}/${getVal("month")}/${getVal("year")}`;

            const timeHtml = `
                <span class="tabular-nums">${timeStr}</span> 
                <span class="text-[#2F2F2BBF] dark:text-[#F5F5EFBF]">[</span>${tz}<span class="text-[#2F2F2BBF] dark:text-[#F5F5EFBF]">] - (</span>${dateStr}<span class="text-[#2F2F2BBF] dark:text-[#F5F5EFBF]">)</span>
            `;

            // Pin Position
            const totalSeconds = h * 3600 + m * 60 + s;
            const percentage = (totalSeconds / 86400) * 100;

            // Status Update
            const workStartBlock = SCHEDULE.find(block => block.type === "commute");
            const workStartHour = workStartBlock ? workStartBlock.start : 7;

            let headerText = "Loading...";
            let messageText = "Loading schedule...";

            let phase = SCHEDULE.find((p) => h >= p.start && h < p.end);
            if (phase) {
                headerText = phase.title;
                let text = phase.message;
                
                if (text.includes("[SLEEP_TIMER]")) {
                    let hours = 0;
                    let mins = 0;
                    if (h >= workStartHour) {
                        hours = 24 - h + workStartHour - 1;
                        mins = 60 - m;
                    } else {
                        hours = workStartHour - h - 1;
                        mins = 60 - m;
                    }
                    if (mins === 60) {
                        mins = 0;
                        hours++;
                    }
                    text = text.replace("[SLEEP_TIMER]", `${hours} hours and ${mins} minutes`);
                }
                messageText = text;
            }

            setState({
                timeHtml,
                pinLeft: percentage,
                headerText,
                messageText
            });
        };

        updateWidget();
        const interval = setInterval(updateWidget, 250);
        return () => clearInterval(interval);
    }, []);

    // Prevent hydration mismatch by rendering nothing until client-side calculation is done
    if (!state) return null;

    return (
        <div className="relative -rotate-[7.5deg] opacity-75 m-[50px] h-fit w-min font-figtree text-[#2F2F2BBF] dark:text-[#F5F5EFBF]">
            
            <div className="absolute inset-1/2 -translate-x-[calc(50%+1rem)] -translate-y-[calc(50%-1rem)] w-full h-full border-[0.25em] border-[#2F2F2B30] dark:border-[#F5F5EF30] rounded-xl pointer-events-none z-0 box-border" />
            
            <div className="relative bg-[#F5F5EF] dark:bg-[#1A1A17] border-[0.25em] border-[#2F2F2B30] dark:border-[#F5F5EF30] rounded-xl p-[2.5em] z-10 flex flex-col gap-[2em] box-border w-min">
                
                <div className="flex flex-col gap-[0.5em]">
                    <h1 className="text-[2.5em] font-bold m-0 leading-none whitespace-nowrap text-[#2F2F2BBF] dark:text-[#F5F5EFBF]">
                        My local time:
                    </h1>
                    <div 
                        className="text-[1.75em] font-bold whitespace-nowrap text-[#86800ebf] dark:text-[#d5d076bf]"
                        dangerouslySetInnerHTML={{ __html: state.timeHtml }} 
                    />
                </div>

                <div className="flex flex-col gap-0">
                    <h2 className="text-[1.75em] font-bold m-0 leading-[1.2] whitespace-nowrap text-[#2F2F2BBF] dark:text-[#F5F5EFBF]">
                        At This Time:
                    </h2>
                    <div className="text-[1.25em] font-normal m-0 leading-normal whitespace-nowrap">
                        {state.headerText}
                    </div>
                </div>

                <div className="flex flex-col gap-[0.5em]">
                    <h3 className="text-[1.75em] font-bold m-0 mb-[0.5em] whitespace-nowrap text-[#2F2F2BBF] dark:text-[#F5F5EFBF]">
                        A Typical Day:
                    </h3>
                    
                    <div className="relative h-6 w-full">
                        
                        <div className="w-full h-full rounded-xl overflow-hidden flex">
                            {SCHEDULE.map((block, i) => (
                                <div 
                                    key={i} 
                                    style={{ 
                                        flexGrow: block.end - block.start,
                                        backgroundColor: getSegmentColor(block.type, resolvedTheme),
                                        height: '100%'
                                    }} 
                                />
                            ))}
                        </div>

                        <div 
                            className="absolute -inset-y-1.5 w-0.5 bg-[#6c692d] dark:bg-[#cbc996] z-10 transition-[left] duration-500"
                            style={{ left: `${state.pinLeft}%` }}
                        >
                            <div className="absolute -translate-y-1/2 -inset-x-1.5 aspect-square bg-[#6c692d] dark:bg-[#cbc996] rounded-full" />
                        </div>

                        {Array.from({ length: 23 }).map((_, i) => (
                            <div 
                                key={i}
                                className="absolute top-0 bottom-0 w-px bg-[rgba(0,0,0,0.2)] z-5 pointer-events-none invisible"
                                style={{ left: `${((i + 1) / 24) * 100}%` }}
                            />
                        ))}
                    </div>

                    <div className="relative h-[1.5em] text-[0.75em] font-normal text-[#2F2F2BBF] dark:text-[#F5F5EFBF] opacity-80 mt-[5px] w-full">
                        {LABEL_POINTS.map((point, i) => (
                            <span 
                                key={i}
                                className="absolute -translate-x-1/2 whitespace-nowrap"
                                style={{ left: `${(point.hour / 24) * 100}%` }}
                            >
                                {point.text}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="text-[1.25em] font-normal leading-[1.4] m-0 text-[#2F2F2BBF] dark:text-[#F5F5EFBF]">
                    {state.messageText}
                </div>

            </div>
        </div>
    );
}