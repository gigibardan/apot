import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Mail, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { unsubscribeFromNewsletter } from "@/lib/supabase/mutations/newsletter";

/**
 * Newsletter Unsubscribe Page
 * Allows users to unsubscribe from newsletter
 */
export default function NewsletterUnsubscribe() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await unsubscribeFromNewsletter(email);
      setSuccess(true);
    } catch (error) {
      // Error handling is done in mutation function
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Helmet>
          <title>Dezabonat cu Succes | JInfo</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <Section className="py-24 min-h-screen flex items-center">
          <Container>
            <div className="max-w-md mx-auto">
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">
                    Dezabonat cu Succes
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    Te-ai dezabonat cu succes de la newsletter-ul nostru. Nu vei mai primi emailuri de la noi.
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Ne pare rău să te vedem plecând. Dacă ne-ai putea oferi feedback despre motivul dezabonării, ne-ar ajuta să îmbunătățim serviciile.
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
                      Trimite Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </Section>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dezabonare Newsletter | JInfo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Section className="py-24 min-h-screen flex items-center">
        <Container>
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center p-3 bg-muted rounded-full mb-4">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">
                    Dezabonare Newsletter
                  </h1>
                  <p className="text-muted-foreground">
                    Ne pare rău să te vedem plecând. Introdu email-ul pentru a te dezabona.
                  </p>
                </div>

                <form onSubmit={handleUnsubscribe} className="space-y-4">
                  <div>
                    <label htmlFor="unsubscribe-email" className="text-sm font-medium mb-2 block">
                      Adresa de Email
                    </label>
                    <Input
                      id="unsubscribe-email"
                      type="email"
                      placeholder="exemplu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="destructive"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Se procesează..." : "Dezabonează-mă"}
                  </Button>

                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/")}
                  >
                    Anulează
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-6">
                  Dacă te răzgândești, te poți reabona oricând de pe site-ul nostru.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
