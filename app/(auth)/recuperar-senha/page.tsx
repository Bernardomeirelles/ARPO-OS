import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";

export default function ResetPage() {
  return (
    <AuthShell title="Recuperar senha" subtitle="Receba o link de redefinição no e-mail cadastrado." footerHref="/login" footerLabel="Voltar ao login">
      <AuthForm mode="reset" />
    </AuthShell>
  );
}
