"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "../feed.module.css";
import { toggleLike } from "../actions";
import CommentModal from "./CommentModal";

const POSTS_PER_PAGE = 25;

type Post = {
  id: string;
  content: string | null;
  type: string;
  mediaUrl: string | null;
  createdAt: Date;
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      displayName: string | null;
      username: string | null;
    };
  }>;
  likes: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      displayName: string | null;
      username: string | null;
    };
  }>;
};

type PostsListProps = {
  posts: Post[];
  isOwnFeed: boolean;
  targetUsername: string;
  canComment: boolean;
  currentUserId: string;
};

export default function PostsList({ posts, isOwnFeed, targetUsername, canComment, currentUserId }: PostsListProps) {
  // Show last 25 posts initially (oldest at top, so take from end)
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Calculate which posts to show - we want the most recent N posts
  // Posts are ordered ascending (oldest first), so we take from the end
  const totalPosts = posts.length;
  const startIndex = Math.max(0, totalPosts - visibleCount);
  const visiblePosts = posts.slice(startIndex);

  const hasMore = startIndex > 0;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount(prev => prev + POSTS_PER_PAGE);
    }
  }, [hasMore]);

  useEffect(() => {
    if (!hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadMore]);

  const formatDateLabel = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    if (day.getTime() === today.getTime()) return 'Today';
    if (day.getTime() === yesterday.getTime()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  let lastDateLabel = '';

  return (
    <>
      {/* Show "load more" trigger at the top for older posts */}
      {hasMore && (
        <div ref={loadMoreRef} className={styles.loadMoreContainer}>
          <button onClick={loadMore} className={styles.loadMoreBtn}>
            ↑ Show {Math.min(POSTS_PER_PAGE, startIndex)} older posts
          </button>
        </div>
      )}

      {visiblePosts.map((post) => {
        const dateLabel = formatDateLabel(post.createdAt);
        const showDivider = dateLabel !== lastDateLabel;
        lastDateLabel = dateLabel;
        const isLiked = post.likes.some(l => l.userId === currentUserId);
        const likeCount = post.likes.length;

        return (
          <React.Fragment key={post.id}>
            {showDivider && (
              <div className={styles.dateDivider}>
                <span className={styles.dateDividerLabel}>{dateLabel}</span>
              </div>
            )}
            <div className={`${styles.postRow} ${!isOwnFeed ? styles.postRowLeft : ''}`}>
              <div className={`${styles.postBubble} ${!isOwnFeed ? styles.postBubbleLeft : ''}`}>
                {post.content && <div style={{ marginBottom: post.mediaUrl ? '0.5rem' : '0' }}>{post.content}</div>}
                {post.mediaUrl && (
                  post.type === "IMAGE" ? (
                    <img src={post.mediaUrl} alt="Post media" style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }} />
                  ) : (
                    <video src={post.mediaUrl} controls style={{ maxWidth: '100%', borderRadius: '8px' }} />
                  )
                )}
                <span className={styles.timestamp}>
                  {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {isOwnFeed && (
                  <form action={async () => {
                    "use server";
                    const { deletePost } = await import("../actions");
                    await deletePost(post.id);
                  }} style={{ margin: 0 }}>
                    <button type="submit" className={styles.deletePostBtn} title="Delete post">❌</button>
                  </form>
                )}
              </div>
              <div className={styles.postActionsContainer}>
                <form action={async () => {
                  "use server";
                  await toggleLike(post.id);
                }} style={{ display: 'inline' }}>
                  <button type="submit" className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}>
                    <span>{isLiked ? '❤️' : '🤍'}</span>
                    {likeCount > 0 && <span className={styles.likeCount}>{likeCount}</span>}
                  </button>
                </form>
                <CommentModal post={post} targetUsername={targetUsername} canComment={canComment} />
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}
