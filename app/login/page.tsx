"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { login, signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Luggage, ArrowLeft, Loader2 } from "lucide-react";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full h-12 text-base font-semibold btn-primary"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Przetwarzanie...
        </>
      ) : (
        children
      )}
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
    <div className="min-h-screen flex items-center justify-center gradient-page px-4 py-8">
      <div className="w-full max-w-md animate-scale-in">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do strony głównej
        </Link>

        <Card className="shadow-elevated border-border/50">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Luggage className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Packing Helper</CardTitle>
            <CardDescription className="text-muted-foreground">
              Zaloguj się lub utwórz konto, aby kontynuować
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  Zaloguj
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  Zarejestruj
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form action={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="twoj@email.com"
                      required
                      autoComplete="email"
                      className={`h-12 rounded-xl ${loginErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {loginErrors.email && (
                      <p className="text-sm text-destructive">{loginErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                      Hasło
                    </Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      minLength={8}
                      className={`h-12 rounded-xl ${loginErrors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
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
                    <Label htmlFor="signup-full_name" className="text-sm font-medium">
                      Imię i nazwisko
                    </Label>
                    <Input
                      id="signup-full_name"
                      name="full_name"
                      type="text"
                      placeholder="Jan Kowalski"
                      required
                      autoComplete="name"
                      minLength={2}
                      maxLength={100}
                      className={`h-12 rounded-xl ${signupErrors.full_name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {signupErrors.full_name && (
                      <p className="text-sm text-destructive">{signupErrors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="twoj@email.com"
                      required
                      autoComplete="email"
                      className={`h-12 rounded-xl ${signupErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {signupErrors.email && (
                      <p className="text-sm text-destructive">{signupErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                      Hasło
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      minLength={8}
                      className={`h-12 rounded-xl ${signupErrors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {signupErrors.password && (
                      <p className="text-sm text-destructive">{signupErrors.password}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Hasło musi mieć minimum 8 znaków
                    </p>
                  </div>

                  <SubmitButton>Utwórz konto</SubmitButton>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
