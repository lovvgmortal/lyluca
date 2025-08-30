

export interface YouTubeStats {
    title: string;
    views: number;
    likes: number;
    comments: number;
    thumbnailUrl: string;
}

const YOUTUBE_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export const parseVideoId = (url: string): string | null => {
    const match = url.match(YOUTUBE_URL_REGEX);
    return match ? match[1] : null;
};

export const fetchYouTubeStats = async (videoId: string, apiKey: string): Promise<YouTubeStats> => {
    if (!apiKey) {
        throw new Error('YouTube API Key is not configured. Please set it in the settings.');
    }

    const API_URL = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${apiKey}`;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
            throw new Error(errorData.error?.message || `Failed to fetch data from YouTube API (${response.status})`);
        }
        
        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found or no statistics available.');
        }

        const item = data.items[0];
        const stats = item.statistics;
        const snippet = item.snippet;

        return {
            title: snippet.title || '',
            views: parseInt(stats.viewCount || '0', 10),
            likes: parseInt(stats.likeCount || '0', 10),
            comments: parseInt(stats.commentCount || '0', 10),
            thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        };
    } catch (error) {
        console.error("YouTube API fetch error:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred while fetching YouTube stats.");
    }
};


export const fetchYouTubeStatsInBatch = async (videoIds: string[], apiKey: string): Promise<Map<string, YouTubeStats>> => {
    if (!apiKey) {
        throw new Error('YouTube API Key is not configured.');
    }
    if (videoIds.length === 0) {
        return new Map();
    }

    const statsMap = new Map<string, YouTubeStats>();
    const CHUNK_SIZE = 50;

    for (let i = 0; i < videoIds.length; i += CHUNK_SIZE) {
        const chunk = videoIds.slice(i, i + CHUNK_SIZE);
        const API_URL = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${chunk.join(',')}&key=${apiKey}`;

        try {
            const response = await fetch(API_URL);
             if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
                console.error(`Batch fetch failed for chunk ${i/CHUNK_SIZE + 1}:`, errorData.error?.message);
                continue; // Skip to the next chunk on error
            }

            const data = await response.json();
            if (data.items && data.items.length > 0) {
                for (const item of data.items) {
                    const stats = item.statistics;
                    const snippet = item.snippet;
                    statsMap.set(item.id, {
                        title: snippet.title || '',
                        views: parseInt(stats.viewCount || '0', 10),
                        likes: parseInt(stats.likeCount || '0', 10),
                        comments: parseInt(stats.commentCount || '0', 10),
                        thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
                    });
                }
            }
        } catch (error) {
            console.error(`An unexpected error occurred during batch fetch for chunk ${i/CHUNK_SIZE + 1}:`, error);
            // Continue to next chunk even if one fails
        }
    }

    return statsMap;
};