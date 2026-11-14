import React, { useState } from 'react';
import { CategoryKey } from '../types/finance';
import { CATEGORY_DEFINITIONS, formatINR } from '../utils/calculations';

interface DoughnutChartProps {
  allocations: Record<CategoryKey, number>;
  amounts: Record<CategoryKey, number>;
  totalIncome: number;
  size?: number;
  strokeWidth?: number;
  activeCategory?: CategoryKey | null;
  onSelectCategory?: (key: CategoryKey) => void;
}

export const DoughnutChart: React.FC<DoughnutChartProps> = ({
  allocations,
  amounts,
  totalIncome,
  size = 260,
  strokeWidth = 32,
  activeCategory,
  onSelectCategory,
}) => {
  const [hoveredKey, setHoveredKey] = useState<CategoryKey | null>(null);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute slice angles and offsets
  const categories = Object.keys(allocations) as CategoryKey[];
  const totalPct = categories.reduce((sum, key) => sum + (allocations[key] || 0), 0) || 100;

  let cumulativeOffset = 0;
  const slices = categories.map((key) => {
    const percentage = allocations[key] || 0;
    const strokeDasharray = `${(percentage / totalPct) * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += (percentage / totalPct) * circumference;

    return {
      key,
      percentage,
      strokeDasharray,
      strokeDashoffset,
      color: CATEGORY_DEFINITIONS[key]?.color || '#94a3b8',
      label: CATEGORY_DEFINITIONS[key]?.label || key,
      amount: amounts[key] || 0,
    };
  });

  const displayKey = hoveredKey || activeCategory;
  const displaySlice = displayKey ? slices.find((s) => s.key === displayKey) : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => {
            const isSelected = displayKey === slice.key;
            return (
              <circle
                key={slice.key}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isSelected ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-300 cursor-pointer hover:opacity-90"
                onMouseEnter={() => setHoveredKey(slice.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => onSelectCategory && onSelectCategory(slice.key)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          {displaySlice ? (
            <>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {displaySlice.label}
              </span>
              <span className="text-xl font-bold text-[#14213D] mt-0.5">
                {formatINR(displaySlice.amount)}
              </span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5">
                {displaySlice.percentage}% of income
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Monthly Income
              </span>
              <span className="text-2xl font-extrabold text-[#14213D] tracking-tight">
                {formatINR(totalIncome)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                100% Allocated
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
