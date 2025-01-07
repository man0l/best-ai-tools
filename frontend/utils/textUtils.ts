export function stripHtml(html: string | undefined | null): string {
  if (!html) return '';
  
  try {
    // First pass: Remove script and style tags and their content
    const withoutScriptAndStyle = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Second pass: Remove HTML tags but preserve content
    const withoutTags = withoutScriptAndStyle
      .replace(/<[^>]+>/g, ' ') // Replace tags with space
      .replace(/\s+/g, ' '); // Normalize whitespace

    // Third pass: Decode HTML entities
    const decoded = withoutTags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&lsquo;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&mdash;/g, '-')
      .replace(/&ndash;/g, '-')
      .replace(/&hellip;/g, '...')
      .replace(/\n/g, ' '); // Replace newlines with spaces

    return decoded.trim();
  } catch (error) {
    console.error('Error stripping HTML:', error);
    return html.trim();
  }
} 