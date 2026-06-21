import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useCollectionOwners, useUserGuitars } from '@/api/collections';
import { useGuitars } from '@/api/guitars';
import { ErrorBanner } from '@/components/ErrorBanner';
import { GuitarMosaicGrid } from '@/components/GuitarMosaicGrid';
import { TagCloud } from '@/components/TagCloud';
import {
  formatCollectionHeading,
  guitarPath,
  myCollectionPath,
  userCollectionPath,
} from '@/lib/collection-routes';
import { filterGuitarsByTags, parseTagsParam } from '@/lib/guitar-tags';
import { sortGuitarsForCollection } from '@/lib/guitar-collection';

export const SimilarGuitars = () => {
  const { userId: collectionUserId } = useParams<{ userId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const cloudTags = useMemo(() => parseTagsParam(searchParams.get('tags')), [searchParams]);
  const selectedTags = useMemo(() => {
    const active = parseTagsParam(searchParams.get('selected'));
    return active.length > 0 ? active : cloudTags;
  }, [cloudTags, searchParams]);
  const fromGuitarId = searchParams.get('from') ?? undefined;
  const isOwnCollection = !collectionUserId;

  const ownGuitars = useGuitars({ enabled: isOwnCollection });
  const userGuitars = useUserGuitars(collectionUserId ?? '', { enabled: !isOwnCollection });
  const owners = useCollectionOwners({ enabled: !isOwnCollection });

  const query = isOwnCollection ? ownGuitars : userGuitars;
  const sorted = useMemo(() => sortGuitarsForCollection(query.data ?? []), [query.data]);

  const visible = useMemo(
    () => filterGuitarsByTags(sorted, selectedTags),
    [selectedTags, sorted],
  );

  const owner = owners.data?.find((entry) => entry.userId === collectionUserId);
  const collectionLabel = isOwnCollection
    ? 'My collection'
    : formatCollectionHeading(collectionUserId ?? '', owner?.displayName);
  const backPath = isOwnCollection ? myCollectionPath() : userCollectionPath(collectionUserId ?? '');

  const toggleTag = (tag: string) => {
    const lower = tag.toLowerCase();
    const exists = selectedTags.some((t) => t.toLowerCase() === lower);
    const next = exists
      ? selectedTags.filter((t) => t.toLowerCase() !== lower)
      : [...selectedTags, tag];
    const params = new URLSearchParams(searchParams);
    if (next.length > 0) {
      params.set('selected', next.join(','));
    } else {
      params.delete('selected');
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-sm text-slate-600">
          <Link to={backPath} className="hover:underline">
            ← Back to {collectionLabel}
          </Link>
          {fromGuitarId ? (
            <>
              {' · '}
              <Link to={guitarPath(fromGuitarId, collectionUserId)} className="hover:underline">
                View source guitar
              </Link>
            </>
          ) : null}
        </p>
        <h1 className="text-2xl font-semibold">More like this</h1>
        <p className="text-sm text-slate-600">
          Guitars in {collectionLabel} that share the selected visual tags.
        </p>
      </header>

      {cloudTags.length > 0 ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Visual tags</h2>
          <p className="mt-1 text-xs text-slate-500">Toggle tags to refine the matches.</p>
          <div className="mt-3">
            <TagCloud tags={cloudTags} selected={selectedTags} onToggle={toggleTag} />
          </div>
        </div>
      ) : null}

      {query.isLoading ? <p className="text-sm text-slate-600">Loading guitars…</p> : null}

      {query.isError ? (
        <div className="space-y-2">
          <ErrorBanner error={query.error} title="Could not load collection" />
          <button type="button" onClick={() => query.refetch()} className="btn-secondary">
            Retry
          </button>
        </div>
      ) : null}

      {!query.isLoading && !query.isError && cloudTags.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-slate-700">No tags were provided for this view.</p>
        </div>
      ) : null}

      {!query.isLoading && !query.isError && selectedTags.length === 0 && cloudTags.length > 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-slate-700">Select at least one tag to see matching guitars.</p>
        </div>
      ) : null}

      {!query.isLoading && !query.isError && selectedTags.length > 0 && visible.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-slate-700">No guitars match the selected tags.</p>
        </div>
      ) : null}

      {visible.length > 0 ? (
        <>
          <p className="text-sm text-slate-600">
            {visible.length} guitar{visible.length === 1 ? '' : 's'}
          </p>
          <div className="-mx-4 overflow-hidden bg-white sm:mx-0 sm:rounded-md">
            <GuitarMosaicGrid guitars={visible} collectionUserId={collectionUserId} />
          </div>
        </>
      ) : null}
    </section>
  );
};
