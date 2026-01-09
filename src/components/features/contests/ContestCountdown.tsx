import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContestCountdownProps {
  targetDate: string;
  label?: string;
  onEnd?: () => void;
  className?: string;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const difference = new Date(targetDate).getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

export function ContestCountdown({
  targetDate,
  label,
  onEnd,
  className,
  compact = false,
}: ContestCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate));
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.total <= 0 && !hasEnded) {
        setHasEnded(true);
        onEnd?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, hasEnded, onEnd]);

  const isUrgent = timeLeft.total > 0 && timeLeft.total < 24 * 60 * 60 * 1000; // Less than 24h

  if (timeLeft.total <= 0) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Clock className="h-4 w-4" />
        <span>Încheiat</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm",
        isUrgent ? "text-orange-500" : "text-muted-foreground",
        className
      )}>
        {isUrgent && <AlertTriangle className="h-4 w-4" />}
        {!isUrgent && <Clock className="h-4 w-4" />}
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}z `}
          {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className={cn(
          "text-sm font-medium",
          isUrgent ? "text-orange-500" : "text-muted-foreground"
        )}>
          {isUrgent && <AlertTriangle className="inline h-4 w-4 mr-1" />}
          {label}
        </p>
      )}
      <div className={cn(
        "flex items-center gap-2 md:gap-4",
        isUrgent ? "text-orange-500" : ""
      )}>
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold">{timeLeft.days}</span>
            <span className="text-xs text-muted-foreground">zile</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">ore</span>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">min</span>
        </div>
        {isUrgent && (
          <>
            <span className="text-2xl font-bold">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className="text-xs text-muted-foreground">sec</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
