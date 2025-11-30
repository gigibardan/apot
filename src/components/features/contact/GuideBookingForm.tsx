import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  submitGuideBookingRequest,
  guideBookingSchema,
  type GuideBookingInput,
} from "@/lib/supabase/mutations/contact";

interface GuideBookingFormProps {
  guideId: string;
  guideName: string;
  onSuccess?: () => void;
}

export function GuideBookingForm({
  guideId,
  guideName,
  onSuccess,
}: GuideBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GuideBookingInput>({
    resolver: zodResolver(guideBookingSchema),
    defaultValues: {
      guide_id: guideId,
      number_of_people: 2,
    },
  });

  const onSubmit = async (data: GuideBookingInput) => {
    setIsSubmitting(true);
    try {
      await submitGuideBookingRequest(data);
      reset({ guide_id: guideId, number_of_people: 2 });
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="mb-4 p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium">Cerere rezervare pentru:</p>
        <p className="text-sm text-muted-foreground">{guideName}</p>
      </div>

      <input type="hidden" {...register("guide_id")} />

      <div className="space-y-2">
        <Label htmlFor="booking_name">
          Nume complet <span className="text-destructive">*</span>
        </Label>
        <Input
          id="booking_name"
          type="text"
          placeholder="Ion Popescu"
          {...register("full_name")}
          disabled={isSubmitting}
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="booking_email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="booking_email"
            type="email"
            placeholder="ion@example.com"
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking_phone">
            Telefon <span className="text-destructive">*</span>
          </Label>
          <Input
            id="booking_phone"
            type="tel"
            placeholder="+40 712 345 678"
            {...register("phone")}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferred_date">
            Data preferată <span className="text-destructive">*</span>
          </Label>
          <Input
            id="preferred_date"
            type="date"
            {...register("preferred_date")}
            disabled={isSubmitting}
            min={new Date().toISOString().split("T")[0]}
          />
          {errors.preferred_date && (
            <p className="text-sm text-destructive">{errors.preferred_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="number_of_people">
            Nr. persoane <span className="text-destructive">*</span>
          </Label>
          <Input
            id="number_of_people"
            type="number"
            min="1"
            max="50"
            {...register("number_of_people", { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {errors.number_of_people && (
            <p className="text-sm text-destructive">
              {errors.number_of_people.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_days">Durata (zile, opțional)</Label>
          <Input
            id="duration_days"
            type="number"
            min="1"
            max="30"
            placeholder="3"
            {...register("duration_days", { valueAsNumber: true })}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget_range">Buget estimat (opțional)</Label>
        <Input
          id="budget_range"
          type="text"
          placeholder="Ex: 500-1000 EUR"
          {...register("budget_range")}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="language_preference">Preferință limbă (opțional)</Label>
        <Input
          id="language_preference"
          type="text"
          placeholder="Ex: Română, Engleză"
          {...register("language_preference")}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="special_requests">Cerințe speciale (opțional)</Label>
        <Textarea
          id="special_requests"
          rows={4}
          placeholder="Detalii suplimentare despre cererea ta..."
          {...register("special_requests")}
          disabled={isSubmitting}
          className="resize-none"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Se trimite...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Trimite cererea de rezervare
          </>
        )}
      </Button>
    </form>
  );
}
