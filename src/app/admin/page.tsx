import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createInvite, deleteInvite, deleteUser } from "../actions";
import styles from "./admin.module.css";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  const dynamicStyles = `
    .customTheme {
      --primary-color: ${user?.themePrimary || "#8b5cf6"};
      --secondary-color: ${user?.themeSecondary || "#ede9fe"};
    }
  `;

  return (
    <main className={`${styles.container} customTheme`}>
      <style>{dynamicStyles}</style>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <Link href="/" className={styles.inviteBtn} style={{ background: 'transparent', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }}>
          Back to Feed
        </Link>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Invite Users</h2>
        <form action={createInvite} className={styles.inviteForm}>
          <input 
            type="email" 
            name="email" 
            placeholder="email@example.com" 
            required 
            className={styles.input} 
          />
          <button type="submit" className={styles.inviteBtn}>Send Invite</button>
        </form>

        <h3 className={styles.sectionTitle} style={{ fontSize: '1rem', marginTop: '1.5rem' }}>Pending Invites ({invites.length})</h3>
        {invites.length === 0 ? (
          <p className={styles.empty}>No pending invites.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Sent</th>
                <th className={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td className={styles.td}>{invite.email}</td>
                  <td className={styles.td}>{new Date(invite.createdAt).toLocaleDateString()}</td>
                  <td className={styles.td}>
                    <form action={async () => {
                      "use server";
                      await deleteInvite(invite.id);
                    }}>
                      <button type="submit" className={styles.deleteBtn}>Revoke</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>User Management ({users.length})</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>User</th>
              <th className={styles.th}>Role</th>
              <th className={styles.th}>Joined</th>
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {u.image && (
                      <img src={u.image} alt={u.username || ""} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.displayName || u.username || u.email}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${u.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeUser}`}>
                    {u.role}
                  </span>
                </td>
                <td className={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className={styles.td}>
                  {u.id !== session.user.id && (
                    <form action={async () => {
                      "use server";
                      await deleteUser(u.id);
                    }}>
                      <button type="submit" className={styles.deleteBtn}>Delete</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
