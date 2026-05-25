import { describe, expect, it } from 'vitest';
import {
  isEmptyRichText,
  looksLikeHtml,
  normalizeRichTextForSubmit,
  sanitizeRichTextHtml,
  stripHtml,
} from './rich-text';

describe('rich-text helpers', () => {
  it('detects and sanitizes allowed formatting', () => {
    const html = '<p>Hello <strong>world</strong></p><script>alert(1)</script>';
    expect(looksLikeHtml(html)).toBe(true);
    expect(sanitizeRichTextHtml(html)).toBe('<p>Hello <strong>world</strong></p>');
    expect(stripHtml(html)).toBe('Hello world');
  });

  it('treats empty editor output as empty', () => {
    expect(isEmptyRichText('')).toBe(true);
    expect(isEmptyRichText('<p></p>')).toBe(true);
    expect(isEmptyRichText('<p><br></p>')).toBe(true);
    expect(normalizeRichTextForSubmit('<p> </p>')).toBeUndefined();
  });

  it('keeps lists and images when sanitizing', () => {
    const html =
      '<ul><li>One</li></ul><ol><li>Two</li></ol><img src="https://cdn.example/a.jpg" alt="Neck" />';
    const sanitized = sanitizeRichTextHtml(html);
    expect(sanitized).toContain('<ul>');
    expect(sanitized).toContain('<ol>');
    expect(sanitized).toContain('src="https://cdn.example/a.jpg"');
  });
});
