// Share a link: native share sheet on phones, clipboard copy on desktop.
// Returns a short message to show to the user ('' when nothing to show).
export async function shareLink(title, url) {
  const link = /^https?:/.test(url) ? url : window.location.origin + url;
  try {
    if (navigator.share) {
      await navigator.share({ title, text: title, url: link });
      return '';
    }
    await navigator.clipboard.writeText(link);
    return 'Link copied to clipboard';
  } catch (err) {
    return err.name === 'AbortError' ? '' : 'Could not share this link';
  }
}

export const mapSearchUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const mapDirectionsUrl = (query) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
