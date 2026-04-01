"use client";

import { useRef, useState } from "react";
import styles from "../feed.module.css";
import { createPost } from "../actions";

export default function ComposerForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview("video");
      }
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (formRef.current) {
      const fileInput = formRef.current.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <form 
      ref={formRef}
      action={async (formData) => {
        await createPost(formData);
        formRef.current?.reset();
        setPreview(null);
      }} 
      className={styles.composerForm}
    >
      <label className={styles.fileLabel}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <input type="file" name="media" accept="image/*,video/*" style={{display: 'none'}} onChange={handleFileChange} />
      </label>
      
      {preview && (
        <div className={styles.previewContainer}>
          {preview === "video" ? (
            <div className={styles.previewVideo}>🎥</div>
          ) : (
            <img src={preview} alt="Upload preview" className={styles.previewImage} />
          )}
          <button type="button" onClick={clearPreview} className={styles.clearPreviewBtn}>×</button>
        </div>
      )}

      <input
        type="text"
        name="content"
        placeholder="What's going on?"
        className={styles.composerInput}
        autoComplete="off"
      />

      <button type="submit" className={styles.sendButton}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
    </form>
  );
}
