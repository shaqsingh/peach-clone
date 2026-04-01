import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "../home.module.css";

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Find all users with a set username, except current
  const users = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      username: { not: null }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Explore</h1>
        <div className={styles.actions}>
          <Link href="/" className={styles.btn}>Back Home</Link>
        </div>
      </header>

      <section>
        <h2 className={styles.sectionTitle}>Meet others</h2>
        
        {users.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No other users have established their namespace yet.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {users.map((user) => (
              <Link href={`/${user.username}`} key={user.id} className={styles.userCard}>
                <div className={styles.avatar}>
                  {user.displayName?.[0] || (user.username ? user.username[0] : "?")}
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
  );
}

