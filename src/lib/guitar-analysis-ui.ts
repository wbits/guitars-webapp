import type { Guitar } from '@/domain/guitar';
import type { CurrentUser } from '@/api/me';
import { coverPictureUrl } from '@/lib/guitar-cover';

export const canTriggerGuitarAnalysis = (
  guitar: Guitar,
  canEdit: boolean,
  me: Pick<CurrentUser, 'assistantByokConfigured' | 'assistantByokNeedsResave'> | undefined,
): boolean => {
  if (!canEdit || !me?.assistantByokConfigured || me.assistantByokNeedsResave) {
    return false;
  }
  if (!coverPictureUrl(guitar)) {
    return false;
  }
  if (!guitar.analysis) {
    return true;
  }
  return guitar.analysis.status === 'failed';
};

export const showGuitarAnalysisPanel = (
  guitar: Guitar,
  canEdit: boolean,
  me: Pick<CurrentUser, 'assistantByokConfigured' | 'assistantByokNeedsResave'> | undefined,
): boolean => {
  if (guitar.analysis) {
    return true;
  }
  return canTriggerGuitarAnalysis(guitar, canEdit, me);
};
