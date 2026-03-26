import { describe, it, expect, vi } from 'vitest';
import { copyToClipboard } from '../copy-to-clipboard';

describe('copyToClipboard', () => {
  it('should copy text to clipboard successfully', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    const result = await copyToClipboard('test text');

    expect(writeText).toHaveBeenCalledWith('test text');
    expect(result).toBe(true);
  });

  it('should handle clipboard API failure', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard error'));
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    const result = await copyToClipboard('test text');

    expect(result).toBe(false);
  });

  it('should handle missing clipboard API', async () => {
    Object.assign(navigator, {
      clipboard: undefined,
    });

    const result = await copyToClipboard('test text');

    expect(result).toBe(false);
  });
});
