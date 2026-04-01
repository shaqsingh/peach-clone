"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "../feed.module.css";
import { createComment } from "../actions";

export default function CommentModal({ post, targetUsername, canComment }: { post: any, targetUsername: string, canComment: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  return (
    <>
      <button 
        className={styles.commentBtn} 
        onClick={() => setIsOpen(true)}
        title="View Comments"
      >
        💬 {post.comments?.length || 0}
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className={`${styles.modalOverlay} customTheme`} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              Comments
              <button className={styles.closeModalBtn} onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              {post.comments?.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
                  No comments yet. Be the first to reply!
                </div>
              ) : (
                post.comments?.map((comment: any) => (
                  <div key={comment.id} className={styles.commentItem}>
                    <div className={styles.commentAvatar}>
                      {comment.author.image
                        ? <img src={comment.author.image} alt={comment.author.displayName || comment.author.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : (comment.author.displayName?.[0] || comment.author.username[0])
                      }
                    </div>
                    <div className={styles.commentBubbleContainer}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>{comment.author.displayName || comment.author.username}</span>
                        <span className={styles.commentTime}>
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={styles.commentTextBubble}>
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {canComment ? (
              <div className={styles.modalFooter}>
                <form 
                  ref={formRef}
                  action={async (formData) => {
                    formData.append("postId", post.id);
                    formData.append("targetUsername", targetUsername);
                    await createComment(formData);
                    formRef.current?.reset();
                  }} 
                  className={styles.commentForm}
                >
                  <input
                    type="text"
                    name="content"
                    placeholder="Write a reply..."
                    className={styles.commentInput}
                    autoComplete="off"
                    required
                  />
                  <button type="submit" className={styles.sendButton} style={{ width: '40px', height: '40px', fontSize: '1rem', marginLeft: '0', marginRight: '0' }}>
                    ↑
                  </button>
                </form>
              </div>
            ) : (
              <div className={styles.modalFooter} style={{ textAlign: "center", color: '#888', fontStyle: 'italic', padding: '1rem' }}>
                You must follow this user to comment on their space.
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
