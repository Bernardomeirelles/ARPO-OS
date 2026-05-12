import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <AuthShell title="Entrar" subtitle="Acesse a operação comercial da sua organização." footerHref="/cadastro" footerLabel="Criar conta">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
