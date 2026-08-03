import type {ReadonlyURLSearchParams} from 'next/navigation';
import {useSearchParams} from 'next/navigation';

export const useRedirectUrl = (locale: string): string => {
  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || `/${locale}`;

  return redirectUrl;
};
