import type { User, Video, Comment, Hashtag, Notification } from "@prisma/client";

// Extended types with relations
export type VideoWithAuthor = Video & {
  author: Pick<User, "id" | "name" | "username" | "image" | "isVerified">;
  _count?: { likes: number; comments: number; views: number };
  isLiked?: boolean;
  isFollowing?: boolean;
};

export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "name" | "username" | "image" | "isVerified">;
  replies?: CommentWithAuthor[];
  _count?: { replies: number };
};

export type UserProfile = User & {
  _count: {
    videos: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
};

export type NotificationWithRelations = Notification & {
  sender?: Pick<User, "id" | "name" | "username" | "image"> | null;
  video?: Pick<Video, "id" | "thumbnailUrl" | "title"> | null;
};

export type HashtagWithCount = Hashtag & {
  _count: { videos: number };
};

// API response types
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
};

// Feed algorithm type
export type FeedType = "for-you" | "following" | "trending" | "new";

// Upload types
export type UploadProgress = {
  progress: number;
  status: "idle" | "uploading" | "processing" | "done" | "error";
  url?: string;
  error?: string;
};
