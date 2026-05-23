import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCollectionOwners } from '@/api/collections';
import { useCurrentUser } from '@/api/me';
import { formatCollectionLabel, myCollectionPath, userCollectionPath } from '@/lib/collection-routes';
import { hasToken } from '@/lib/token';

export const CollectionPicker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const signedIn = hasToken();
  const me = useCurrentUser({ enabled: signedIn });
  const owners = useCollectionOwners({ enabled: signedIn });

  const selectedValue = useMemo(() => {
    const match = location.pathname.match(/^\/collections\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : '__me__';
  }, [location.pathname]);

  const otherOwners = useMemo(() => {
    const currentUserId = me.data?.userId;
    return (owners.data ?? []).filter((owner) => owner.userId !== currentUserId);
  }, [owners.data, me.data?.userId]);

  if (!signedIn) {
    return null;
  }

  const handleChange = (value: string) => {
    if (value === '__me__') {
      navigate(myCollectionPath());
      return;
    }
    navigate(userCollectionPath(value));
  };

  return (
    <label className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-700">
      <span className="sr-only">Browse collection</span>
      <select
        value={selectedValue}
        onChange={(event) => handleChange(event.target.value)}
        className="min-h-11 max-w-[14rem] touch-manipulation rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
        disabled={owners.isLoading || me.isLoading}
      >
        <option value="__me__">My collection</option>
        {otherOwners.map((owner) => (
          <option key={owner.userId} value={owner.userId}>
            {formatCollectionLabel(owner.userId, me.data?.userId, owner.displayName)} ({owner.guitarCount})
          </option>
        ))}
      </select>
    </label>
  );
};
