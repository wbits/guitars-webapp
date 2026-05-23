import { useCallback, useEffect, useState } from 'react';

interface PictureGalleryProps {
  pictures: string[];
}

export const PictureGallery = ({ pictures }: PictureGalleryProps) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const hasMultiple = pictures.length > 1;

  const closePreview = useCallback(() => setPreviewIndex(null), []);

  const showPrevious = useCallback(() => {
    setPreviewIndex((current) => {
      if (current === null) return null;
      return (current - 1 + pictures.length) % pictures.length;
    });
  }, [pictures.length]);

  const showNext = useCallback(() => {
    setPreviewIndex((current) => {
      if (current === null) return null;
      return (current + 1) % pictures.length;
    });
  }, [pictures.length]);

  useEffect(() => {
    if (previewIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
      if (hasMultiple && e.key === 'ArrowLeft') showPrevious();
      if (hasMultiple && e.key === 'ArrowRight') showNext();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewIndex, hasMultiple, closePreview, showPrevious, showNext]);

  if (pictures.length === 0) {
    return <p className="text-sm text-slate-500">No pictures yet.</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {pictures.map((src, index) => (
          <li key={`${src}-${index}`} className="aspect-square overflow-hidden rounded-md border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setPreviewIndex(index)}
              className="block h-full w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
              aria-label={`Preview picture ${index + 1}`}
            >
              <img
                src={src}
                alt={`Guitar picture ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          </li>
        ))}
      </ul>

      {previewIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Picture preview"
          onClick={closePreview}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6"
        >
          <div
            className="flex max-w-full items-center gap-2 sm:gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {hasMultiple ? (
              <button
                type="button"
                onClick={showPrevious}
                className="min-h-11 min-w-11 shrink-0 rounded-md bg-white/90 px-3 py-2 text-lg font-medium text-slate-900 hover:bg-white"
                aria-label="Previous picture"
              >
                ←
              </button>
            ) : null}

            <figure className="min-w-0">
              <img
                src={pictures[previewIndex]}
                alt={`Preview ${previewIndex + 1} of ${pictures.length}`}
                className="max-h-[calc(100dvh-2rem)] max-w-full rounded-md shadow-2xl"
              />
              {hasMultiple ? (
                <figcaption className="mt-2 text-center text-sm text-white/90">
                  {previewIndex + 1} / {pictures.length}
                </figcaption>
              ) : null}
            </figure>

            {hasMultiple ? (
              <button
                type="button"
                onClick={showNext}
                className="min-h-11 min-w-11 shrink-0 rounded-md bg-white/90 px-3 py-2 text-lg font-medium text-slate-900 hover:bg-white"
                aria-label="Next picture"
              >
                →
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={closePreview}
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] min-h-11 rounded-md bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            Close
          </button>
        </div>
      ) : null}
    </>
  );
};
