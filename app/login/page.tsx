"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { login, signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Przetwarzanie..." : children}
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  async function handleLogin(formData: FormData) {
    setLoginErrors({});
    const result = await login(formData);

    if (!result.success && result.error) {
      toast.error(result.error);
      // Try to extract field-specific errors if available
      if (result.error.includes("email")) {
        setLoginErrors({ email: result.error });
      } else if (result.error.includes("hasło") || result.error.includes("password")) {
        setLoginErrors({ password: result.error });
      }
    } else if (
      result.success &&
      result.data &&
      typeof result.data === "object" &&
      "redirectTo" in result.data
    ) {
      toast.success("Zalogowano pomyślnie!");
      router.push(result.data.redirectTo as string);
      router.refresh();
    }
  }

  async function handleSignup(formData: FormData) {
    setSignupErrors({});
    const result = await signup(formData);

    if (!result.success && result.error) {
      toast.error(result.error);
      // Try to extract field-specific errors if available
      if (result.error.includes("email")) {
        setSignupErrors({ email: result.error });
      } else if (result.error.includes("hasło") || result.error.includes("password")) {
        setSignupErrors({ password: result.error });
      } else if (result.error.includes("Imię") || result.error.includes("full_name")) {
        setSignupErrors({ full_name: result.error });
      }
    } else if (
      result.success &&
      result.data &&
      typeof result.data === "object" &&
      "redirectTo" in result.data
    ) {
      toast.success("Konto utworzone pomyślnie!");
      router.push(result.data.redirectTo as string);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Packing Helper</CardTitle>
          <CardDescription>Zaloguj się lub utwórz konto, aby kontynuować</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Zaloguj</TabsTrigger>
              <TabsTrigger value="signup">Zarejestruj</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <form action={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="twoj@email.com"
                    required
                    autoComplete="email"
                    className={loginErrors.email ? "border-destructive" : ""}
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Hasło</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    minLength={8}
                    className={loginErrors.password ? "border-destructive" : ""}
                  />
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password}</p>
                  )}
                </div>

                <SubmitButton>Zaloguj się</SubmitButton>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form action={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-full_name">Imię i nazwisko</Label>
                  <Input
                    id="signup-full_name"
                    name="full_name"
                    type="text"
                    placeholder="Jan Kowalski"
                    required
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    className={signupErrors.full_name ? "border-destructive" : ""}
                  />
                  {signupErrors.full_name && (
                    <p className="text-sm text-destructive">{signupErrors.full_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="twoj@email.com"
                    required
                    autoComplete="email"
                    className={signupErrors.email ? "border-destructive" : ""}
                  />
                  {signupErrors.email && (
                    <p className="text-sm text-destructive">{signupErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Hasło</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    className={signupErrors.password ? "border-destructive" : ""}
                  />
                  {signupErrors.password && (
                    <p className="text-sm text-destructive">{signupErrors.password}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Hasło musi mieć minimum 8 znaków</p>
                </div>

                <SubmitButton>Utwórz konto</SubmitButton>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
