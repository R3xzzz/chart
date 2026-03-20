/**
 * Utility to accurately detect if a given file URL should be treated as a PDF or an Image.
 * Handles edge cases for Google Drive links and ignores query parameters.
 */
export function isPdfUrl(fileUrl: string | null | undefined): boolean {
  if (!fileUrl) return false;

  const urlLowerCase = fileUrl.toLowerCase();

  // 1. Google Drive Explicit Checks
  // Preview links should be treated as PDF viewer (iframe)
  if (urlLowerCase.includes('drive.google.com/file/') && urlLowerCase.includes('/preview')) {
    return true;
  }
  
  // Direct export links usually serve images in this context
  if (urlLowerCase.includes('drive.google.com/') && urlLowerCase.includes('uc?export=view')) {
    return false;
  }

  // 2. Extension Based Detection
  // Strip off query parameters and hash fragments to get the clean file path
  const cleanPath = urlLowerCase.split('?')[0].split('#')[0];
  
  return cleanPath.endsWith('.pdf');
}
