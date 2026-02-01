"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { toggleItemChecked } from "@/actions/packing";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, PartyPopper, ArrowLeft, Loader2 } from "lucide-react";
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
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Swipe indicator opacity
  const leftIndicatorOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);

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

  // Completion Screen
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.5 }}
          className="w-32 h-32 rounded-full bg-success/10 flex items-center justify-center mb-8"
        >
          <PartyPopper className="w-16 h-16 text-success" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-4"
        >
          Gratulacje!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground mb-8"
        >
          Spakowałeś wszystkie przedmioty z kolejki!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
            className="gap-2 touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
            Powrót do listy
          </Button>
        </motion.div>
      </div>
    );
  }

  // Loading State
  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Ładowanie...</p>
      </div>
    );
  }

  const remaining = queue.length - currentIndex;
  const progress = ((currentIndex + 1) / queue.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Progress indicator */}
      <div className="w-full max-w-md mb-8 animate-fade-in">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-muted-foreground">
            Element <span className="font-semibold text-foreground">{currentIndex + 1}</span> z{" "}
            {queue.length}
          </span>
          <span className="font-semibold text-primary">{remaining} pozostało</span>
        </div>
        <div className="progress-bar h-3">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-md h-[420px] mb-8">
        {/* Next card preview (in background) */}
        {queue[currentIndex + 1] && (
          <div className="absolute inset-0 bg-card rounded-3xl shadow-soft -z-20 scale-[0.92] translate-y-4 opacity-40 border border-border/50" />
        )}
        {queue[currentIndex + 2] && (
          <div className="absolute inset-0 bg-card rounded-3xl shadow-soft -z-30 scale-[0.85] translate-y-8 opacity-20 border border-border/50" />
        )}

        {/* Main card */}
        <motion.div
          className="absolute inset-0 bg-card rounded-3xl shadow-elevated p-8 flex flex-col items-center justify-center border border-border/50 overflow-hidden"
          style={{
            x,
            rotate,
            opacity,
            cursor: isPending ? "default" : "grab",
          }}
          drag={!isPending ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleSwipe}
          whileTap={{ cursor: "grabbing", scale: 0.98 }}
          animate={
            direction
              ? {
                  x: direction === "right" ? 400 : -400,
                  opacity: 0,
                  rotate: direction === "right" ? 20 : -20,
                  transition: { duration: 0.3, ease: "easeOut" },
                }
              : {}
          }
        >
          {/* Swipe indicators on card */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-transparent pointer-events-none"
            style={{ opacity: leftIndicatorOpacity }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-l from-success/20 to-transparent pointer-events-none"
            style={{ opacity: rightIndicatorOpacity }}
          />

          {/* Skip indicator */}
          <motion.div className="absolute top-8 left-8" style={{ opacity: leftIndicatorOpacity }}>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
          </motion.div>

          {/* Pack indicator */}
          <motion.div className="absolute top-8 right-8" style={{ opacity: rightIndicatorOpacity }}>
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
          </motion.div>

          {/* Item title */}
          <div className="flex-1 flex items-center justify-center">
            <h3 className="text-2xl md:text-3xl font-bold text-center px-4">{currentItem.title}</h3>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-1">
            <p className="text-muted-foreground text-sm">Przesuń kartę</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-1 text-destructive">
                <ArrowLeft className="w-4 h-4" /> Pomiń
              </span>
              <span className="flex items-center gap-1 text-success">
                Spakuj <ArrowLeft className="w-4 h-4 rotate-180" />
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleSkip}
          disabled={isPending}
          className="gap-2 h-14 px-6 rounded-xl border-2 hover:border-destructive hover:text-destructive transition-colors touch-target"
        >
          <XCircle className="w-5 h-5" />
          Pomiń
        </Button>
        <Button
          size="lg"
          onClick={handlePacked}
          disabled={isPending}
          className="gap-2 h-14 px-8 rounded-xl bg-success hover:bg-success/90 shadow-lg shadow-success/20 touch-target"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          Spakowane
        </Button>
      </div>
    </div>
  );
}
