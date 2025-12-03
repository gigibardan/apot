import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { ADMIN_ROUTES } from "@/lib/constants/routes";
import { createCircuit, updateCircuit } from "@/lib/supabase/mutations/circuits";
import { getCircuitById } from "@/lib/supabase/queries/jinfotours";
import { slugify } from "@/lib/utils";

const circuitSchema = z.object({
  title: z.string().min(1, "Titlul este obligatoriu").max(200),
  slug: z.string().min(1, "Slug-ul este obligatoriu"),
  description: z.string().max(500).optional(),
  countries: z.string().optional(),
  highlights: z.string().optional(),
  duration_days: z.number().min(1, "Durata este obligatorie"),
  price_from: z.number().min(0, "Prețul este obligatoriu"),
  thumbnail_url: z.string().min(1, "Imaginea este obligatorie"),
  external_url: z.string().url("URL invalid").min(1, "URL-ul Jinfotours este obligatoriu"),
  featured: z.boolean().optional(),
  order_index: z.number().optional(),
  // Discount fields
  discount_percentage: z.number().min(0).max(100).optional(),
  original_price: z.number().min(0).optional(),
  discount_until: z.string().optional(),
  // Badge fields
  badge_text: z.string().max(50).optional(),
  badge_color: z.enum(['accent', 'destructive', 'secondary']).optional(),
});

type CircuitFormData = z.infer<typeof circuitSchema>;

export default function CircuitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CircuitFormData>({
    resolver: zodResolver(circuitSchema),
    defaultValues: {
      featured: false,
      order_index: 0,
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const featured = watch("featured");
  const discountPercentage = watch("discount_percentage");
  const badgeColor = watch("badge_color");

  // Auto-generate slug from title
  useEffect(() => {
    if (title && (!id || !slug)) {
      setValue("slug", slugify(title));
    }
  }, [title, id, slug, setValue]);

  // Load circuit data if editing
  useEffect(() => {
    if (id) {
      loadCircuit();
    }
  }, [id]);

  async function loadCircuit() {
    try {
      const circuit = await getCircuitById(id!);
      if (circuit) {
        Object.keys(circuit).forEach((key) => {
          if (key === "countries" && Array.isArray(circuit.countries)) {
            setValue("countries", circuit.countries.join(", "));
          } else if (key === "highlights" && Array.isArray(circuit.highlights)) {
            setValue("highlights", circuit.highlights.join(", "));
          } else {
            setValue(key as any, circuit[key as keyof typeof circuit]);
          }
        });
      }
    } catch (error) {
      console.error("Error loading circuit:", error);
      toast.error("Eroare la încărcarea circuitului");
    } finally {
      setLoadingData(false);
    }
  }

  async function onSubmit(data: CircuitFormData) {
    setLoading(true);
    try {
      // Convert countries string to array
      const countriesArray = data.countries
        ? data.countries.split(",").map((c) => c.trim()).filter(Boolean)
        : [];

      // Convert highlights string to array
      const highlightsArray = data.highlights
        ? data.highlights.split(",").map((h) => h.trim()).filter(Boolean)
        : [];

      const circuitData = {
        ...data,
        countries: countriesArray,
        highlights: highlightsArray,
      };

      if (id) {
        await updateCircuit(id, circuitData as any);
        toast.success("Circuit salvat cu succes!");
      } else {
        await createCircuit(circuitData as any);
        toast.success("Circuit creat cu succes!");
        navigate(ADMIN_ROUTES.circuits);
      }
    } catch (error) {
      console.error("Error saving circuit:", error);
      toast.error("Eroare la salvarea circuitului");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Circuite", href: ADMIN_ROUTES.circuits },
          { label: id ? "Editează" : "Circuit Nou" },
        ]}
      />
      
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold">
          {id ? "Editează Circuit" : "Circuit Nou"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {id ? `Modifică circuitul "${title}"` : "Adaugă un circuit nou Jinfotours"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 space-y-6">
          <div>
            <Label htmlFor="title">Titlu Circuit *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="ex: Circuit Complet Egipt - Cairo și Piramide"
              className="mt-2"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="circuit-egipt-cairo"
              className="mt-2"
            />
            {errors.slug && (
              <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descriere Scurtă</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descriere pentru preview"
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="countries">Destinații (separate prin virgulă)</Label>
            <Input
              id="countries"
              {...register("countries")}
              placeholder="ex: Egipt, Cairo, Giza"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="highlights">Highlights (separate prin virgulă)</Label>
            <Textarea
              id="highlights"
              {...register("highlights")}
              placeholder="ex: Croazieră Nil, Piramidele Giza, Muzeul Egiptean"
              rows={2}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Punctele forte ale circuitului
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration_days">Durată (zile) *</Label>
              <Input
                id="duration_days"
                type="number"
                {...register("duration_days", { valueAsNumber: true })}
                placeholder="7"
                className="mt-2"
              />
              {errors.duration_days && (
                <p className="text-sm text-destructive mt-1">{errors.duration_days.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price_from">Preț de la (EUR) *</Label>
              <Input
                id="price_from"
                type="number"
                {...register("price_from", { valueAsNumber: true })}
                placeholder="999"
                className="mt-2"
              />
              {errors.price_from && (
                <p className="text-sm text-destructive mt-1">{errors.price_from.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Imagine Circuit *</Label>
            <ImageUpload
              bucket="circuits-images"
              value={watch("thumbnail_url")}
              onChange={(url) => setValue("thumbnail_url", url)}
            />
            {errors.thumbnail_url && (
              <p className="text-sm text-destructive mt-1">
                {errors.thumbnail_url.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="external_url">URL Jinfotours *</Label>
            <Input
              id="external_url"
              {...register("external_url")}
              placeholder="https://jinfotours.ro/circuite/egipt-cairo"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Link complet către circuitul pe site-ul Jinfotours
            </p>
            {errors.external_url && (
              <p className="text-sm text-destructive mt-1">{errors.external_url.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={featured}
              onCheckedChange={(checked) => setValue("featured", checked)}
            />
            <Label htmlFor="featured">Featured (Afișează pe homepage)</Label>
          </div>

          <div>
            <Label htmlFor="order_index">Index Sortare (Opțional)</Label>
            <Input
              id="order_index"
              type="number"
              {...register("order_index", { valueAsNumber: true })}
              placeholder="0"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pentru sortare manuală (0 = primul)
            </p>
          </div>

          {/* Discount Section */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Oferte și Reduceri</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_percentage">Reducere (%)</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    {...register("discount_percentage", { valueAsNumber: true })}
                    placeholder="0"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Procentul de reducere (0-100)
                  </p>
                </div>

                <div>
                  <Label htmlFor="original_price">Preț Original (EUR)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    {...register("original_price", { valueAsNumber: true })}
                    placeholder="1299"
                    className="mt-2"
                    disabled={!discountPercentage || discountPercentage === 0}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Necesar dacă ai reducere
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="discount_until">Reducere Validă Până La</Label>
                <Input
                  id="discount_until"
                  type="datetime-local"
                  {...register("discount_until")}
                  className="mt-2"
                  disabled={!discountPercentage || discountPercentage === 0}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Data și ora limită pentru oferta specială
                </p>
              </div>
            </div>
          </div>

          {/* Badge Section */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Badge Personalizat</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="badge_text">Text Badge (Opțional)</Label>
                <Input
                  id="badge_text"
                  {...register("badge_text")}
                  placeholder="ex: Ofertă Limitată, Popular, Nou"
                  className="mt-2"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Text scurt pentru badge promoțional (max 50 caractere)
                </p>
              </div>

              <div>
                <Label htmlFor="badge_color">Culoare Badge</Label>
                <Select
                  value={badgeColor || 'accent'}
                  onValueChange={(value) => setValue("badge_color", value as any)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selectează culoarea" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accent">Accent (Albastru)</SelectItem>
                    <SelectItem value="destructive">Destructive (Roșu)</SelectItem>
                    <SelectItem value="secondary">Secondary (Gri)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Culoarea badge-ului personalizat
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ADMIN_ROUTES.circuits)}
          >
            Anulează
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {id ? "Salvează" : "Creează Circuit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
