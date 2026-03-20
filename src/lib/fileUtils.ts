/**
 * Helper function to determine if a given file URL should be rendered using an iframe.
 * - Google Drive links are rendered in an iframe due to CORS and export restrictions.
 * - PDF links are rendered in an iframe.
 * - True direct image links are rendered as images.
 */
export function isIframeUrl(fileUrl: string | null | undefined): boolean {
  if (!fileUrl) return false;

  const urlLowerCase = fileUrl.toLowerCase();

  // 1. All Google Drive links should use iframe
  if (urlLowerCase.includes('drive.google.com')) {
    return true;
  }

  // 2. All PDF extensions should use iframe
  const cleanPath = urlLowerCase.split('?')[0].split('#')[0];
  if (cleanPath.endsWith('.pdf')) {
    return true;
  }

  // 3. Otherwise treat as image (direct PNG, JPG, WEBP, etc.)
  return false;
}
