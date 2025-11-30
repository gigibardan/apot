import { Card } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Container maxWidth="sm">
        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold">APOT Admin</h1>
              <p className="text-muted-foreground mt-2">
                Autentificare administrator
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                Pagina de autentificare va fi implementată în sesiunea următoare
                cu integrare Supabase pentru:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Login cu email și parolă</li>
                <li>Social authentication (Google, GitHub)</li>
                <li>Password reset</li>
                <li>Session management</li>
                <li>Protected routes</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Coming soon - În dezvoltare
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
