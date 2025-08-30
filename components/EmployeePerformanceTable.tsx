import React, { useMemo, useState } from 'react';
import { useScripts } from '../contexts/ScriptsContext';
import { useUsers } from '../contexts/UsersContext';
import Spinner from './Spinner';
import { Icon } from './Icon';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { UserRole } from '../types';

interface EmployeePerformanceTableProps {
  filterYear: string;
  filterMonth: string;
}

const formatDuration = (ms: number | null): string => {
    if (ms === null || ms < 0) return '—';
    
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    hours = hours % 24;
    minutes = minutes % 60;
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return '< 1m';
}

const getHeatmapColor = (value: number | null, min: number, max: number, reverse: boolean = false): string => {
    if (value === null || min === max) return 'bg-transparent';
    const percent = (value - min) / (max - min);
    const adjustedPercent = reverse ? 1 - percent : percent;

    if (adjustedPercent > 0.8) return 'bg-green-500/30';
    if (adjustedPercent > 0.6) return 'bg-green-500/20';
    if (adjustedPercent > 0.4) return 'bg-yellow-500/20';
    if (adjustedPercent > 0.2) return 'bg-orange-500/20';
    return 'bg-red-500/20';
};

export const EmployeePerformanceTable: React.FC<EmployeePerformanceTableProps> = ({ filterYear, filterMonth }) => {
    const { scripts, loading: scriptsLoading } = useScripts();
    const { users, loading: usersLoading, updateUserRole } = useUsers();
    const { user, role: currentUserRole } = useAuth();
    const { showToast } = useToast();

    const filteredScripts = useMemo(() => {
        if (filterYear === 'all' && filterMonth === 'all') {
            return scripts;
        }
        return scripts.filter(script => {
            const checkDate = (dateStr: string | null | undefined): boolean => {
                if (!dateStr) return false;
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return false;

                const yearMatch = filterYear === 'all' || date.getFullYear() === parseInt(filterYear, 10);
                const monthMatch = filterMonth === 'all' || (date.getMonth() + 1) === parseInt(filterMonth, 10);
                
                return yearMatch && monthMatch;
            };

            // A task is considered "in the period" if it was completed within that period.
            return checkDate(script.contentCompletedAt) || checkDate(script.editCompletedAt);
        });
    }, [scripts, filterYear, filterMonth]);


    const overviewStats = useMemo(() => {
        if (!filteredScripts) return { todo: 0, inProgress: 0, published: 0, total: 0 };
        return {
            todo: filteredScripts.filter(s => s.status === 'todo' || !s.status).length,
            inProgress: filteredScripts.filter(s => s.status === 'content_creation' || s.status === 'editing').length,
            published: filteredScripts.filter(s => s.status === 'published').length,
            total: filteredScripts.length
        }
    }, [filteredScripts]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (userId === user?.id) {
            showToast("You cannot change your own role.");
            return;
        }

        try {
            await updateUserRole(userId, newRole);
            showToast("User role updated successfully.");
        } catch (err) {
            showToast("Failed to update user role.");
            console.error(err);
        }
    };

    const employeeStats = useMemo(() => {
        const employees = users.filter(u => u.role !== 'admin');
        if (employees.length === 0) return [];

        const statsMap = new Map<string, {
            completedContentTasks: number;
            totalContentDurationMs: number;
            completedEditTasks: number;
            totalEditDurationMs: number;
            publishedVideoIds: Set<string>;
        }>();

        employees.forEach(emp => {
            statsMap.set(emp.id, {
                completedContentTasks: 0,
                totalContentDurationMs: 0,
                completedEditTasks: 0,
                totalEditDurationMs: 0,
                publishedVideoIds: new Set(),
            });
        });

        filteredScripts.forEach(script => {
            if (script.contentCreatorId && script.contentAssignedAt && script.contentCompletedAt) {
                const stats = statsMap.get(script.contentCreatorId);
                if (stats) {
                    const start = new Date(script.contentAssignedAt).getTime();
                    const end = new Date(script.contentCompletedAt).getTime();
                    stats.completedContentTasks += 1;
                    stats.totalContentDurationMs += (end - start);
                    if (script.status === 'published') {
                        stats.publishedVideoIds.add(script.id);
                    }
                }
            }
            if (script.editorId && script.editAssignedAt && script.editCompletedAt) {
                const stats = statsMap.get(script.editorId);
                if (stats) {
                    const start = new Date(script.editAssignedAt).getTime();
                    const end = new Date(script.editCompletedAt).getTime();
                    stats.completedEditTasks += 1;
                    stats.totalEditDurationMs += (end - start);
                    if (script.status === 'published') {
                        stats.publishedVideoIds.add(script.id);
                    }
                }
            }
        });

        const scriptMap = new Map(scripts.map(s => [s.id, s]));

        const processedStats = employees.map(employee => {
            const stats = statsMap.get(employee.id)!;
            const totalTasks = stats.completedContentTasks + stats.completedEditTasks;
            const totalViews = Array.from(stats.publishedVideoIds).reduce((acc, scriptId) => acc + (scriptMap.get(scriptId)?.youtubeViews || 0), 0);
            
            const avgContentTimeMs = stats.completedContentTasks > 0 ? stats.totalContentDurationMs / stats.completedContentTasks : null;
            const avgEditTimeMs = stats.completedEditTasks > 0 ? stats.totalEditDurationMs / stats.completedEditTasks : null;

            return {
                ...employee,
                completedTasks: totalTasks,
                avgContentTimeMs,
                avgEditTimeMs,
                totalViews,
            };
        });

        const metrics = {
            completedTasks: processedStats.map(s => s.completedTasks),
            avgContentTimeMs: processedStats.map(s => s.avgContentTimeMs).filter(v => v !== null) as number[],
            avgEditTimeMs: processedStats.map(s => s.avgEditTimeMs).filter(v => v !== null) as number[],
            totalViews: processedStats.map(s => s.totalViews),
        };
        
        const getMinMax = (arr: number[]) => {
            if (arr.length === 0) return { min: 0, max: 0 };
            return { min: Math.min(...arr), max: Math.max(...arr) };
        };

        const minMax = {
            completedTasks: getMinMax(metrics.completedTasks),
            avgContentTimeMs: getMinMax(metrics.avgContentTimeMs),
            avgEditTimeMs: getMinMax(metrics.avgEditTimeMs),
            totalViews: getMinMax(metrics.totalViews),
        };

        return processedStats.map(employee => ({
            ...employee,
            completedTasksColor: getHeatmapColor(employee.completedTasks, minMax.completedTasks.min, minMax.completedTasks.max),
            avgContentTimeColor: employee.avgContentTimeMs === null ? '' : getHeatmapColor(employee.avgContentTimeMs, minMax.avgContentTimeMs.min, minMax.avgContentTimeMs.max, true),
            avgEditTimeColor: employee.avgEditTimeMs === null ? '' : getHeatmapColor(employee.avgEditTimeMs, minMax.avgEditTimeMs.min, minMax.avgEditTimeMs.max, true),
            totalViewsColor: getHeatmapColor(employee.totalViews, minMax.totalViews.min, minMax.totalViews.max),
        })).sort((a, b) => b.completedTasks - a.completedTasks);

    }, [filteredScripts, users, scripts]);


    const isLoading = scriptsLoading || usersLoading;

    if (isLoading && scripts.length === 0) {
        return (
            <div className="bg-brand-surface rounded-lg shadow-md p-4 flex justify-center">
                <Spinner />
            </div>
        );
    }
    
    return (
        <div className="bg-brand-surface rounded-lg shadow-md">
             <div className="p-4 border-b border-brand-bg">
                <h3 className="text-lg font-semibold text-brand-text mb-4">Work Overview</h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-text-secondary">
                    <div className="flex items-center gap-2" title="Total Scripts">
                        <Icon name="book" className="w-4 h-4 text-blue-500" />
                        <span>Total: <strong className="text-brand-text font-bold">{overviewStats.total}</strong></span>
                    </div>
                    <div className="flex items-center gap-2" title="Scripts To Do">
                        <Icon name="clipboard-list" className="w-4 h-4 text-yellow-500" />
                        <span>To Do: <strong className="text-brand-text font-bold">{overviewStats.todo}</strong></span>
                    </div>
                    <div className="flex items-center gap-2" title="Scripts In Progress">
                        <Icon name="compass" className="w-4 h-4 text-purple-500" />
                        <span>In Progress: <strong className="text-brand-text font-bold">{overviewStats.inProgress}</strong></span>
                    </div>
                    <div className="flex items-center gap-2" title="Published Scripts">
                        <Icon name="check-circle" className="w-4 h-4 text-green-500" />
                        <span>Published: <strong className="text-brand-text font-bold">{overviewStats.published}</strong></span>
                    </div>
                </div>
            </div>
            <div className="p-4">
                 <h4 className="text-md font-semibold text-brand-text mb-3">Employee Performance</h4>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-brand-text-secondary">
                        <thead className="text-xs text-brand-text uppercase bg-brand-bg">
                            <tr>
                                <th scope="col" className="px-6 py-3">Employee</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3 text-center">Tasks Done</th>
                                <th scope="col" className="px-6 py-3 text-center">Avg. Content Time</th>
                                <th scope="col" className="px-6 py-3 text-center">Avg. Edit Time</th>
                                <th scope="col" className="px-6 py-3 text-center">Total Views</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeStats.length > 0 ? (
                                employeeStats.map(employee => (
                                    <tr key={employee.id} className="border-b border-brand-bg last:border-b-0 hover:bg-brand-bg/50">
                                        <td className="px-6 py-4 font-medium text-brand-text whitespace-nowrap">{employee.fullName || employee.email}</td>
                                        <td className="px-6 py-4 capitalize">
                                            {currentUserRole === 'admin' ? (
                                                employee.role === 'admin' ? (
                                                    <span className="capitalize">{employee.role?.replace('_', ' ')}</span>
                                                ) : (
                                                    <select
                                                        value={employee.role || ''}
                                                        onChange={(e) => handleRoleChange(employee.id, e.target.value as UserRole)}
                                                        className="w-full bg-brand-bg border border-brand-surface rounded-md p-1.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="Change user role"
                                                    >
                                                        <option value="content_creator">Content Creator</option>
                                                        <option value="editor">Editor</option>
                                                        <option value="manager">Manager</option>
                                                    </select>
                                                )
                                            ) : (
                                                <span className="capitalize">{employee.role?.replace('_', ' ')}</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-center font-semibold ${employee.completedTasksColor}`}>
                                            {employee.completedTasks}
                                        </td>
                                        <td className={`px-6 py-4 text-center font-semibold ${employee.avgContentTimeColor}`}>
                                            {formatDuration(employee.avgContentTimeMs)}
                                        </td>
                                        <td className={`px-6 py-4 text-center font-semibold ${employee.avgEditTimeColor}`}>
                                            {formatDuration(employee.avgEditTimeMs)}
                                        </td>
                                        <td className={`px-6 py-4 text-center font-semibold ${employee.totalViewsColor}`}>
                                            {employee.totalViews.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center px-6 py-8 text-brand-text-secondary">
                                        No employees to display.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};