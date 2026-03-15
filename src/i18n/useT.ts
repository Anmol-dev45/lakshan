import { useAppSelector } from '../hooks/useStore';
import { translate, type TKey } from './translations';

export function useT() {
  const lang = useAppSelector((s) => s.settings.language);
  return (key: TKey) => translate(key, lang);
}
