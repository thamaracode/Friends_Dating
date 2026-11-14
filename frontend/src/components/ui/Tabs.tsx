import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface TabsContextValue {
  selectedTab: string;
  selectTab: (id: string) => void;
  variant: 'pills' | 'underline';
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  variant = 'pills',
  className = '',
  children
}) => {
  const [internalTab, setInternalTab] = useState(defaultValue || '');
  const activeTab = value !== undefined ? value : internalTab;

  const selectTab = (id: string) => {
    if (value === undefined) {
      setInternalTab(id);
    }
    onValueChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ selectedTab: activeTab, selectTab, variant }}>
      <div className={`space-y-4 ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  ariaLabel: string;
}

export const TabList: React.FC<TabListProps> = ({
  ariaLabel,
  className = '',
  children,
  ...props
}) => {
  const context = useContext(TabsContext);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!containerRef.current) return;
    const tabs = Array.from(containerRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    const currentIndex = tabs.findIndex(t => t === document.activeElement);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      tabs[nextIndex]?.focus();
      tabs[nextIndex]?.click();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      tabs[prevIndex]?.focus();
      tabs[prevIndex]?.click();
    } else if (e.key === 'Home') {
      e.preventDefault();
      tabs[0]?.focus();
      tabs[0]?.click();
    } else if (e.key === 'End') {
      e.preventDefault();
      tabs[tabs.length - 1]?.focus();
      tabs[tabs.length - 1]?.click();
    }
  };

  const variantStyles = context?.variant === 'underline'
    ? 'border-b border-white/10 gap-4'
    : 'p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl gap-1';

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={`flex items-center overflow-x-auto no-scrollbar ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({
  value,
  badge,
  icon,
  className = '',
  children,
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const isSelected = context.selectedTab === value;

  const pillStyles = isSelected
    ? 'bg-white/15 text-white shadow-sm font-semibold border border-white/15'
    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent';

  const underlineStyles = isSelected
    ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
    : 'text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent';

  return (
    <button
      role="tab"
      id={`tab-${value}`}
      aria-selected={isSelected}
      aria-controls={`panel-${value}`}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => context.selectTab(value)}
      className={`relative inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 motion-reduce:transition-none ${
        context.variant === 'underline' ? underlineStyles : pillStyles
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300">
          {badge}
        </span>
      )}
    </button>
  );
};

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  className = '',
  children,
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');

  if (context.selectedTab !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={`focus-visible:outline-none animate-fadeIn ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
