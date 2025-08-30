import React, { useMemo, useState } from 'react';
import { useScripts } from '../contexts/ScriptsContext';
import { useUsers } from '../contexts/UsersContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchYouTubeStatsInBatch } from '../services/youtubeService';
import { Icon } from './Icon';
import Spinner from './Spinner';
import type { Script } from '../types';

const StatCard: React.FC<{ icon: React.ComponentProps<typeof Icon>['name']; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-brand-bg p-4 rounded-lg flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
            <Icon name={icon} className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-sm text-brand-text-secondary">{title}</p>
            <p className="text-xl font-bold text-brand-text">{value}</p>
        </div>
    </div>
);


type SortKey = 'publishedAt' | 'youtubeViews' | 'youtubeLikes' | 'youtubeComments';
type SortDirection = 'ascending' | 'descending';

interface VideoPerformanceDashboardProps {
    filterYear: string;
    filterMonth: string;
}

export const VideoPerformanceDashboard: React.FC<VideoPerformanceDashboardProps> = ({ filterYear, filterMonth }) => {
    const { scripts, updateScript, loading: scriptsLoading } = useScripts();
    const { getUserById, loading: usersLoading } = useUsers();
    const { profile, role } = useAuth();
    const { showToast } = useToast();
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'publishedAt', direction: 'descending' });
    const [isUpdating, setIsUpdating] = useState(false);

    const publishedVideos = useMemo(() => {
        const published = scripts.filter(s => s.status === 'published' && s.youtubeLink && s.youtubeTitle !== undefined);
        
        if (filterYear === 'all' && filterMonth === 'all') {
            return published;
        }

        return published.filter(script => {
            if (!script.publishedAt) return false;
            const date = new Date(script.publishedAt);
            if (isNaN(date.getTime())) return false;

            const yearMatch = filterYear === 'all' || date.getFullYear() === parseInt(filterYear, 10);
            const monthMatch = filterMonth === 'all' || (date.getMonth() + 1) === parseInt(filterMonth, 10);

            return yearMatch && monthMatch;
        });
    }, [scripts, filterYear, filterMonth]);
    
    const handleUpdateAllStats = async () => {
        if (!profile?.youtube_api_key) {
            showToast("YouTube API Key is not configured in Settings.");
            return;
        }
        setIsUpdating(true);
        try {
            const videoIdsToUpdate = publishedVideos.map(s => s.youtubeLink!).map(link => new URL(link).searchParams.get('v')).filter(Boolean) as string[];

            if (videoIdsToUpdate.length === 0) {
                showToast("No videos to update.");
                setIsUpdating(false);
                return;
            }

            const newStatsMap = await fetchYouTubeStatsInBatch(videoIdsToUpdate, profile.youtube_api_key);

            let updatedCount = 0;
            const updatePromises = publishedVideos.map(async (script) => {
                const videoId = new URL(script.youtubeLink!).searchParams.get('v');
                if (videoId && newStatsMap.has(videoId)) {
                    const newStats = newStatsMap.get(videoId)!;
                    await updateScript(script.id, {
                        youtubeTitle: newStats.title,
                        youtubeViews: newStats.views,
                        youtubeLikes: newStats.likes,
                        youtubeComments: newStats.comments,
                        youtubeThumbnailUrl: newStats.thumbnailUrl,
                        youtubeStatsLastUpdated: new Date().toISOString(),
                    });
                    updatedCount++;
                }
            });

            await Promise.all(updatePromises);
            showToast(`Successfully updated stats for ${updatedCount} videos.`);

        } catch (error) {
            const err = error as Error;
            showToast(`Failed to update stats: ${err.message}`);
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const overviewStats = useMemo(() => {
        const totalViews = publishedVideos.reduce((acc, s) => acc + (s.youtubeViews || 0), 0);
        const videoCount = publishedVideos.length;
        return {
            totalVideos: videoCount,
            totalViews: totalViews,
            avgViews: videoCount > 0 ? Math.round(totalViews / videoCount) : 0,
            totalLikes: publishedVideos.reduce((acc, s) => acc + (s.youtubeLikes || 0), 0),
        };
    }, [publishedVideos]);

    const sortedVideos = useMemo(() => {
        let sortableItems = [...publishedVideos];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key as keyof Script] ?? 0;
                const valB = b[sortConfig.key as keyof Script] ?? 0;

                if (sortConfig.key === 'publishedAt') {
                     // Handle null or invalid dates
                    const timeA = valA ? new Date(valA as string).getTime() : 0;
                    const timeB = valB ? new Date(valB as string).getTime() : 0;
                    return (timeB - timeA) * (sortConfig.direction === 'ascending' ? -1 : 1);
                }

                if ((valA as number) < (valB as number)) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if ((valA as number) > (valB as number)) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [publishedVideos, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'descending';
        if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'descending' ? ' ▼' : ' ▲';
    };

    const isLoading = scriptsLoading || usersLoading;

    if (isLoading && publishedVideos.length === 0) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    if (publishedVideos.length === 0) {
        return (
             <div className="text-center h-full flex flex-col justify-center items-center">
                <Icon name="youtube" className="mx-auto w-16 h-16 text-brand-text-secondary mb-4" />
                <h2 className="text-2xl font-semibold text-brand-text">No Published Videos</h2>
                <p className="text-brand-text-secondary mt-2">
                  No videos match the current filter. Try adjusting the date range or publish new videos.
                </p>
              </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards & Update Button */}
            <div className="flex justify-between items-start">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow">
                    <StatCard icon="play-circle" title="Total Videos" value={overviewStats.totalVideos.toLocaleString()} color="bg-blue-500"/>
                    <StatCard icon="trending-up" title="Total Views" value={overviewStats.totalViews.toLocaleString()} color="bg-green-500"/>
                    <StatCard icon="trending-up" title="Avg. Views / Video" value={overviewStats.avgViews.toLocaleString()} color="bg-purple-500"/>
                    <StatCard icon="check-circle" title="Total Likes" value={overviewStats.totalLikes.toLocaleString()} color="bg-red-500"/>
                </div>
                {role === 'admin' && (
                    <button 
                        onClick={handleUpdateAllStats} 
                        disabled={isUpdating}
                        className="ml-4 flex-shrink-0 flex items-center justify-center gap-2 bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isUpdating ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin"></div> : <Icon name="sparkles" className="w-4 h-4" />}
                        {isUpdating ? 'Updating...' : 'Update Filtered Stats'}
                    </button>
                )}
            </div>

            {/* Video Table */}
            <div className="bg-brand-bg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-brand-text-secondary">
                        <thead className="text-xs text-brand-text uppercase bg-brand-surface">
                            <tr>
                                <th scope="col" className="px-4 py-3 w-16">Thumbnail</th>
                                <th scope="col" className="px-6 py-3">Video / Project</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('publishedAt')}>Published{getSortIndicator('publishedAt')}</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer text-center" onClick={() => requestSort('youtubeViews')}>Views{getSortIndicator('youtubeViews')}</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer text-center" onClick={() => requestSort('youtubeLikes')}>Likes{getSortIndicator('youtubeLikes')}</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer text-center" onClick={() => requestSort('youtubeComments')}>Comments{getSortIndicator('youtubeComments')}</th>
                                <th scope="col" className="px-6 py-3">Team</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedVideos.map(script => {
                                const creator = script.contentCreatorId ? getUserById(script.contentCreatorId) : null;
                                const editor = script.editorId ? getUserById(script.editorId) : null;
                                return (
                                    <tr key={script.id} className="border-t border-brand-surface hover:bg-brand-surface/50">
                                        <td className="px-4 py-2">
                                            {script.youtubeThumbnailUrl && (
                                                <img src={script.youtubeThumbnailUrl} alt={`Thumbnail for ${script.title}`} className="w-24 h-14 object-cover rounded-md" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-brand-text whitespace-nowrap">
                                            <a href={script.youtubeLink!} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold" title={script.youtubeTitle || script.title}>
                                                {script.youtubeTitle || script.title}
                                            </a>
                                            <p className="text-xs text-brand-text-secondary mt-1">
                                                Project: {script.title}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">{script.publishedAt ? new Date(script.publishedAt).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 text-center">{script.youtubeViews?.toLocaleString() ?? 'N/A'}</td>
                                        <td className="px-6 py-4 text-center">{script.youtubeLikes?.toLocaleString() ?? 'N/A'}</td>
                                        <td className="px-6 py-4 text-center">{script.youtubeComments?.toLocaleString() ?? 'N/A'}</td>
                                        <td className="px-6 py-4 text-xs">
                                            <div>C: {creator?.fullName ?? 'N/A'}</div>
                                            <div>E: {editor?.fullName ?? 'N/A'}</div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};