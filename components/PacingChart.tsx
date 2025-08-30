import React, { useState, useMemo } from 'react';
import type { PacingPoint } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface PacingChartProps {
  data: PacingPoint[];
}

const PacingChart: React.FC<PacingChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 30 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { path, points } = useMemo(() => {
    if (data.length < 2) return { path: '', points: [] };

    const xScale = (index: number) => (index / (data.length - 1)) * chartWidth;
    const yScale = (intensity: number) => chartHeight - ((intensity - 1) / 9) * chartHeight;

    const pathData = data.map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.intensity);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const pointCoords = data.map((point, index) => ({
      x: xScale(index),
      y: yScale(point.intensity),
      ...point,
    }));

    return { path: pathData, points: pointCoords };
  }, [data, chartWidth, chartHeight]);

  const yAxisLabels = [1, 3, 5, 7, 10];
  const textColor = theme === 'dark' ? '#9ca3af' : '#4b5563';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const primaryColor = 'hsl(221 83% 53%)';

  return (
    <div className="relative w-full flex justify-center items-center flex-col">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-2xl">
            <g transform={`translate(${padding.left}, ${padding.top})`}>
                {/* Y-axis grid lines and labels */}
                {yAxisLabels.map(label => {
                    const y = chartHeight - ((label - 1) / 9) * chartHeight;
                    return (
                        <g key={label}>
                            <line x1={0} y1={y} x2={chartWidth} y2={y} stroke={gridColor} strokeWidth="1" strokeDasharray="2,2" />
                            <text x={-10} y={y + 4} fill={textColor} fontSize="10" textAnchor="end">{label}</text>
                        </g>
                    );
                })}
                <text x={-20} y={chartHeight/2} fill={textColor} fontSize="10" textAnchor="middle" transform={`rotate(-90, -20, ${chartHeight/2})`}>Intensity</text>

                {/* X-axis labels (Start, Mid, End) */}
                <text x={0} y={chartHeight + 20} fill={textColor} fontSize="10" textAnchor="start">Start</text>
                <text x={chartWidth / 2} y={chartHeight + 20} fill={textColor} fontSize="10" textAnchor="middle">Mid</text>
                <text x={chartWidth} y={chartHeight + 20} fill={textColor} fontSize="10" textAnchor="end">End</text>
                
                {/* Chart Line */}
                <path d={path} fill="none" stroke={primaryColor} strokeWidth="2" />
                
                {/* Data Points */}
                {points.map((point, index) => (
                    <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={activePointIndex === index ? 6 : 4}
                        fill={primaryColor}
                        stroke="hsl(var(--brand-surface))"
                        strokeWidth="2"
                        onMouseEnter={() => setActivePointIndex(index)}
                        onMouseLeave={() => setActivePointIndex(null)}
                        className="cursor-pointer transition-all"
                    />
                ))}
            </g>
        </svg>

        {/* Tooltip */}
        {activePointIndex !== null && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-brand-bg text-brand-text p-2 rounded-md shadow-lg text-center text-xs border border-brand-surface pointer-events-none">
                <p className="font-bold">Intensity: {data[activePointIndex].intensity}</p>
                <p>{data[activePointIndex].chunk}</p>
            </div>
        )}
    </div>
  );
};

export default PacingChart;
