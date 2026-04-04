import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import styles from "../feed.module.css";
import { toggleFollow } from "../actions";
import ComposerForm from "./ComposerForm";
import ScrollToBottom from "./ScrollToBottom";
import MarkViewed from "./MarkViewed";
import FeedPosts from "./FeedPosts";
import { formatRelativeActiveTime, isActive } from "@/lib/dateUtils";

export default async function UserFeedPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const targetUser = await prisma.user.findUnique({
    where: { username },
    include: {
      posts: {
        orderBy: { createdAt: "asc" },
        include: {
          comments: {
            include: { author: true },
            orderBy: { createdAt: "asc" }
          },
          likes: {
            include: { user: true }
          }
        }
      },
    },
  });

  if (!targetUser) {
    notFound();
  }

  const isOwnFeed = session.user.id === targetUser.id;

  let isFollowing = false;
  if (!isOwnFeed) {
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const dynamicStyles = `
  .customTheme {
    --primary-color: ${currentUser?.themePrimary || "#8b5cf6"};
    --secondary-color: ${currentUser?.themeSecondary || "#ede9fe"};
    --user-secondary-color: ${currentUser?.themeSecondary || "#ede9fe"};
    background-image: ${currentUser?.bgImageUrl ? `url('${currentUser.bgImageUrl}')` : `radial-gradient(var(--border-color) 1.5px, transparent 0)`};
    background-size: ${currentUser?.bgImageUrl ? `cover` : `25px 25px`};
    background-position: center;
    background-attachment: fixed;
    background-repeat: ${currentUser?.bgImageUrl ? `no-repeat` : `repeat`};
  }
  `;

  return (
    <div className={`${styles.page} customTheme`}>
      <style>{dynamicStyles}</style>

      {/* Mark this feed as viewed when not own feed */}
      {!isOwnFeed && isFollowing && <MarkViewed username={username} />}

      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/" className={styles.backButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </Link>
          {targetUser.image && (
            <img src={targetUser.image} alt={targetUser.displayName || targetUser.username || ""} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>{targetUser.displayName}</span>
            {targetUser.showActivity && (
              <div className={styles.activityIndicator}>
                {isActive(targetUser.lastActive) ? (
                  <>
                    <span className={styles.activeDot} />
                    <span className={styles.lastActiveText}>Active now</span>
                  </>
                ) : (
                  <span className={styles.lastActiveText}>
                    Last active {formatRelativeActiveTime(targetUser.lastActive)}
                  </span>
                )}
              </div>
            )}

          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isOwnFeed ? (
            <Link href="/settings" className={styles.followButton}>
              Settings
            </Link>
          ) : !isFollowing ? (
            <form action={async () => {
              "use server";
              await toggleFollow(targetUser.username!);
            }}>
              <button className={styles.followButton}>
                Follow
              </button>
            </form>
          ) : null}
        </div>
      </header>

      <main className={styles.feedContainer}>
        {!isOwnFeed && !isFollowing ? (
          <div className={styles.emptyState}>
            <span style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🔒</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Private Space</h2>
            <p style={{ marginTop: '0.5rem', opacity: 0.75 }}>
              You must follow <strong>@{targetUser.username}</strong> to explore their posts and comments.
            </p>
          </div>
        ) : targetUser.posts.length === 0 ? (
          <div className={styles.emptyState}>
            <span>✨</span>
            <p>{isOwnFeed ? "Say something! It's your space." : "Nothing here yet."}</p>
          </div>
        ) : (
          <FeedPosts
            posts={targetUser.posts}
            isOwnFeed={isOwnFeed}
            targetUsername={targetUser.username!}
            canComment={isOwnFeed || isFollowing}
            currentUserId={session.user.id}
          />
        )}
      </main>

      {isOwnFeed && (
        <div className={styles.composer}>
          <ComposerForm />
        </div>
      )}
      <ScrollToBottom />
    </div>
  );
}
