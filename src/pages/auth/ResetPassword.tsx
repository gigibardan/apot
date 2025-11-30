import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/seo/SEO";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Email invalid"),
});

const passwordSchema = z.object({
  password: z.string().min(8, "Parola trebuie să aibă minim 8 caractere"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  // Check if we're in password update mode (token in URL)
  const hasToken = searchParams.has("token") || searchParams.has("type");
  const isUpdateMode = hasToken;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate email
    try {
      emailSchema.parse({ email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ email: error.errors[0].message });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "Nu am putut trimite emailul. Verifică adresa și încearcă din nou.",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Email trimis!",
          description: "Verifică inbox-ul pentru instrucțiuni de resetare.",
        });
      }
    } catch (error) {
      console.error("Reset error:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Ceva nu a mers bine. Te rugăm să încerci din nou.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate passwords
    try {
      passwordSchema.parse({ password, confirmPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { password?: string; confirmPassword?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as "password" | "confirmPassword"] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "Nu am putut reseta parola. Link-ul poate fi expirat.",
        });
      } else {
        toast({
          title: "Parolă resetată!",
          description: "Parola a fost resetată cu succes. Autentifică-te cu noua parolă.",
        });
        navigate("/auth/login");
      }
    } catch (error) {
      console.error("Update password error:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Ceva nu a mers bine. Te rugăm să încerci din nou.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Resetare Parolă"
        description="Resetează parola pentru contul APOT"
        noindex
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-4xl font-display font-bold text-primary mb-2">
                APOT
              </h1>
            </Link>
            <p className="text-muted-foreground">
              {isUpdateMode ? "Setează Parolă Nouă" : "Resetare Parolă"}
            </p>
          </div>

          {/* Reset Card */}
          <div className="bg-card border rounded-lg shadow-lg p-8">
            {emailSent && !isUpdateMode ? (
              // Success state - email sent
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-display font-bold">
                  Email Trimis!
                </h2>
                <p className="text-muted-foreground">
                  Verifică inbox-ul pentru instrucțiuni de resetare a parolei.
                </p>
                <p className="text-sm text-muted-foreground">
                  Nu ai primit emailul? Verifică folderul spam sau încearcă din nou.
                </p>
                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setEmailSent(false)}
                  >
                    Trimite din nou
                  </Button>
                  <Link to="/auth/login" className="block">
                    <Button variant="ghost" className="w-full">
                      Înapoi la autentificare
                    </Button>
                  </Link>
                </div>
              </div>
            ) : isUpdateMode ? (
              // Update password form
              <>
                <h2 className="text-2xl font-display font-bold mb-6">
                  Setează Parolă Nouă
                </h2>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Parolă Nouă</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minim 8 caractere"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      autoComplete="new-password"
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmă Parola</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Reintroduce parola"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      autoComplete="new-password"
                      className={errors.confirmPassword ? "border-destructive" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Se resetează...
                      </>
                    ) : (
                      "Resetează Parola"
                    )}
                  </Button>
                </form>
              </>
            ) : (
              // Request reset form
              <>
                <h2 className="text-2xl font-display font-bold mb-2">
                  Resetare Parolă
                </h2>
                <p className="text-muted-foreground mb-6">
                  Introdu adresa de email pentru a primi link-ul de resetare.
                </p>

                <form onSubmit={handleRequestReset} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="adresa@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      autoComplete="email"
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Se trimite...
                      </>
                    ) : (
                      "Trimite Link de Resetare"
                    )}
                  </Button>

                  {/* Back to Login */}
                  <div className="text-center">
                    <Link
                      to="/auth/login"
                      className="text-sm text-primary hover:underline"
                    >
                      Înapoi la autentificare
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Back to Site */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Înapoi la site
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
