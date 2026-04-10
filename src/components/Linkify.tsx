import React from 'react';

interface LinkifyProps {
  text: string;
}

/**
 * A component that finds URLs in text and converts them into clickable <a> tags.
 */
const Linkify: React.FC<LinkifyProps> = ({ text }) => {
  if (!text) return null;

  // Regex to find URLs (http or https)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split text by URLs and map parts to either text or <a> tags
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a 
              key={i} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} // Prevent bubble click if any
              className="post-link"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
};

export default Linkify;
