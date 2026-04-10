/**
 * Utilities for URL extraction and metadata fetching.
 */

/**
 * Extracts the first URL from a string.
 */
export function extractFirstUrl(text: string): string | null {
  if (!text) return null;
  // Simple URL regex that matches http/https links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  if (!matches) return null;
  
  // Clean up the URL (remove trailing punctuation that might be part of the sentence)
  return matches[0].replace(/[.,!?;:]$/, '');
}

/**
 * Fetches OpenGraph metadata for a given URL.
 */
export async function fetchMetadata(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; PeachClone/1.0; +https://github.com/shaqsingh/peach-clone)',
        'Accept': 'text/html'
      }
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    const getMeta = (property: string) => {
      // Look for <meta property="..." content="..."> or <meta name="..." content="...">
      const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
      const match = html.match(regex);
      if (match) return decodeHtmlEntities(match[1]);
      
      // Try reversed order (content before property/name)
      const reversedRegex = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i');
      const reversedMatch = html.match(reversedRegex);
      return reversedMatch ? decodeHtmlEntities(reversedMatch[1]) : null;
    };

    const getTitle = () => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return match ? decodeHtmlEntities(match[1]) : null;
    };

    const title = getMeta('og:title') || getMeta('twitter:title') || getTitle() || url;
    const description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description');
    const image = getMeta('og:image') || getMeta('twitter:image');

    // Make sure image URL is absolute
    let absoluteImage = image;
    if (image && !image.startsWith('http')) {
      try {
        const baseUrl = new URL(url);
        absoluteImage = new URL(image, baseUrl.origin).toString();
      } catch (e) {
        // Keep as is if parsing fails
      }
    }

    return {
      title: title.trim(),
      description: description?.trim(),
      image: absoluteImage,
      url
    };
  } catch (err) {
    console.error(`[DEBUG] Failed to fetch metadata for ${url}:`, err);
    return null;
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'");
}
