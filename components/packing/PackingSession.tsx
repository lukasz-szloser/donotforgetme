"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { toggleItemChecked } from "@/actions/packing";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, PartyPopper } from "lucide-react";
import type { PackingItem } from "@/types/database";

interface PackingSessionProps {
  queue: PackingItem[];
  onComplete?: () => void;
}

export function PackingSession({ queue: initialQueue, onComplete }: PackingSessionProps) {
  const [queue, setQueue] = useState(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
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
      // Swipe Right - Mark as packed
      handlePacked();
    } else if (info.offset.x < -threshold) {
      // Swipe Left - Skip
      handleSkip();
    }
  };

  const handlePacked = () => {
    if (!currentItem || isPending) return;

    setDirection("right");
    startTransition(async () => {
      const result = await toggleItemChecked(currentItem.id, true);
      if (result.success) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setDirection(null);
          x.set(0);
        }, 300);
      }
    });
  };

  const handleSkip = () => {
    if (!currentItem || isPending) return;

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
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <p className="text-lg text-slate-600 dark:text-slate-400">Ładowanie...</p>
      </div>
    );
  }

  const remaining = queue.length - currentIndex;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Progress indicator */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600 dark:text-slate-400">
            Element {currentIndex + 1} z {queue.length}
          </span>
          <span className="font-medium text-blue-600">{remaining} pozostało</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-md h-[400px] mb-8">
        <motion.div
          className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center border-2 border-slate-200 dark:border-slate-700"
          style={{
            x,
            rotate,
            opacity,
            cursor: isPending ? "default" : "grab",
          }}
          drag={!isPending ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleSwipe}
          whileTap={{ cursor: "grabbing" }}
          animate={
            direction
              ? {
                  x: direction === "right" ? 300 : -300,
                  opacity: 0,
                  transition: { duration: 0.3 },
                }
              : {}
          }
        >
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-4">
            {currentItem.title}
          </h3>

          {/* Swipe indicators */}
          <div className="absolute top-8 left-8 opacity-0 transition-opacity" id="swipe-left">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <div className="absolute top-8 right-8 opacity-0 transition-opacity" id="swipe-right">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>

          {/* Instructions */}
          <p className="text-slate-600 dark:text-slate-400 text-center mt-auto">
            Przesuń w prawo aby spakować
            <br />
            Przesuń w lewo aby pominąć
          </p>
        </motion.div>

        {/* Next card preview (in background) */}
        {queue[currentIndex + 1] && (
          <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl -z-10 scale-95 opacity-50 border border-slate-200 dark:border-slate-700" />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleSkip}
          disabled={isPending}
          className="gap-2"
        >
          <XCircle className="w-5 h-5" />
          Pomiń
        </Button>
        <Button
          size="lg"
          onClick={handlePacked}
          disabled={isPending}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle2 className="w-5 h-5" />
          Spakowane
        </Button>
      </div>
    </div>
  );
}
