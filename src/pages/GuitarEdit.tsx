import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GuitarForm } from '@/components/GuitarForm';
import { useGuitar, useGuitars, useUpdateGuitar, analyzeGuitar } from '@/api/guitars';
import { useCurrentUser } from '@/api/me';
import { ApiError } from '@/api/client';
import { ErrorBanner } from '@/components/ErrorBanner';
import { guitarPath } from '@/lib/collection-routes';
import { coverPictureChanged } from '@/lib/guitar-cover-analysis';

export const GuitarEdit = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guitar = useGuitar(id);
  const myGuitars = useGuitars();
  const me = useCurrentUser();
  const update = useUpdateGuitar(id);
  const [serverError, setServerError] = useState<string | null>(null);

  if (guitar.isLoading || myGuitars.isLoading) {
    return <p className="text-sm text-slate-600">Loading…</p>;
  }
  if (guitar.isError || !guitar.data) {
    return <ErrorBanner error={guitar.error ?? 'Guitar not found'} title="Could not load guitar" />;
  }

  const g = guitar.data;
  const canEdit = canEditGuitar({
    guitar: g,
    isOwnCollectionView: true,
    currentUserId: me.data?.userId,
    myCollection: myGuitars.data,
  });

  if (!canEdit) {
    return (
      <ErrorBanner
        error="You can only edit guitars in your own collection."
        title="Cannot edit guitar"
      />
    );
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Edit guitar</h1>
        <p className="text-sm text-slate-600">
          Update the details for <span className="font-medium">{g.brand}</span>{' '}
          <span className="text-slate-500">({g.typeName})</span>.
        </p>
      </header>

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <GuitarForm
          initialValues={g}
          submitting={update.isPending}
          submitLabel="Save changes"
          serverError={serverError}
          onCancel={() => navigate(guitarPath(g.id))}
          onSubmit={async (values) => {
            setServerError(null);
            try {
              const updated = await update.mutateAsync(values);
              if (
                me.data?.photoAnalysisEnabled &&
                values.pictures.length > 0 &&
                coverPictureChanged(g, values)
              ) {
                void analyzeGuitar(updated.id).catch(() => undefined);
              }
              navigate(guitarPath(updated.id));
            } catch (err) {
              if (err instanceof ApiError) setServerError(err.message);
              else if (err instanceof Error) setServerError(err.message);
              else setServerError('Unknown error');
            }
          }}
        />
      </div>
    </section>
  );
};
