import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface KpiStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'silver' | 'emerald' | 'amber' | 'neutral';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

/**
 * Operational Telemetry & KPI Stat Card
 * Features:
 * - Subtle obsidian glass gradient background
 * - Top-edge specular highlight
 * - Monospace counter typography
 * - Trend badge and indicator
 */
export const KpiStatCard: React.FC<KpiStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'silver',
  trend,
  onClick,
  className = '',
}) => {
  const variantStyles = {
    silver: 'glass-kpi-silver border-white/15 bg-white/[0.04]',
    emerald: 'glass-kpi-emerald border-emerald-500/20 bg-emerald-950/20',
    amber: 'glass-kpi-amber border-amber-500/20 bg-amber-950/20',
    neutral: 'glass-panel-subtle border-white/10 bg-white/[0.02]',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 border ${
        onClick ? 'cursor-pointer hover:translate-y-[-2px] hover:border-white/25 active:scale-[0.98]' : ''
      } ${variantStyles} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-zinc-300" />}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-100 tracking-tight tabular-nums">
          {value}
        </div>

        {trend && (
          <span
            className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
              trend.isPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-1 text-[11px] font-mono text-zinc-500">
          {subtitle}
        </div>
      )}
    </div>
  );
};
