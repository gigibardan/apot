export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order_index: number;
  posts_count: number;
  moderator_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string;
  status: 'active' | 'deleted' | 'spam';
  pinned: boolean;
  locked: boolean;
  views_count: number;
  replies_count: number;
  upvotes_count: number;
  downvotes_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  // Relations
  category?: ForumCategory;
  author?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  user_vote?: 'upvote' | 'downvote' | null;
}

export interface ForumReply {
  id: string;
  post_id: string;
  parent_reply_id: string | null;
  user_id: string;
  content: string;
  depth: number;
  status: 'active' | 'deleted' | 'spam';
  upvotes_count: number;
  downvotes_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  author?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  user_vote?: 'upvote' | 'downvote' | null;
  replies?: ForumReply[];
}

export interface ForumVote {
  id: string;
  user_id: string;
  post_id: string | null;
  reply_id: string | null;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface ForumReport {
  id: string;
  reporter_id: string;
  post_id: string | null;
  reply_id: string | null;
  reason: string;
  description: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}
