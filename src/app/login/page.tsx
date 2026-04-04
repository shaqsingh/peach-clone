"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import styles from "../auth.module.css";
import Link from "next/link";

import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState(
    errorCode === "InviteOnly" ? "You need an invitation to join this space." : ""
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("email", {
      callbackUrl: "/",
      redirect: false,
      email,
    });

    if (res?.error) {
      if (res.error === "InviteOnly" || res.error === "AccessDenied") {
        setError("You need an invitation to join this space.");
      } else {
        setError("Failed to send magic link. Make sure SMTP is configured.");
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Welcome to your space</h1>
      
      {success ? (
        <p className={styles.subtitle} style={{ color: "green", fontSize: "1.1rem", fontWeight: "600" }}>
          Check your email for a magic link to sign in!
        </p>
      ) : (
        <>
          <p className={styles.subtitle}>Enter your email to receive a magic link</p>
          {error && <div className={styles.error}>{error}</div>}
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="email">Email address</label>
              <input
                className={styles.input}
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
              />
            </div>

            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? "Sending link..." : "Send Magic Link"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

