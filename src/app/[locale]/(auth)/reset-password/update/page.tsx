'use client';

import React, {useState, useTransition} from 'react';
import Link from 'next/link';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {Eye, EyeOff} from 'lucide-react';

import {updatePassword} from '@/actions/auth';
import {useClientDictionary} from '@/lib/i18n/useClientDictionary';
import {updatePasswordSchema, type UpdatePasswordInput} from '@/lib/validators/auth';
import {useAuthFormError} from '@/hooks/useAuthFormError';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {buildRoute, ROUTES} from '@/config/navigation';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const {dict, locale} = useClientDictionary();
  const {getErrorMessage} = useAuthFormError();

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema)
  });

  const onSubmit = (data: UpdatePasswordInput) => {
    setErrorMsg('');
    setSuccessMsg('');
    startTransition(async () => {
      const res = await updatePassword(data);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(dict.auth.updatePasswordSuccess);
        setTimeout(() => {
          router.push(buildRoute(locale, ROUTES.AUTH.LOGIN));
        }, 2000);
      }
    });
  };

  return (
    <Card className="border-border/50 bg-card w-full rounded-[2rem] p-2 shadow-2xl sm:p-4">
      <CardHeader className="space-y-3 pt-8 text-center">
        <CardTitle className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          {dict.auth.updatePassword}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base">{dict.auth.newPassword}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold">
              {dict.auth.newPassword}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={dict.auth.passwordPlaceholder}
                aria-invalid={!!errors.password}
                {...register('password')}
                className="bg-background/50 focus-visible:ring-ring h-12 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? dict.auth.hidePassword : dict.auth.showPassword}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm font-medium">{getErrorMessage(errors.password.message)}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-semibold">
              {dict.auth.confirmPassword}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={dict.auth.passwordPlaceholder}
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
                className="bg-background/50 focus-visible:ring-ring h-12 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? dict.auth.hidePassword : dict.auth.showPassword}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors">
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm font-medium">{getErrorMessage(errors.confirmPassword.message)}</p>
            )}
          </div>
          {errorMsg && <p className="text-destructive text-center text-sm font-medium">{errorMsg}</p>}
          {successMsg && <p className="text-center text-sm font-medium text-green-500">{successMsg}</p>}
          <div className="pt-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-brand-balance text-primary-foreground h-14 w-full rounded-full text-lg font-bold shadow-lg transition-all duration-300"
              disabled={isPending}>
              {isPending ? '...' : dict.auth.updatePassword}
            </Button>
          </div>
        </form>

        <div className="text-muted-foreground mt-8 pb-4 text-center text-sm font-medium">
          <Link
            href={buildRoute(locale, ROUTES.AUTH.LOGIN)}
            className="text-primary font-bold transition-colors hover:underline">
            {dict.auth.backToLogin}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
