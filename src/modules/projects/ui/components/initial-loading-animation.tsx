"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

const animations = [
  {
    title: "Updating theme colors",
    filename: "/app/globals.css",
    elements: [
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0 },
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0.1 },
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0.2 },
      { type: "bar", color: "bg-blue-400", width: "w-16", delay: 0.3 },
      { type: "bar", color: "bg-slate-500", width: "w-24", delay: 0.4 },
      { type: "bar", color: "bg-slate-400", width: "w-20", delay: 0.5 },
      { type: "dot", color: "bg-gray-400", size: "w-2 h-2", delay: 0.6 },
      { type: "bar", color: "bg-cyan-500", width: "w-8", delay: 0.7 },
      { type: "bar", color: "bg-slate-400", width: "w-32", delay: 0.8 },
      { type: "bar", color: "bg-blue-400", width: "w-12", delay: 0.9 },
      { type: "bar", color: "bg-slate-500", width: "w-28", delay: 1 },
      { type: "bar", color: "bg-slate-400", width: "w-24", delay: 1.1 },
    ],
  },
  {
    title: "Creating features section",
    filename: "/components/features.tsx",
    elements: [
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0 },
      { type: "bar", color: "bg-cyan-500", width: "w-14", delay: 0.1 },
      { type: "bar", color: "bg-slate-500", width: "w-10", delay: 0.2 },
      { type: "bar", color: "bg-blue-400", width: "w-8", delay: 0.3 },
      { type: "bar", color: "bg-cyan-500", width: "w-20", delay: 0.4 },
      { type: "bar", color: "bg-slate-500", width: "w-32", delay: 0.5 },
      { type: "bar", color: "bg-slate-400", width: "w-12", delay: 0.6 },
      { type: "bar", color: "bg-cyan-500", width: "w-24", delay: 0.7 },
      { type: "bar", color: "bg-slate-400", width: "w-28", delay: 0.8 },
      { type: "bar", color: "bg-cyan-500", width: "w-16", delay: 0.9 },
      { type: "bar", color: "bg-slate-500", width: "w-10", delay: 1 },
      { type: "dot", color: "bg-gray-500", size: "w-2 h-2", delay: 1.1 },
    ],
  },
  {
    title: "Building responsive layout",
    filename: "/app/layout.tsx",
    elements: [
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0 },
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0.1 },
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0.2 },
      { type: "bar", color: "bg-blue-400", width: "w-12", delay: 0.3 },
      { type: "bar", color: "bg-slate-400", width: "w-16", delay: 0.4 },
      { type: "bar", color: "bg-cyan-500", width: "w-10", delay: 0.5 },
      { type: "bar", color: "bg-slate-500", width: "w-24", delay: 0.6 },
      { type: "bar", color: "bg-blue-400", width: "w-8", delay: 0.7 },
      { type: "bar", color: "bg-slate-400", width: "w-20", delay: 0.8 },
      { type: "dot", color: "bg-gray-500", size: "w-2 h-2", delay: 0.9 },
      { type: "bar", color: "bg-slate-500", width: "w-14", delay: 1 },
      { type: "bar", color: "bg-cyan-500", width: "w-18", delay: 1.1 },
      { type: "dot", color: "bg-gray-500", size: "w-2 h-2", delay: 1.2 },
    ],
  },
  {
    title: "Setting up navigation",
    filename: "/components/navbar.tsx",
    elements: [
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0 },
      { type: "bar", color: "bg-blue-400", width: "w-16", delay: 0.1 },
      { type: "bar", color: "bg-cyan-500", width: "w-12", delay: 0.2 },
      { type: "bar", color: "bg-slate-400", width: "w-24", delay: 0.3 },
      { type: "bar", color: "bg-slate-500", width: "w-20", delay: 0.4 },
      { type: "bar", color: "bg-blue-400", width: "w-10", delay: 0.5 },
      { type: "dot", color: "bg-gray-500", size: "w-2 h-2", delay: 0.6 },
      { type: "bar", color: "bg-slate-400", width: "w-28", delay: 0.7 },
      { type: "bar", color: "bg-cyan-500", width: "w-14", delay: 0.8 },
    ],
  },
  {
    title: "Configuring animations",
    filename: "/lib/animations.ts",
    elements: [
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0 },
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0.1 },
      { type: "dot", color: "bg-gray-400", size: "w-3 h-3", delay: 0.2 },
      { type: "bar", color: "bg-cyan-500", width: "w-14", delay: 0.3 },
      { type: "bar", color: "bg-blue-400", width: "w-10", delay: 0.4 },
      { type: "bar", color: "bg-slate-500", width: "w-32", delay: 0.5 },
      { type: "bar", color: "bg-slate-400", width: "w-16", delay: 0.6 },
      { type: "bar", color: "bg-cyan-500", width: "w-20", delay: 0.7 },
      { type: "dot", color: "bg-gray-500", size: "w-2 h-2", delay: 0.8 },
      { type: "bar", color: "bg-slate-500", width: "w-12", delay: 0.9 },
      { type: "bar", color: "bg-blue-400", width: "w-24", delay: 1 },
    ],
  },
];

interface CodeCardProps {
  animation: (typeof animations)[0];
  isStatic?: boolean;
  isExiting?: boolean;
  zIndex?: number;
  offset?: number;
}

const CodeCard = ({
  animation,
  isStatic,
  isExiting,
  zIndex = 0,
  offset = 0,
}: CodeCardProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden",
        isStatic && "transition-all duration-1000 ease-out",
        isExiting &&
          "animate-out slide-out-to-left-1/3 fade-out duration-700 ease-in fill-mode-forwards",
        !isStatic &&
          !isExiting &&
          "animate-in slide-in-from-right-full fade-in duration-800 ease-out",
      )}
      style={{
        zIndex,
        ...(isStatic
          ? {
              transform: `translate(${offset * 6}px, ${offset * 6}px) scale(${1 - offset * 0.03})`,
              opacity: 0.4 - offset * 0.1,
            }
          : {}),
      }}
    >
      {/* Window Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="text-sm text-muted-foreground ml-2 font-mono">
          {animation.filename}
        </span>
      </div>

      {/* Code Content */}
      <div className="p-4 space-y-2 min-h-[220px]">
        {animation.elements.map((element, index) => (
          <div
            key={index}
            className={cn(
              element.type === "dot" ? "flex items-center gap-2" : "",
              !isStatic && "animate-in fade-in slide-in-from-left-4",
            )}
            style={{
              animationDelay: !isStatic ? `${element.delay}s` : "0s",
              animationDuration: "0.6s",
              animationFillMode: "backwards",
            }}
          >
            {element.type === "bar" ? (
              <div
                className={cn("h-2 rounded-full", element.width, element.color)}
              />
            ) : (
              <div
                className={cn("rounded-full", element.size, element.color)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const InitialLoadingAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const [cardStack, setCardStack] = useState<number[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const cardStackRef = useRef<number[]>([]);

  // Keep refs in sync
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    cardStackRef.current = cardStack;
  }, [cardStack]);

  useEffect(() => {
    const shuffled = [...Array(animations.length).keys()].sort(
      () => Math.random() - 0.5,
    );
    setCardStack(shuffled.slice(1));
    setCurrentIndex(shuffled[0]);
  }, []);

  useEffect(() => {
    if (cardStack.length === 0) return;

    intervalRef.current = setInterval(() => {
      const currentStack = cardStackRef.current;
      if (currentStack.length === 0) return;

      const nextCard = currentStack[0];

      // Update all states (React batches these)
      setCardStack((prev) => {
        const newStack = [...prev];
        newStack.shift();
        newStack.push(nextCard);
        return newStack;
      });

      setExitingIndex(currentIndexRef.current);
      setCurrentIndex(nextCard);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setExitingIndex(null);
      }, 700);
    }, 6000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cardStack.length]);

  const staticAnimation = animations[currentIndex];
  const exitingAnimation =
    exitingIndex !== null ? animations[exitingIndex] : null;
  const nextAnimations = cardStack.slice(0, 2).map((idx) => animations[idx]);

  return (
    <div className="flex items-center justify-center h-full w-full bg-background">
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-[360px] h-[300px]">
          {/* Background cards (deck effect) */}
          {nextAnimations
            .slice()
            .reverse()
            .map((anim, idx) => {
              const reverseIdx = nextAnimations.length - idx;
              const animIndex = cardStack[nextAnimations.length - 1 - idx];
              return (
                <CodeCard
                  key={animIndex}
                  animation={anim}
                  isStatic
                  zIndex={reverseIdx}
                  offset={reverseIdx}
                />
              );
            })}

          {/* Exiting card */}
          {exitingAnimation && (
            <CodeCard
              key={`exit-${exitingIndex}`}
              animation={exitingAnimation}
              isExiting
              zIndex={9}
            />
          )}

          {/* Active card */}
          <CodeCard
            key={`active-${currentIndex}`}
            animation={staticAnimation}
            zIndex={10}
          />
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-3">
          <h3
            key={currentIndex}
            className="text-lg font-medium text-foreground/90 animate-in fade-in duration-700"
          >
            {staticAnimation.title}
          </h3>
          <div className="flex items-center gap-1 justify-center">
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
