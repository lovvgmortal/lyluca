

export interface Chapter {
  time: string;
  description: string;
}

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  parent_id: string | null;
}

export interface ScriptChunk {
  content: string;
  keyword: string;
}

export interface PacingPoint {
  chunk: string;
  intensity: number;
}

export interface Script {
  id: string;
  title: string; // This is the Project Name
  aiTitle?: string; // This is the AI-generated title
  summary: string;
  script: string;
  timeline: Chapter[];
  createdAt: string;
  folderId?: string | null;
  splitScript?: ScriptChunk[];
  pacing?: PacingPoint[];
  note?: string;
  createdBy?: string;

  // New fields for editor state restoration
  mode?: 'generate' | 'rewrite' | 'keyword' | 'note';
  ideaPrompt?: string;
  generatedOutline?: string;
  scriptPrompt?: string;
  originalScript?: string;

  // New fields for work management
  status?: 'todo' | 'content_creation' | 'ready_for_edit' | 'editing' | 'ready_to_publish' | 'published';
  assignedTo?: string | null;
  lastModifiedBy?: string | null;
  
  // Detailed performance tracking fields
  contentCreatorId?: string | null;
  editorId?: string | null;
  contentAssignedAt?: string | null;
  contentCompletedAt?: string | null;
  editAssignedAt?: string | null;
  editCompletedAt?: string | null;
  publishedAt?: string | null;
  youtubeLink?: string | null;

  // New fields for YouTube performance
  youtubeTitle?: string | null;
  youtubeViews?: number | null;
  youtubeLikes?: number | null;
  youtubeComments?: number | null;
  youtubeStatsLastUpdated?: string | null;
  youtubeThumbnailUrl?: string | null;
}

export interface Toast {
  id: string;
  message: string;
}

export interface RewriteStyle {
  id: string;
  name: string;
  prompt: string;
}

export interface KeywordStyle {
  id: string;
  name: string;
  prompt: string;
}

export type UserRole = "admin" | "manager" | "content_creator" | "editor";

export interface SimpleProfile {
  id: string;
  role: UserRole | null;
  fullName: string | null;
  email: string | null;
}