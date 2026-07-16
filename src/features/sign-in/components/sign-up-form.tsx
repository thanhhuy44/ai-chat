import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from '@tanstack/react-router'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { GithubLogoIcon, GoogleLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'

const signUpSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().min(1),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
})

type SignUpBody = z.infer<typeof signUpSchema>

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const navigate = useNavigate()
  const form = useForm<SignUpBody>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (body: SignUpBody) =>
      authClient.signUp.email({
        ...body,
        callbackURL: '/sign-in',
      }),
    onSuccess: (res) => {
      console.log('🚀 ~ SignUpForm ~ res:', res)
      toast('Sign up success!')
      navigate({
        to: '/sign-in',
      })
    },
    onError: (error) => {
      console.log('🚀 ~ SignUpForm ~ error:', error)
    },
  })

  const onSubmit = (body: SignUpBody) => mutation.mutate(body)

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      {...props}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                {...field}
                id="name"
                type="text"
                placeholder="Aa"
                required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input {...field} id="password" type="password" required />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                {...field}
                id="confirm-password"
                type="password"
                required
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button type="submit" disabled={mutation.isPending}>
            Create Account
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button">
              <GithubLogoIcon />
              Sign up with GitHub
            </Button>
            <Button variant="outline" type="button">
              <GoogleLogoIcon />
              Sign up with Google
            </Button>
          </div>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link to={'/sign-in'}>Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
