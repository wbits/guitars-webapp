export const DESCRIPTION_PREVIEW_LIMIT = 800;

export const truncateAtWordBoundary = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  const slice = text.slice(0, maxLength);
  const lastBreak = Math.max(slice.lastIndexOf(' '), slice.lastIndexOf('\n'), slice.lastIndexOf('\t'));

  if (lastBreak > 0) {
    return text.slice(0, lastBreak).trimEnd();
  }

  return slice;
};

export const isTruncated = (text: string, maxLength: number): boolean =>
  truncateAtWordBoundary(text, maxLength).length < text.length;
