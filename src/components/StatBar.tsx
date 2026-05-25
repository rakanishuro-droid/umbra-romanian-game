interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  icon?: React.ReactNode;
}

const StatBar = ({ label, value, max, color, icon }: StatBarProps) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {icon}{label}
        </span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

export default StatBar;
