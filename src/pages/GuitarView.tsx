import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCollectionOwners, useUserGuitars } from '@/api/collections';
import { useAnalyzeGuitar, useDeleteGuitar, useGuitar, useGuitars, useSetGuitarCollectionVisibility } from '@/api/guitars';
import { useCurrentUser } from '@/api/me';
import { ApiError } from '@/api/client';
import { useMarketLogs } from '@/api/marketLogs';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ExpandableText } from '@/components/ExpandableText';
import { GuitarCollectionNav } from '@/components/GuitarCollectionNav';
import { MarketLogList } from '@/components/MarketLogList';
import { NoImagePlaceholder } from '@/components/NoImagePlaceholder';
import { PictureGallery } from '@/components/PictureGallery';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useSwipeNavigation } from '@/hooks/use-swipe-navigation';
import { formatCollectionLabel,
  guitarEditPath,
  guitarPath,
  myCollectionPath,
  similarGuitarsPath,
  userCollectionPath,
} from '@/lib/collection-routes';
import { getGuitarNeighbors } from '@/lib/guitar-collection';
import { hasDisplayValue } from '@/lib/guitar-display';
import { canEditGuitar } from '@/lib/guitar-ownership';
import { coverPictureUrl, formatGuitarCaption } from '@/lib/guitar-cover';
import {
  canTriggerGuitarAnalysis,
  showGuitarAnalysisPanel,
} from '@/lib/guitar-analysis-ui';

export const GuitarView = () => {
  const { id = '', userId: collectionUserId } = useParams<{ id: string; userId?: string }>();
  const navigate = useNavigate();
  const guitar = useGuitar(id, { pollWhileAnalysisPending: true });
  const myGuitars = useGuitars({ enabled: !collectionUserId });
  const userGuitars = useUserGuitars(collectionUserId, { enabled: Boolean(collectionUserId) });
  const owners = useCollectionOwners({ enabled: Boolean(collectionUserId) });
  const me = useCurrentUser();
  const marketLogs = useMarketLogs(id);
  const del = useDeleteGuitar();
  const analyze = useAnalyzeGuitar(id);
  const visibility = useSetGuitarCollectionVisibility(id);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<unknown>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 639px)');

  const collectionGuitars = collectionUserId ? (userGuitars.data ?? []) : (myGuitars.data ?? []);
  const neighbors = guitar.data
    ? getGuitarNeighbors(collectionGuitars, guitar.data.id)
    : { previous: null, next: null };

  const goToPrevious = useCallback(() => {
    if (neighbors.previous) {
      navigate(guitarPath(neighbors.previous.id, collectionUserId));
    }
  }, [collectionUserId, navigate, neighbors.previous]);

  const goToNext = useCallback(() => {
    if (neighbors.next) {
      navigate(guitarPath(neighbors.next.id, collectionUserId));
    }
  }, [collectionUserId, navigate, neighbors.next]);

  const swipeEnabled =
    isMobile &&
    !confirming &&
    Boolean(guitar.data) &&
    Boolean(neighbors.previous || neighbors.next);

  const { onTouchStart, onTouchEnd } = useSwipeNavigation({
    enabled: swipeEnabled,
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
  });

  if (guitar.isLoading) {
    return <p className="text-sm text-slate-600">Loading…</p>;
  }
  if (guitar.isError || !guitar.data) {
    return <ErrorBanner error={guitar.error ?? 'Guitar not found'} title="Could not load guitar" />;
  }

  const g = guitar.data;
  const isOwnCollectionView = !collectionUserId;
  const canEdit = canEditGuitar({
    guitar: g,
    isOwnCollectionView,
    currentUserId: me.data?.userId,
    myCollection: myGuitars.data,
  });
  const isLegacyClaimable = !g.owner && isOwnCollectionView;
  const collectionOwner = owners.data?.find((entry) => entry.userId === collectionUserId);
  const collectionBackPath = collectionUserId
    ? userCollectionPath(collectionUserId)
    : myCollectionPath();
  const collectionBackLabel = collectionUserId
    ? `← Back to ${formatCollectionLabel(collectionUserId, me.data?.userId, collectionOwner?.displayName)}'s collection`
    : '← Back to collection';
  const coverUrl = coverPictureUrl(g);
  const hasCover = Boolean(coverUrl);
  const serialNumber = g.serialNumber?.trim();
  const color = g.color?.trim();
  const country = g.country?.trim();
  const factory = g.factory?.trim();
  const showBuildYear = Number.isFinite(g.buildYear) && g.buildYear >= 1800;
  const showSerialNumber = Boolean(serialNumber && !/^n\/?a$/i.test(serialNumber));
  const showColor = hasDisplayValue(color);
  const showCountry = hasDisplayValue(country);
  const showFactory = hasDisplayValue(factory);
  const showAnalysisPanel = showGuitarAnalysisPanel(g, canEdit, me.data);
  const showAnalyzeButton = canTriggerGuitarAnalysis(g, canEdit, me.data);
  const similarTags =
    g.analysis?.status === 'ready' ? (g.analysis.tags ?? []).filter(Boolean) : [];
  const similarPath =
    similarTags.length > 0
      ? similarGuitarsPath({
          collectionUserId,
          tags: similarTags,
          fromGuitarId: g.id,
        })
      : null;

  const onAnalyze = async () => {
    setAnalyzeError(null);
    try {
      await analyze.mutateAsync();
    } catch (err) {
      if (err instanceof ApiError) setAnalyzeError(err.message);
      else if (err instanceof Error) setAnalyzeError(err.message);
      else setAnalyzeError('Could not start photo analysis');
    }
  };

  const onToggleVisibility = async () => {
    setVisibilityError(null);
    try {
      await visibility.mutateAsync(!(g.hiddenInCollection ?? false));
    } catch (err) {
      if (err instanceof ApiError) setVisibilityError(err.message);
      else if (err instanceof Error) setVisibilityError(err.message);
      else setVisibilityError('Could not update collection visibility');
    }
  };

  const confirmDelete = async () => {
    setDeleteError(null);
    try {
      await del.mutateAsync(g.id);
      navigate(collectionBackPath);
    } catch (err) {
      setDeleteError(err);
      setConfirming(false);
    }
  };

  return (
    <section
      className="space-y-6 touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <header
        className={`relative isolate overflow-hidden rounded-lg border border-slate-200 shadow-sm ${
          hasCover ? 'guitar-hero--cover' : 'bg-white'
        }`}
      >
        {hasCover ? (
          <>
            <img
              src={coverUrl as string}
              alt={formatGuitarCaption(g)}
              className="guitar-hero-cover"
            />
            <div className="guitar-hero-overlay" aria-hidden />
          </>
        ) : (
          <div className="aspect-[21/9] max-h-48 border-b border-slate-200 bg-slate-100">
            <NoImagePlaceholder />
          </div>
        )}

        <div
          className={
            hasCover
              ? 'guitar-hero-content'
              : 'relative flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6'
          }
        >
          <div className={`min-w-0 ${canEdit ? 'pr-32 sm:pr-0' : ''}`}>
            <p className={`text-sm ${hasCover ? 'text-white/80' : 'text-slate-500'}`}>
              <Link
                to={collectionBackPath}
                className={hasCover ? 'hover:text-white' : 'hover:underline'}
              >
                {collectionBackLabel}
              </Link>
            </p>
            <h1
              className={`mt-1 text-2xl font-semibold break-words sm:text-3xl ${
                hasCover ? 'text-white' : 'text-slate-900'
              }`}
            >
              {g.brand}{' '}
              <span className={hasCover ? 'text-white/75' : 'text-slate-500'}>{g.typeName}</span>
            </h1>
            {showBuildYear ? (
              <p className={`mt-1 text-sm ${hasCover ? 'text-white/85' : 'text-slate-600'}`}>
                Built {g.buildYear}
              </p>
            ) : null}
            {canEdit && (g.hiddenInCollection ?? false) ? (
              <p className={`mt-2 text-xs ${hasCover ? 'text-amber-100' : 'text-amber-800'}`}>
                Hidden from your collection gallery.
              </p>
            ) : null}
          </div>
          {canEdit ? (
            <div className="absolute bottom-3 right-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap justify-end gap-1.5 sm:relative sm:bottom-auto sm:right-auto sm:max-w-none sm:shrink-0 sm:gap-2">
              <button
                type="button"
                onClick={() => void onToggleVisibility()}
                disabled={visibility.isPending}
                className={`btn-secondary !min-h-8 px-2.5 py-1 text-xs sm:!min-h-11 sm:px-4 sm:py-2 sm:text-sm ${
                  hasCover ? 'border-white/40 bg-white/85 hover:bg-white/95' : ''
                }`}
              >
                {visibility.isPending
                  ? 'Saving…'
                  : (g.hiddenInCollection ?? false)
                    ? 'Show in collection'
                    : 'Hide from collection'}
              </button>
              <Link
                to={guitarEditPath(g.id)}
                className={`btn-secondary !min-h-8 px-2.5 py-1 text-xs sm:!min-h-11 sm:px-4 sm:py-2 sm:text-sm ${
                  hasCover ? 'border-white/40 bg-white/85 hover:bg-white/95' : ''
                }`}
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className={`btn-danger !min-h-8 px-2.5 py-1 text-xs sm:!min-h-11 sm:px-4 sm:py-2 sm:text-sm ${
                  hasCover ? 'bg-red-600/85 hover:bg-red-500/90' : ''
                }`}
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <GuitarCollectionNav
        previous={neighbors.previous}
        next={neighbors.next}
        collectionUserId={collectionUserId}
      />

      {isLegacyClaimable ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-medium">This guitar is not in your collection yet.</p>
          <p className="mt-1">
            Save it once from{' '}
            <Link to={guitarEditPath(g.id)} className="font-medium underline">
              Edit
            </Link>{' '}
            to claim ownership and show it on the overview.
          </p>
        </div>
      ) : null}

      {deleteError ? <ErrorBanner error={deleteError} title="Could not delete guitar" /> : null}
      {visibilityError ? (
        <ErrorBanner error={visibilityError} title="Could not update collection visibility" />
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <dl className="rounded-md border border-slate-200 bg-white p-5 text-sm shadow-sm">
          {showBuildYear ? <Row label="Build year" value={String(g.buildYear)} /> : null}
          {showSerialNumber && serialNumber ? (
            <Row label="Serial number" value={serialNumber} />
          ) : null}
          {showColor && color ? <Row label="Color" value={color} /> : null}
          {showCountry && country ? <Row label="Country (made in)" value={country} /> : null}
          {showFactory && factory ? <Row label="Factory" value={factory} /> : null}
          <Row label="ID" value={<code className="text-xs">{g.id}</code>} />
        </dl>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          {g.description ? (
            <ExpandableText text={g.description} />
          ) : (
            <p className="text-sm text-slate-500">No description provided.</p>
          )}
        </div>
      </div>

      {showAnalysisPanel ? (
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">AI-detected details</h2>
              <p className="mt-1 text-xs text-slate-500">
                Generated from photos. May be incomplete or inaccurate — your entered fields take
                precedence.
              </p>
            </div>
            {showAnalyzeButton ? (
              <button
                type="button"
                className="btn-secondary shrink-0 px-2.5 py-1 text-xs"
                onClick={() => void onAnalyze()}
                disabled={analyze.isPending}
              >
                {analyze.isPending
                  ? 'Queueing…'
                  : g.analysis?.status === 'failed'
                    ? 'Retry analysis'
                    : 'Analyze photo'}
              </button>
            ) : null}
          </div>
          {analyzeError ? (
            <p className="mt-3 text-sm text-red-700">{analyzeError}</p>
          ) : null}
          {g.analysis?.status === 'ready' ? (
            <div className="mt-3 space-y-3 text-sm text-slate-800">
              {g.analysis.visualSummary ? <p>{g.analysis.visualSummary}</p> : null}
              {g.analysis.tags && g.analysis.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {g.analysis.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {similarPath ? (
                <Link to={similarPath} className="btn-secondary inline-flex px-2.5 py-1 text-xs">
                  More like this…
                </Link>
              ) : null}
            </div>
          ) : g.analysis?.status === 'pending' ? (
            <p className="mt-3 text-sm text-slate-600">Analysis in progress…</p>
          ) : g.analysis?.status === 'failed' ? (
            <p className="mt-3 text-sm text-amber-800">
              Analysis failed{g.analysis.failureReason ? `: ${g.analysis.failureReason}` : '.'}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-600">Cover photo not analyzed yet.</p>
          )}
        </div>
      ) : null}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Pictures</h2>
        <PictureGallery pictures={g.pictures} />
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Marketplace prices</h2>
        {marketLogs.isLoading ? (
          <p className="text-sm text-slate-600">Loading market observations…</p>
        ) : marketLogs.isError ? (
          <ErrorBanner error={marketLogs.error} title="Could not load market prices" />
        ) : (
          <MarketLogList logs={marketLogs.data ?? []} />
        )}
      </div>

      {confirming ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-md bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Delete guitar?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{g.brand} {g.typeName}</strong>?
              This cannot be undone.
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={() => setConfirming(false)}
                disabled={del.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger w-full sm:w-auto"
                onClick={confirmDelete}
                disabled={del.isPending}
              >
                {del.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid gap-1 border-b border-slate-100 py-3 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-3 sm:gap-2 sm:py-1.5 sm:border-b-0">
    <dt className="text-sm font-medium text-slate-500 sm:font-normal">{label}</dt>
    <dd className="text-sm text-slate-900 break-words sm:col-span-2">{value}</dd>
  </div>
);
