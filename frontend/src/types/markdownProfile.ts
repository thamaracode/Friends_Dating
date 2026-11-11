export type MarkdownVisibility = 'public' | 'matches' | 'friends' | 'selected' | 'private';

export interface ProfileMarkdown {
  id: string;
  user_id: string;
  title: string;
  content: string;
  visibility: MarkdownVisibility;
  created_at: number;
  updated_at: number;
  characterCount?: number;
  remainingCharacters?: number;
}
