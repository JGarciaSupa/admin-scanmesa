import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  if (isAuthenticated) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inicie sesión en su cuenta</CardTitle>
              <CardDescription>
                Ingrese su correo electrónico a continuación para iniciar sesión en su cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <FieldGroup>
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                      {error}
                    </div>
                  )}
                  <Field>
                    <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                      <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ paddingRight: "2.5rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={isLoading}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground disabled:opacity-50 focus:outline-none"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                  </Field>
                </FieldGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}