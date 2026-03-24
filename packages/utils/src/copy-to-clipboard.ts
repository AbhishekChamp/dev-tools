export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

export function createCopyHandler(
  getText: () => string,
  onSuccess?: () => void,
  onError?: () => void
): () => Promise<void> {
  return async () => {
    const success = await copyToClipboard(getText());
    if (success) {
      onSuccess?.();
    } else {
      onError?.();
    }
  };
}
