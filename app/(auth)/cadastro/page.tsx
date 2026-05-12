import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";

export default function CadastroPage() {
  return (
    <AuthShell title="Criar conta" subtitle="Comece com uma organização e convide sua equipe." footerHref="/login" footerLabel="Já tenho conta">
      <AuthForm mode="register" />
    </AuthShell>
  );
}
