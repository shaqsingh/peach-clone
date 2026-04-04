import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./home.module.css";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Find users the current user is following, with their last viewed time and latest post
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      following: {
        include: {
          following: {
            include: {
              posts: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              }
            }
          }
        }
      }
    }
  });

  if (!currentUser?.username) {
    redirect("/welcome");
  }

  const followedUsers = currentUser?.following.map(f => ({
    ...f.following,
    lastViewedAt: f.lastViewedAt,
    latestPost: f.following.posts[0]?.createdAt || null,
  })) || [];

  const dynamicStyles = `
  .customTheme {
    --primary-color: ${currentUser.themePrimary || "#8b5cf6"};
    --secondary-color: ${currentUser.themeSecondary || "#ede9fe"};
    background-image: ${currentUser.bgImageUrl ? `url('${currentUser.bgImageUrl}')` : `radial-gradient(var(--border-color) 1.5px, transparent 0)`};
    background-size: ${currentUser.bgImageUrl ? `cover` : `25px 25px`};
    background-position: center;
    background-attachment: fixed;
    background-repeat: ${currentUser.bgImageUrl ? `no-repeat` : `repeat`};
  }
  `;

  return (
    <div className="customTheme" style={{ minHeight: "100vh" }}>
      <style>{dynamicStyles}</style>
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Home</h1>
          <div className={styles.actions}>
            <Link href="/explore" className={styles.btn}>Explore</Link>
            <Link href={`/${session.user.username}`} className={`${styles.btn} ${styles.btnPrimary}`}>
              My Space
            </Link>
          </div>
        </header>

        <section className={styles.feedSection}>
          <div className={styles.feedSectionHeader}>
            <h2 className={styles.sectionTitle}>Following</h2>
          </div>

          {followedUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <p style={{ marginBottom: '1rem' }}>You aren't following anyone yet.</p>
              <Link href="/explore" className={`${styles.btn} ${styles.btnPrimary}`}>
                Find people to follow
              </Link>
            </div>
          ) : (
            <div className={styles.list}>
              {followedUsers.map((user) => {
                const hasNewContent = user.latestPost &&
                  (!user.lastViewedAt || user.latestPost > user.lastViewedAt);

                return (
                  <Link href={`/${user.username}`} key={user.id} className={styles.userCard}>
                    <div className={styles.avatar}>
                      {user.image
                        ? <img src={user.image} alt={user.displayName || user.username || ""} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : (user.displayName?.[0] || (user.username ? user.username[0] : "?"))
                      }
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.displayName}>
                        {user.displayName}
                        {hasNewContent && <span className={styles.newBadge}>new</span>}
                      </div>
                      <div className={styles.username}>@{user.username}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
