"use client";

import { cn } from "@/lib/utils";
import { signUpAction } from '@/app/auth/login/actions';
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from 'lucide-react';

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, coloque un email válido");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const result = await signUpAction(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-gray-800 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white">Crear cuenta</CardTitle>
          <CardDescription>Regístrate para empezar a acortar tus enlaces</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
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
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-900 dark:text-gray-100">Contraseña</Label>
                <div className="relative">
                  <Input
                    className="border-gray-600 dark:bg-gray-950/50 pr-10"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password" className="text-gray-900 dark:text-gray-100">Repetir contraseña</Label>
                <div className="relative">
                  <Input
                    className="border-gray-600 dark:bg-gray-950/50 pr-10"
                    id="repeat-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/auth/login" className="underline underline-offset-4 text-blue-600 dark:text-blue-400 font-bold">
                Inicia sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
