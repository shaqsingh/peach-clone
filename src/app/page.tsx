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

  // Find users the current user is following
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      following: {
        include: {
          following: true
        }
      }
    }
  });

  if (!currentUser?.username) {
    redirect("/welcome");
  }

  const followedUsers = currentUser?.following.map(f => f.following) || [];

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
            {followedUsers.map((user) => (
              <Link href={`/${user.username}`} key={user.id} className={styles.userCard}>
                <div className={styles.avatar}>
                  {user.image
                    ? <img src={user.image} alt={user.displayName || user.username || ""} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : (user.displayName?.[0] || (user.username ? user.username[0] : "?"))
                  }
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.displayName}>{user.displayName}</div>
                  <div className={styles.username}>@{user.username}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      </main>
    </div>
  );
}
