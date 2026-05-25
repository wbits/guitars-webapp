import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'strike',
  'ul',
  'ol',
  'li',
  'img',
] as const;

const ALLOWED_ATTR = ['src', 'alt'] as const;

export const sanitizeRichTextHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTR],
  });

export const looksLikeHtml = (text: string): boolean => /<[a-z][\s\S]*>/i.test(text);

export const stripHtml = (html: string): string => {
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ');
  }

  const element = document.createElement('div');
  element.innerHTML = sanitizeRichTextHtml(html);
  return element.textContent ?? '';
};

export const isEmptyRichText = (html: string | undefined): boolean => {
  if (!html) {
    return true;
  }
  return stripHtml(html).trim().length === 0;
};

export const normalizeRichTextForSubmit = (html: string | undefined): string | undefined => {
  if (!html || isEmptyRichText(html)) {
    return undefined;
  }
  return sanitizeRichTextHtml(html);
};
