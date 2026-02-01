"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, PartyPopper } from "lucide-react";
import type { PackingItem } from "@/types/database";

interface PackingSessionTestProps {
  queue: PackingItem[];
  onComplete?: () => void;
}

/**
 * Test-only version of PackingSession that doesn't call server actions
 * Used in E2E test routes to avoid database dependencies
 */
export function PackingSessionTest({ queue: initialQueue, onComplete }: PackingSessionTestProps) {
  const [queue, setQueue] = useState(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const currentItem = queue[currentIndex];
  const isComplete = currentIndex >= queue.length;

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const handleSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handlePacked();
    } else if (info.offset.x < -threshold) {
      handleSkip();
    }
  };

  const handlePacked = () => {
    if (!currentItem) return;

    setDirection("right");
    // For tests: Just move to next item (no server action)
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
      x.set(0);
    }, 300);
  };

  const handleSkip = () => {
    if (!currentItem) return;

    setDirection("left");
    // Move item to end of queue
    setQueue((prev) => {
      const newQueue = [...prev];
      const item = newQueue.splice(currentIndex, 1)[0];
      if (item) {
        newQueue.push(item);
      }
      return newQueue;
    });

    setTimeout(() => {
      setDirection(null);
      x.set(0);
    }, 300);
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <PartyPopper className="w-24 h-24 text-green-500 mb-6" />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Gratulacje!</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Spakowałeś wszystkie przedmioty z kolejki! 🎉
        </p>
        <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
          Powrót do listy
        </Button>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Brak elementów do spakowania</p>
      </div>
    );
  }

  const remaining = queue.length - currentIndex;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 relative">
      {/* Progress Bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Element {currentIndex + 1} z {queue.length}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">{remaining} pozostało</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-md h-96">
        {/* Next card preview */}
        {queue[currentIndex + 1] && (
          <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg opacity-50 scale-95" />
        )}

        {/* Current card */}
        <motion.div
          key={currentItem.id}
          className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing"
          style={{
            x,
            rotate,
            opacity,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleSwipe}
          animate={
            direction
              ? {
                  x: direction === "right" ? 400 : -400,
                  opacity: 0,
                  transition: { duration: 0.3 },
                }
              : {}
          }
        >
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {currentItem.title}
            </h3>

            <div className="space-y-4 text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Przesuń w prawo aby spakować
              </p>
              <p className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Przesuń w lewo aby pominąć
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button variant="outline" size="lg" onClick={handleSkip}>
          <XCircle className="w-5 h-5 mr-2" />
          Pomiń
        </Button>
        <Button variant="default" size="lg" onClick={handlePacked}>
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Spakowane
        </Button>
      </div>
    </div>
  );
}
