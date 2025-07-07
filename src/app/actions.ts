'use server'

import { z } from 'zod'

const urlSchema = z.string().url()

function decodeHtmlEntities(text: string): string {
    return text.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#039;/g, "'")
               .replace(/&#x27;/g, "'")
               .replace(/&#x2F;/g, "/");
}

const getFallbackTitle = (url: string) => {
    try {
        const hostname = new URL(url).hostname.replace(/^www\./, '');
        const mainDomain = hostname.split('.')[0];
        return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
    } catch (e) {
        return '';
    }
}

export async function getPageTitle(url: string): Promise<string> {
  const validation = urlSchema.safeParse(url)
  if (!validation.success) {
    return '';
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(3000), // 3-second timeout
    });

    if (!response.ok) {
      return getFallbackTitle(url);
    }

    const html = await response.text();
    const match = html.match(/<title>([^<]*)<\/title>/i);
    
    if (match && match[1]) {
      return decodeHtmlEntities(match[1].trim());
    }
    
    return getFallbackTitle(url);

  } catch (error) {
    console.warn(`Failed to fetch title for ${url}:`, error);
    return getFallbackTitle(url);
  }
}
