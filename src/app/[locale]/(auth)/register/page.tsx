'use client';

import React, {useState, useTransition} from 'react';
import Link from 'next/link';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {Eye, EyeOff} from 'lucide-react';

import {signInWithGoogle, signUpWithEmail} from '@/actions/auth';
import {useClientDictionary} from '@/lib/i18n/useClientDictionary';
import {registerSchema, type RegisterInput} from '@/lib/validators/auth';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export default function RegisterPage() {
  const {dict, locale} = useClientDictionary();
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = (data: RegisterInput) => {
    setErrorMsg('');
    startTransition(async () => {
      const res = await signUpWithEmail(data);
      if (res?.error) {
        setErrorMsg(dict.auth.errors.registerFailed || res.error);
      } else {
        router.push(`/${locale}`);
      }
    });
  };

  return (
    <Card className="border-border/50 bg-card w-full rounded-[2rem] p-2 shadow-2xl sm:p-4">
      <CardHeader className="space-y-3 pt-8 text-center">
        <CardTitle className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          {dict.auth.register}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base">{dict.auth.noAccount}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-semibold">
              {dict.auth.fullName}
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder={dict.auth.fullNamePlaceholder}
              aria-invalid={!!errors.fullName}
              {...register('fullName')}
              className="bg-background/50 focus-visible:ring-ring h-12 rounded-xl"
            />
            {errors.fullName && (
              <p className="text-destructive text-sm font-medium">
                {dict.auth.errors[errors.fullName.message as keyof typeof dict.auth.errors]}
              </p>
            )}
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold">
              {dict.auth.password}
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
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm font-medium">
                {dict.auth.errors[errors.password.message as keyof typeof dict.auth.errors]}
              </p>
            )}
          </div>
          {errorMsg && <p className="text-destructive text-center text-sm font-medium">{errorMsg}</p>}
          <div className="pt-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-brand-balance text-primary-foreground h-14 w-full rounded-full text-lg font-bold shadow-lg transition-all duration-300"
              disabled={isPending}
            >
              {isPending ? '...' : dict.auth.register}
            </Button>
          </div>
        </form>

        <div className="relative mt-2 mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="border-border w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs font-medium tracking-wider uppercase">
            <span className="bg-card text-muted-foreground px-4">Or</span>
          </div>
        </div>

        <form action={signInWithGoogle}>
          <Button
            type="submit"
            variant="outline"
            className="text-foreground border-border/80 bg-background hover:bg-secondary hover:border-primary/50 h-14 w-full rounded-full border font-bold shadow-sm transition-all duration-300"
          >
            <svg
              className="mr-3 h-5 w-5"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Continue with Google
          </Button>
        </form>

        <div className="text-muted-foreground mt-8 pb-4 text-center text-sm font-medium">
          {dict.auth.haveAccount}{' '}
          <Link href={`/${locale}/login`} className="text-primary font-bold transition-colors hover:underline">
            {dict.auth.login}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
