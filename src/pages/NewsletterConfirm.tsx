import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { confirmSubscription } from "@/lib/supabase/mutations/newsletter";

/**
 * Newsletter Confirmation Page
 * Handles email confirmation for newsletter subscriptions
 */
export default function NewsletterConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Link de confirmare invalid");
      return;
    }

    handleConfirmation(token);
  }, [searchParams]);

  const handleConfirmation = async (token: string) => {
    try {
      const result = await confirmSubscription(token);
      
      if (result.success) {
        setStatus("success");
        setMessage("Abonarea ta a fost confirmată cu succes!");
      } else {
        setStatus("error");
        setMessage("Link de confirmare invalid sau expirat");
      }
    } catch (error) {
      setStatus("error");
      setMessage("A apărut o eroare la confirmare");
    }
  };

  return (
    <>
      <Helmet>
        <title>Confirmare Abonare Newsletter | JInfo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Section className="py-24 min-h-screen flex items-center">
        <Container>
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                {status === "loading" && (
                  <>
                    <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                    <h1 className="text-2xl font-bold mb-2">
                      Se confirmă abonarea...
                    </h1>
                    <p className="text-muted-foreground">
                      Te rugăm să aștepți câteva momente.
                    </p>
                  </>
                )}

                {status === "success" && (
                  <>
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">
                      Abonare Confirmată!
                    </h1>
                    <p className="text-muted-foreground mb-6">
                      {message}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Vei primi cele mai recente articole, ghiduri turistice și oferte exclusive direct în inbox.
                    </p>
                    <Button onClick={() => navigate("/")} className="w-full">
                      Înapoi la Homepage
                    </Button>
                  </>
                )}

                {status === "error" && (
                  <>
                    <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">
                      Eroare la Confirmare
                    </h1>
                    <p className="text-muted-foreground mb-6">
                      {message}
                    </p>
                    <div className="space-y-3">
                      <Button onClick={() => navigate("/")} className="w-full">
                        Înapoi la Homepage
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate("/contact")} 
                        className="w-full"
                      >
                        Contactează Suportul
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
