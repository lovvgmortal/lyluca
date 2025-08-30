import React, { useMemo } from 'react';
import type { Script } from '../types';
import { WorkCard } from './WorkCard';
import type { GroupBy } from './Work';

interface WorkColumnProps {
  title: string;
  scripts: Script[];
  groupBy: GroupBy;
}

const getGroupKey = (dateStr: string, groupBy: 'week' | 'month' | 'year'): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  if (groupBy === 'year') {
    return date.getFullYear().toString();
  }
  if (groupBy === 'month') {
    return date.toISOString().slice(0, 7); // YYYY-MM
  }
  if (groupBy === 'week') {
    const firstDay = new Date(date.setDate(date.getDate() - date.getDay()));
    return firstDay.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  return '';
};

const formatGroupKey = (key: string, groupBy: 'week' | 'month' | 'year'): string => {
  if (key === 'Invalid Date') return key;
  if (groupBy === 'year') return key;
  if (groupBy === 'month') {
    const [year, month] = key.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }
  if (groupBy === 'week') {
    const startDate = new Date(key);
    return `Week of ${startDate.toLocaleDateString()}`;
  }
  return '';
};

export const WorkColumn: React.FC<WorkColumnProps> = ({ title, scripts, groupBy }) => {

  const groupedScripts = useMemo(() => {
    if (groupBy === 'none') return null;

    const groups: { [key: string]: Script[] } = {};
    scripts.forEach(script => {
        const key = getGroupKey(script.createdAt, groupBy);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(script);
    });
    
    // Sort groups by key descending (newest first)
    const sortedGroupKeys = Object.keys(groups).sort().reverse();
    const sortedGroups: { [key: string]: Script[] } = {};
    sortedGroupKeys.forEach(key => {
        sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [scripts, groupBy]);

  const countColor = () => {
    switch (title) {
      case 'To Do':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'Content Creation':
        return 'bg-purple-500/20 text-purple-500';
      case 'Ready for Edit':
        return 'bg-blue-500/20 text-blue-500';
      case 'Editing':
        return 'bg-orange-500/20 text-orange-500';
      case 'Ready to Publish':
        return 'bg-teal-500/20 text-teal-500';
      case 'Published':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-brand-bg text-brand-text-secondary';
    }
  };

  const renderContent = () => {
    if (scripts.length === 0) {
      return (
        <div className="text-center text-sm text-brand-text-secondary py-4">
          No tasks in this column.
        </div>
      );
    }

    if (groupBy === 'none' || !groupedScripts) {
      return scripts.map(script => <WorkCard key={script.id} script={script} />);
    }

    return Object.entries(groupedScripts).map(([groupKey, groupScripts]) => (
      <details key={groupKey} className="mb-1" open>
        <summary className="list-none cursor-pointer p-1 rounded-md hover:bg-brand-surface">
            <h4 className="text-xs font-bold uppercase text-brand-text-secondary flex items-center justify-between">
              {formatGroupKey(groupKey, groupBy)}
              <span className={`text-xs font-medium rounded-full px-1.5 py-0.5 ${countColor()}`}>
                {groupScripts.length}
              </span>
            </h4>
        </summary>
        <div className="space-y-3 mt-2 pl-1 border-l-2 border-brand-surface">
          {groupScripts.map(script => <WorkCard key={script.id} script={script} />)}
        </div>
      </details>
    ));
  };

  return (
    <div className="bg-brand-bg rounded-lg flex flex-col h-full min-h-0">
      <div className="p-3 flex justify-between items-center flex-shrink-0 border-b border-brand-surface">
        <h3 className="font-semibold text-brand-text">{title}</h3>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${countColor()}`}>
          {scripts.length}
        </span>
      </div>
      <div className="p-3 space-y-3 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
