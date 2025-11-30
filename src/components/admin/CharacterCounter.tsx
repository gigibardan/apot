interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export default function CharacterCounter({
  current,
  max,
  className = "",
}: CharacterCounterProps) {
  const getColor = () => {
    const percentage = (current / max) * 100;
    if (percentage < 85) return "text-green-600";
    if (percentage < 100) return "text-yellow-600";
    return "text-destructive";
  };

  return (
    <p className={`text-xs ${getColor()} ${className}`}>
      {current}/{max} caractere
      {current > max && " (prea lung!)"}
    </p>
  );
}
