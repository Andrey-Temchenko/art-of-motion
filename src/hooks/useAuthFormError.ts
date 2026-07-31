import {useClientDictionary} from '@/lib/i18n/useClientDictionary';

export function useAuthFormError() {
  const {dict} = useClientDictionary();

  const getErrorMessage = (message?: string): string | null => {
    if (!message) return null;
    const errors = dict.auth.errors as Record<string, string>;
    return errors[message] || message;
  };

  return {getErrorMessage};
}
