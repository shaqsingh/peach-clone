"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";
import { setUsername } from "../actions";

export default function WelcomePage() {
  const router = useRouter();
  const [username, setUsernameInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      await setUsername(formData);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong saving your username");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>You're in!</h1>
        <p className={styles.subtitle}>Let's claim your unique username</p>
        
        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">Choose a Username</label>
            <input
              className={styles.input}
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. yourname"
              minLength={3}
            />
          </div>

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Saving..." : "Start Exploring"}
          </button>
        </form>
      </div>
    </div>
  );
}
