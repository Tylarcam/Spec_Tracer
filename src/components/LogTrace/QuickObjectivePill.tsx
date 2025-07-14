import React from 'react';

interface QuickObjectivePillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  selected: boolean;
  tooltip?: string;
}

export const QuickObjectivePill: React.FC<QuickObjectivePillProps> = ({
  label,
  selected,
  tooltip,
  ...rest
}) => {
  const tooltipId = tooltip ? `tooltip-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined;
  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={`group relative px-4 py-2 mx-1 my-1 rounded-full text-base font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 select-none
          ${selected ? 'bg-cyan-200/80 text-cyan-900 shadow-lg ring-2 ring-cyan-400' : 'bg-white/20 text-cyan-200 hover:bg-cyan-300/30 hover:text-cyan-900 shadow'}
          backdrop-blur-md border border-cyan-100/20`}
        aria-pressed={selected}
        aria-label={label}
        aria-describedby={tooltipId}
        {...rest}
      >
        {label}
      </button>
      {tooltip && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-slate-900 text-xs text-cyan-200 shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none z-50 whitespace-nowrap"
        >
          {tooltip}
        </span>
      )}
    </div>
  );
};

export default QuickObjectivePill; 