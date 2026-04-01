import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveSettings } from "../actions";
import Link from "next/link";
import styles from "../settings.module.css";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

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
        <Link href={`/${user?.username}`} className={styles.backBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </Link>
        <h1 className={styles.title}>Settings & Appearance</h1>
      </header>

      <form action={saveSettings} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Profile Picture</label>
          <p className={styles.desc}>Upload a photo to use as your avatar.</p>
          {user?.image && (
            <img src={user.image} alt="Current avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.75rem', border: '3px solid var(--primary-color)' }} />
          )}
          <input
            type="file"
            name="avatar"
            accept="image/*"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Display Name</label>
          <input 
            type="text" 
            name="displayName" 
            defaultValue={user?.displayName || ""} 
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Primary Brand Color</label>
          <p className={styles.desc}>This applies to your buttons and posts in your feed.</p>
          <input 
            type="color" 
            name="themePrimary" 
            defaultValue={user?.themePrimary || "#8b5cf6"} 
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Secondary Background</label>
          <p className={styles.desc}>Secondary accent color (used for focus rings/light backgrounds)</p>
          <input 
            type="color" 
            name="themeSecondary" 
            defaultValue={user?.themeSecondary || "#ede9fe"} 
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="showActivity" 
              defaultChecked={user?.showActivity}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            Show Activity Status
          </label>
          <p className={styles.desc}>When enabled, others can see if you are online and when you were last active.</p>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Save Settings
        </button>

      </form>
    </main>
  );
}
