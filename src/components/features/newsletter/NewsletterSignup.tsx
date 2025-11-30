import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/**
 * NewsletterSignup Component
 * Email capture form with GDPR compliance
 * Phase 1: UI only, backend integration later
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email) {
      toast({
        title: "Email necesar",
        description: "Te rugăm să introduci adresa de email.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Email invalid",
        description: "Te rugăm să introduci o adresă de email validă.",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Acord necesar",
        description: "Te rugăm să accepți Politica de Confidențialitate.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call (Phase 1)
    setIsSubmitting(true);
    
    // TODO: In future, integrate with email service (MailChimp, ConvertKit, etc.)
    console.log("Newsletter signup:", { email, timestamp: new Date() });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({
        title: "Mulțumim! 🎉",
        description: "Vei primi primul newsletter în curând.",
      });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setEmail("");
        setAgreedToTerms(false);
        setIsSuccess(false);
      }, 3000);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-display font-bold text-green-900 dark:text-green-100">
            Mulțumim pentru abonare!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
            Vei primi primul newsletter în curând
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {/* Email Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="adresa@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="pl-10 bg-white dark:bg-background"
            aria-label="Adresa de email"
            required
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || !agreedToTerms}
          className="bg-accent hover:bg-accent/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Se trimite...
            </>
          ) : (
            "Abonează-te"
          )}
        </Button>
      </div>

      {/* GDPR Checkbox */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          disabled={isSubmitting}
          className="mt-0.5"
        />
        <Label
          htmlFor="terms"
          className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
        >
          Sunt de acord cu{" "}
          <a
            href="/politica-confidentialitate"
            className="underline hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Politica de Confidențialitate
          </a>{" "}
          și doresc să primesc newsletter-ul APOT
        </Label>
      </div>
    </form>
  );
}
