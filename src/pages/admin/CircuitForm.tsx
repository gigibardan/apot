import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
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
  duration_days: z.number().min(1, "Durata este obligatorie"),
  price_from: z.number().min(0, "Prețul este obligatoriu"),
  thumbnail_url: z.string().min(1, "Imaginea este obligatorie"),
  external_url: z.string().url("URL invalid").min(1, "URL-ul Jinfotours este obligatoriu"),
  featured: z.boolean().optional(),
  order_index: z.number().optional(),
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

      const circuitData = {
        ...data,
        countries: countriesArray,
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
