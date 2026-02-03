"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, coloque un email válido");
      setIsLoading(false);
      return;
    }

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="border-gray-800 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Revisa tu correo</CardTitle>
            <CardDescription>Instrucciones enviadas correctamente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Si estás registrado con este correo, recibirás un enlace para restablecer tu contraseña en unos minutos.
            </p>
            <Button asChild className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11">
              <Link href="/auth/login">Volver al inicio de sesión</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-800 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Restablecer contraseña</CardTitle>
            <CardDescription>
              Introduce tu correo y te enviaremos un enlace para crear una nueva contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Correo electrónico</Label>
                  <Input
                    className="border-gray-600 dark:bg-gray-950/50"
                    id="email"
                    type="email"
                    placeholder="m@ejemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4 text-blue-600 dark:text-blue-400 font-bold"
                >
                  Inicia sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
