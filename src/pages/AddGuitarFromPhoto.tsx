import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AnalyzePhotoResult } from '@/api/analyze-photo';
import { analyzePhotoForCatalog } from '@/api/analyze-photo';
import { hideGuitarInCollection, useCreateGuitar } from '@/api/guitars';
import { uploadPicture, validatePictureFile } from '@/api/uploads';
import { ApiError } from '@/api/client';
import { ErrorBanner } from '@/components/ErrorBanner';
import { GuitarForm } from '@/components/GuitarForm';
import type { GuitarInput } from '@/domain/guitar';

type Step = 'photo' | 'analyzing' | 'review' | 'manual';
type InputMode = 'upload' | 'url';

const currentYear = (): number => new Date().getFullYear();

const suggestedFieldsFromAnalysis = (analysis: AnalyzePhotoResult | null): (keyof GuitarInput)[] => {
  if (!analysis) {
    return [];
  }
  const fields: (keyof GuitarInput)[] = [];
  const { suggestions } = analysis;
  if (suggestions.brand?.trim()) fields.push('brand');
  if (suggestions.typeName?.trim()) fields.push('typeName');
  if (suggestions.color?.trim()) fields.push('color');
  if (suggestions.buildYear && suggestions.buildYear >= 1800 && suggestions.buildYear <= currentYear() + 1) {
    fields.push('buildYear');
  }
  if (suggestions.description?.trim() || analysis.visualSummary.trim()) {
    fields.push('description');
  }
  if (analysis.pictureUrl) fields.push('pictures');
  return fields;
};

const initialValuesFromAnalysis = (analysis: AnalyzePhotoResult | null): Partial<GuitarInput> => {
  if (!analysis) {
    return {};
  }
  const { suggestions } = analysis;
  const buildYear =
    suggestions.buildYear && suggestions.buildYear >= 1800 && suggestions.buildYear <= currentYear() + 1
      ? suggestions.buildYear
      : currentYear();
  return {
    brand: suggestions.brand?.trim() ?? '',
    typeName: suggestions.typeName?.trim() ?? '',
    color: suggestions.color?.trim() ?? undefined,
    buildYear,
    description: suggestions.description?.trim() || analysis.visualSummary,
    pictures: analysis.pictureUrl ? [analysis.pictureUrl] : [],
    coverPictureIndex: 0,
    priceCurrency: 'EUR',
  };
};

export const AddGuitarFromPhoto = () => {
  const navigate = useNavigate();
  const create = useCreateGuitar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('photo');
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [pictureUrl, setPictureUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzePhotoResult | null>(null);
  const [showInCollection, setShowInCollection] = useState(false);
  const [uploading, setUploading] = useState(false);

  const aiSuggestedFields = useMemo(() => suggestedFieldsFromAnalysis(analysis), [analysis]);
  const reviewInitialValues = useMemo(() => initialValuesFromAnalysis(analysis), [analysis]);
  const manualInitialValues = useMemo((): Partial<GuitarInput> | undefined => {
    const url = pictureUrl.trim();
    if (!url) {
      return undefined;
    }
    return {
      pictures: [url],
      coverPictureIndex: 0,
      priceCurrency: 'EUR',
    };
  }, [pictureUrl]);

  const resolvedPictureUrl = analysis?.pictureUrl ?? pictureUrl.trim();

  const runAnalysis = async (url: string) => {
    setAnalysisError(null);
    setStep('analyzing');
    try {
      const result = await analyzePhotoForCatalog(url);
      setAnalysis(result);
      setPictureUrl(result.pictureUrl);
      setStep('review');
    } catch (err) {
      setStep('photo');
      if (err instanceof ApiError) setAnalysisError(err.message);
      else if (err instanceof Error) setAnalysisError(err.message);
      else setAnalysisError('Photo analysis failed');
    }
  };

  const onUploadSelected = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const validationError = validatePictureFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const publicUrl = await uploadPicture(file);
      setPictureUrl(publicUrl);
      await runAnalysis(publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onAnalyzeUrl = async () => {
    const url = pictureUrl.trim();
    if (!url) {
      setUploadError('Enter an image URL.');
      return;
    }
    setUploadError(null);
    await runAnalysis(url);
  };

  const onContinueManually = () => {
    setAnalysis(null);
    setStep('manual');
  };

  const onCreate = async (values: GuitarInput) => {
    setServerError(null);
    try {
      const seedAnalysis = analysis
        ? {
            visualSummary: analysis.visualSummary,
            tags: analysis.tags,
            confidence: analysis.confidence,
          }
        : undefined;
      const created = await create.mutateAsync({ values, seedAnalysis });
      if (!showInCollection) {
        await hideGuitarInCollection(created.id);
      }
      navigate(`/guitars/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message);
      else if (err instanceof Error) setServerError(err.message);
      else setServerError('Unknown error');
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-sm text-slate-600">
          <Link to="/guitars" className="hover:underline">
            ← Back to collection
          </Link>
        </p>
        <h1 className="text-2xl font-semibold">Add guitar</h1>
        <p className="text-sm text-slate-600">
          {step === 'photo' || step === 'analyzing'
            ? 'Start from a photo — AI will suggest catalog details you can review before saving.'
            : step === 'review'
              ? 'Review AI suggestions, enter a price, then save.'
              : 'Enter guitar details manually.'}
        </p>
      </header>

      {step === 'photo' ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex gap-2">
            <button
              type="button"
              className={inputMode === 'upload' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setInputMode('upload')}
            >
              Upload photo
            </button>
            <button
              type="button"
              className={inputMode === 'url' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setInputMode('url')}
            >
              Image URL
            </button>
          </div>

          {inputMode === 'upload' ? (
            <div className="mt-4 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="block w-full text-sm text-slate-700"
                disabled={uploading}
                onChange={(event) => void onUploadSelected(event.target.files)}
              />
              <p className="text-xs text-slate-500">JPEG, PNG, WebP, or GIF up to 5 MB.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <label htmlFor="picture-url" className="label">
                Image URL
              </label>
              <input
                id="picture-url"
                className="input"
                value={pictureUrl}
                onChange={(event) => setPictureUrl(event.target.value)}
                placeholder="https://example.com/guitar.jpg"
              />
              <button
                type="button"
                className="btn-primary"
                disabled={uploading}
                onClick={() => void onAnalyzeUrl()}
              >
                Analyze photo
              </button>
            </div>
          )}

          {uploadError ? <p className="mt-3 text-sm text-red-700">{uploadError}</p> : null}
          {analysisError ? <div className="mt-3"><ErrorBanner error={analysisError} title="Analysis failed" /></div> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-secondary" onClick={onContinueManually}>
              Add manually instead
            </button>
          </div>
        </div>
      ) : null}

      {step === 'analyzing' ? (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-800">Analyzing your photo…</p>
          <p className="mt-2 text-sm text-slate-600">This usually takes a few seconds.</p>
          <div className="mx-auto mt-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <button type="button" className="btn-secondary mt-6" onClick={onContinueManually}>
            Continue manually
          </button>
        </div>
      ) : null}

      {(step === 'review' || step === 'manual') && resolvedPictureUrl ? (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <img src={resolvedPictureUrl} alt="" className="max-h-64 w-full object-cover" />
        </div>
      ) : null}

      {step === 'review' || step === 'manual' ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {step === 'review' ? (
            <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-medium">Check AI suggestions before saving</p>
              <p className="mt-1 text-amber-900/90">
                Especially brand, model, and year may be wrong. Price is never guessed — enter your own value.
              </p>
              {analysis?.tags && analysis.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-amber-900"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 'review' ? (
            <label className="mb-5 flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={showInCollection}
                onChange={(event) => setShowInCollection(event.target.checked)}
                className="mt-0.5 rounded border-slate-300"
              />
              <span>
                Add to collection gallery
                <span className="mt-0.5 block text-xs text-slate-500">
                  Leave unchecked to inspect this guitar privately first. You can show it in your gallery later.
                </span>
              </span>
            </label>
          ) : null}

          <GuitarForm
            initialValues={step === 'review' ? reviewInitialValues : manualInitialValues}
            aiSuggestedFields={step === 'review' ? aiSuggestedFields : undefined}
            submitting={create.isPending}
            submitLabel="Create"
            serverError={serverError}
            onCancel={() => navigate(-1)}
            onSubmit={onCreate}
          />
        </div>
      ) : null}
    </section>
  );
};
