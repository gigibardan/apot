import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { subscribeToNewsletter, type NewsletterInput } from "@/lib/supabase/mutations/newsletter";
import { cn } from "@/lib/utils";

interface NewsletterSignupProps {
  variant?: "default" | "inline" | "sidebar";
  source?: string;
  className?: string;
}

/**
 * NewsletterSignup Component
 * Secure newsletter subscription form with validation
 * Supports multiple display variants and GDPR compliance
 */
export function NewsletterSignup({ 
  variant = "default",
  source = "website",
  className 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const input: NewsletterInput = {
        email,
        ...(fullName && { full_name: fullName }),
      };

      const result = await subscribeToNewsletter(input, source);
      
      if (result.success) {
        setSuccess(true);
        setEmail("");
        setFullName("");
        
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err: any) {
      // Error handling is done in the mutation function with toasts
      // Set error state only for display purposes
      if (err.name === "ZodError") {
        setError("Te rugăm să verifici datele introduse");
      }
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <Card className={cn("border-green-500/50 bg-green-500/5", className)}>
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Mulțumim pentru abonare!</h3>
          <p className="text-sm text-muted-foreground">
            Verifică-ți emailul pentru a confirma abonarea la newsletter.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Inline variant (for footer)
  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
        <Input
          type="email"
          placeholder="Email-ul tău"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="flex-1"
          aria-label="Adresă de email pentru newsletter"
        />
        <Button 
          type="submit" 
          disabled={loading}
          size="icon"
          aria-label="Abonează-te"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
        </Button>
      </form>
    );
  }

  // Sidebar variant
  if (variant === "sidebar") {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Newsletter</h3>
              <p className="text-xs text-muted-foreground">
                Primește ultimele noutăți
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="text"
              placeholder="Numele tău"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
            <Input
              type="email"
              placeholder="Email-ul tău"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Se procesează...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Abonează-te
                </>
              )}
            </Button>
          </form>
          
          {error && (
            <p className="text-xs text-destructive mt-2">{error}</p>
          )}
          
          <p className="text-xs text-muted-foreground mt-3">
            Respectăm confidențialitatea ta. Poți anula abonarea oricând.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Default variant (full card)
  return (
    <Card className={className}>
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Abonează-te la Newsletter
          </h2>
          <p className="text-muted-foreground">
            Primește cele mai recente articole, ghiduri turistice și oferte exclusive direct în inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newsletter-name" className="text-sm font-medium mb-2 block">
              Nume (opțional)
            </label>
            <Input
              id="newsletter-name"
              type="text"
              placeholder="Numele tău"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="newsletter-email" className="text-sm font-medium mb-2 block">
              Email *
            </label>
            <Input
              id="newsletter-email"
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
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Se procesează...
              </>
            ) : (
              <>
                <Mail className="h-5 w-5 mr-2" />
                Abonează-te Gratuit
              </>
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Prin abonare, ești de acord cu{" "}
          <a href="/termeni" className="underline hover:text-primary">
            Termenii și Condițiile
          </a>{" "}
          noastre. Poți anula abonarea oricând.
        </p>
      </CardContent>
    </Card>
  );
}
