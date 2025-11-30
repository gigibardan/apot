import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/seo/SEO";
import { z } from "zod";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Numele trebuie să aibă minim 2 caractere"),
  email: z.string().email("Email invalid"),
  password: z.string().min(8, "Parola trebuie să aibă minim 8 caractere"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Trebuie să accepți termenii și condițiile",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"],
});

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    try {
      signUpSchema.parse({ fullName, email, password, confirmPassword, acceptTerms });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: {
          fullName?: string;
          email?: string;
          password?: string;
          confirmPassword?: string;
          acceptTerms?: string;
        } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        let errorMessage = "Nu am putut crea contul";

        if (error.message.includes("User already registered")) {
          errorMessage = "Acest email este deja înregistrat";
        } else if (error.message.includes("Password should be")) {
          errorMessage = "Parola nu îndeplinește cerințele de securitate";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Email invalid";
        }

        toast({
          variant: "destructive",
          title: "Eroare la înregistrare",
          description: errorMessage,
        });
      } else {
        setSignUpSuccess(true);
        toast({
          title: "Cont creat cu succes!",
          description: "Verifică emailul pentru a-ți activa contul",
        });
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Ceva nu a mers bine. Te rugăm să încerci din nou.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Înregistrare"
        description="Creează un cont APOT pentru a accesa toate funcționalitățile"
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
            <p className="text-muted-foreground">Creează-ți cont</p>
          </div>

          {/* SignUp Card */}
          <div className="bg-card border rounded-lg shadow-lg p-8">
            {signUpSuccess ? (
              // Success state
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-display font-bold">
                  Cont Creat Cu Succes!
                </h2>
                <p className="text-muted-foreground">
                  Am trimis un email de confirmare la <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Verifică inbox-ul (și folderul spam) și dă click pe linkul de activare.
                </p>
                <div className="pt-4">
                  <Link to="/auth/login">
                    <Button className="w-full">
                      Mergi la Autentificare
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-display font-bold mb-6">
                  Înregistrare
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nume Complet</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Ion Popescu"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isSubmitting}
                      autoComplete="name"
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>

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

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Parolă</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minim 8 caractere"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        autoComplete="new-password"
                        className={errors.password ? "border-destructive" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmă Parola</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
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

                  {/* Terms Checkbox */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                        disabled={isSubmitting}
                        className={errors.acceptTerms ? "border-destructive" : ""}
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm font-normal cursor-pointer leading-tight"
                      >
                        Sunt de acord cu{" "}
                        <Link to="/terms" className="text-primary hover:underline">
                          termenii și condițiile
                        </Link>{" "}
                        și{" "}
                        <Link to="/privacy" className="text-primary hover:underline">
                          politica de confidențialitate
                        </Link>
                      </Label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-sm text-destructive">{errors.acceptTerms}</p>
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
                        Se creează contul...
                      </>
                    ) : (
                      "Creează Cont"
                    )}
                  </Button>

                  {/* Already have account */}
                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Ai deja cont? </span>
                    <Link
                      to="/auth/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Autentifică-te
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
