import Link from "next/link";
import { Mail, Lock, User, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Swimmy File to upload and share"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4">
        <div>
          <Label htmlFor="handle" className="mb-1.5 text-xs text-muted-foreground">
            Username
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="handle" placeholder="username" className="pl-9" />
          </div>
        </div>
        <div>
          <Label htmlFor="email" className="mb-1.5 text-xs text-muted-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" className="pl-9" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Disposable email addresses aren&apos;t accepted.
          </p>
        </div>
        <div>
          <Label htmlFor="password" className="mb-1.5 text-xs text-muted-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="••••••••" className="pl-9" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          I&apos;m not a robot
          <div className="ml-auto h-5 w-5 rounded border border-border-strong" />
        </div>

        <Button className="mt-1 w-full bg-gradient-brand text-white hover:opacity-90">
          Create account
        </Button>

        <p className="text-center text-xs text-muted-foreground/70">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          . We&apos;ll send a verification link to your email.
        </p>
      </form>
    </AuthLayout>
  );
}
