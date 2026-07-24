'use client';

import React, {useState, useTransition} from 'react';
import Link from 'next/link';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

import {resetPassword} from '@/actions/auth';
import {useClientDictionary} from '@/lib/i18n/useClientDictionary';
import {resetPasswordSchema, type ResetPasswordInput} from '@/lib/validators/auth';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export default function ResetPasswordPage() {
  const {dict, locale} = useClientDictionary();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = (data: ResetPasswordInput) => {
    setErrorMsg('');
    setSuccessMsg('');
    startTransition(async () => {
      const res = await resetPassword(data);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(dict.auth.resetPasswordSuccess);
      }
    });
  };

  return (
    <Card className="border-border/50 bg-card w-full rounded-[2rem] p-2 shadow-2xl sm:p-4">
      <CardHeader className="space-y-3 pt-8 text-center">
        <CardTitle className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          {dict.auth.resetPassword}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base">{dict.auth.resetPasswordDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold">
              {dict.auth.email}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={dict.auth.emailPlaceholder}
              aria-invalid={!!errors.email}
              {...register('email')}
              className="bg-background/50 focus-visible:ring-ring h-12 rounded-xl"
            />
            {errors.email && (
              <p className="text-destructive text-sm font-medium">
                {dict.auth.errors[errors.email.message as keyof typeof dict.auth.errors]}
              </p>
            )}
          </div>
          {errorMsg && <p className="text-destructive text-center text-sm font-medium">{errorMsg}</p>}
          {successMsg && <p className="text-center text-sm font-medium text-green-500">{successMsg}</p>}
          <div className="pt-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-brand-balance text-primary-foreground h-14 w-full rounded-full text-lg font-bold shadow-lg transition-all duration-300"
              disabled={isPending}>
              {isPending ? '...' : dict.auth.resetPassword}
            </Button>
          </div>
        </form>

        <div className="text-muted-foreground mt-8 pb-4 text-center text-sm font-medium">
          <Link href={`/${locale}/login`} className="text-primary font-bold transition-colors hover:underline">
            {dict.auth.backToLogin}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
