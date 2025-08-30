import React, { useMemo, useState } from 'react';
import { useScripts } from '../contexts/ScriptsContext';
import { WorkColumn } from './WorkColumn';
import Spinner from './Spinner';
import { Icon } from './Icon';
import { useAuth } from '../contexts/AuthContext';
import { EmployeePerformanceTable } from './EmployeePerformanceTable';
import { VideoPerformanceDashboard } from './VideoPerformanceDashboard';

type ActiveTab = 'board' | 'performance';
type PerformanceTab = 'turnaround' | 'video';
export type GroupBy = 'none' | 'month' | 'year';

export const Work: React.FC = () => {
  const { scripts, loading } = useScripts();
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('board');
  const [performanceTab, setPerformanceTab] = useState<PerformanceTab>('turnaround');
  const [filterYear, setFilterYear] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  const canViewPerformance = role === 'admin';

  const workScripts = useMemo(() => {
    return scripts.filter(s => !!s.status);
  }, [scripts]);

  const availableYearsForBoard = useMemo(() => {
    const years = new Set<number>();
    workScripts.forEach(s => {
        if (s.createdAt) years.add(new Date(s.createdAt).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [workScripts]);

  const availableYearsForPerformance = useMemo(() => {
    const years = new Set<number>();
    scripts.forEach(s => {
        if (s.publishedAt) years.add(new Date(s.publishedAt).getFullYear());
        if (s.contentCompletedAt) years.add(new Date(s.contentCompletedAt).getFullYear());
        if (s.editCompletedAt) years.add(new Date(s.editCompletedAt).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [scripts]);
  
  const dateFilteredWorkScripts = useMemo(() => {
    if (filterYear === 'all' && filterMonth === 'all') {
        return workScripts;
    }
    return workScripts.filter(script => {
        const date = new Date(script.createdAt);
        if (isNaN(date.getTime())) return false;

        const yearMatch = filterYear === 'all' || date.getFullYear() === parseInt(filterYear, 10);
        const monthMatch = filterMonth === 'all' || (date.getMonth() + 1) === parseInt(filterMonth, 10);
        
        return yearMatch && monthMatch;
    });
  }, [workScripts, filterYear, filterMonth]);

  const filteredScripts = useMemo(() => {
    if (!searchTerm) return dateFilteredWorkScripts;
    const lowercasedTerm = searchTerm.toLowerCase();
    return dateFilteredWorkScripts.filter(s => 
      s.title.toLowerCase().includes(lowercasedTerm)
    );
  }, [dateFilteredWorkScripts, searchTerm]);
  
  const { todoScripts, contentCreationScripts, readyForEditScripts, editingScripts, readyToPublishScripts, publishedScripts } = useMemo(() => {
    const todo = filteredScripts.filter(s => s.status === 'todo');
    const contentCreation = filteredScripts.filter(s => s.status === 'content_creation');
    const readyForEdit = filteredScripts.filter(s => s.status === 'ready_for_edit');
    const editing = filteredScripts.filter(s => s.status === 'editing');
    const readyToPublish = filteredScripts.filter(s => s.status === 'ready_to_publish');
    const published = filteredScripts.filter(s => s.status === 'published');
    return { 
      todoScripts: todo, 
      contentCreationScripts: contentCreation,
      readyForEditScripts: readyForEdit,
      editingScripts: editing,
      readyToPublishScripts: readyToPublish,
      publishedScripts: published 
    };
  }, [filteredScripts]);

  const groupByMode: GroupBy = useMemo(() => {
    if (filterYear !== 'all' && filterMonth === 'all') {
      return 'month';
    }
    if (filterYear === 'all' && filterMonth === 'all') {
      return 'year';
    }
    if (filterYear === 'all' && filterMonth !== 'all') {
        return 'year';
    }
    return 'none';
  }, [filterYear, filterMonth]);


  if (loading && scripts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const tabClass = (tabName: ActiveTab) => 
    `px-1 py-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors ${
      activeTab === tabName 
      ? 'border-brand-primary text-brand-text' 
      : 'border-transparent text-brand-text-secondary hover:text-brand-text'
    }`;
  
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('default', { month: 'long' }),
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-4.5rem)] flex flex-col">
       {/* Tab Navigation */}
       <div className="border-b border-brand-surface flex-shrink-0 mb-4">
          <nav className="flex gap-6" aria-label="Work Tabs">
              <button onClick={() => setActiveTab('board')} className={tabClass('board')}>
                <Icon name="briefcase" className="w-4 h-4" /> Task Board
              </button>
              {canViewPerformance && (
                <button onClick={() => setActiveTab('performance')} className={tabClass('performance')}>
                    <Icon name="trending-up" className="w-4 h-4" /> Performance
                </button>
              )}
          </nav>
       </div>

       {activeTab === 'board' && (
           <div className="flex flex-col flex-grow min-h-0">
                <div className="flex justify-between items-center flex-wrap gap-4 mb-4 flex-shrink-0">
                    <div className="relative flex-grow max-w-lg">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-brand-surface border border-brand-bg rounded-lg pl-10 pr-4 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)}
                            className="bg-brand-surface border border-brand-bg rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            <option value="all">All Months</option>
                            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <select
                            value={filterYear}
                            onChange={e => setFilterYear(e.target.value)}
                            className="bg-brand-surface border border-brand-bg rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            <option value="all">All Years</option>
                            {availableYearsForBoard.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-grow min-h-0">
                    <WorkColumn title="To Do" scripts={todoScripts} groupBy={groupByMode} />
                    <WorkColumn title="Content Creation" scripts={contentCreationScripts} groupBy={groupByMode} />
                    <WorkColumn title="Ready for Edit" scripts={readyForEditScripts} groupBy={groupByMode} />
                    <WorkColumn title="Editing" scripts={editingScripts} groupBy={groupByMode} />
                    <WorkColumn title="Ready to Publish" scripts={readyToPublishScripts} groupBy={groupByMode} />
                    <WorkColumn title="Published" scripts={publishedScripts} groupBy={groupByMode} />
                </div>
            </div>
       )}

       {activeTab === 'performance' && canViewPerformance && (
            <div className="flex flex-col flex-grow min-h-0">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4 flex-shrink-0">
                    <div className="flex items-center gap-4 border border-brand-bg p-1 rounded-lg">
                        <button 
                            onClick={() => setPerformanceTab('turnaround')} 
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${performanceTab === 'turnaround' ? 'bg-brand-primary text-brand-text-inverse' : 'text-brand-text-secondary hover:bg-brand-surface'}`}
                        >
                            Turnaround Times
                        </button>
                        <button 
                            onClick={() => setPerformanceTab('video')} 
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${performanceTab === 'video' ? 'bg-brand-primary text-brand-text-inverse' : 'text-brand-text-secondary hover:bg-brand-surface'}`}
                        >
                            Video Performance
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)}
                            className="bg-brand-surface border border-brand-bg rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            <option value="all">All Months</option>
                             {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <select
                            value={filterYear}
                            onChange={e => setFilterYear(e.target.value)}
                            className="bg-brand-surface border border-brand-bg rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            <option value="all">All Years</option>
                            {availableYearsForPerformance.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex-grow min-h-0 overflow-y-auto">
                    {performanceTab === 'turnaround' && <EmployeePerformanceTable filterYear={filterYear} filterMonth={filterMonth} />}
                    {performanceTab === 'video' && <VideoPerformanceDashboard filterYear={filterYear} filterMonth={filterMonth} />}
                </div>
            </div>
       )}
    </div>
  );
};
