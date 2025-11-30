import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  submitObjectiveInquiry,
  objectiveInquirySchema,
  type ObjectiveInquiryInput,
} from "@/lib/supabase/mutations/contact";

interface ObjectiveInquiryFormProps {
  objectiveId: string;
  objectiveTitle: string;
  onSuccess?: () => void;
}

export function ObjectiveInquiryForm({
  objectiveId,
  objectiveTitle,
  onSuccess,
}: ObjectiveInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ObjectiveInquiryInput>({
    resolver: zodResolver(objectiveInquirySchema),
    defaultValues: {
      objective_id: objectiveId,
    },
  });

  const onSubmit = async (data: ObjectiveInquiryInput) => {
    setIsSubmitting(true);
    try {
      await submitObjectiveInquiry(data);
      reset({ objective_id: objectiveId });
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
        <p className="text-sm font-medium">Întrebare despre:</p>
        <p className="text-sm text-muted-foreground">{objectiveTitle}</p>
      </div>

      <input type="hidden" {...register("objective_id")} />

      <div className="space-y-2">
        <Label htmlFor="inquiry_name">
          Nume <span className="text-destructive">*</span>
        </Label>
        <Input
          id="inquiry_name"
          type="text"
          placeholder="Ion Popescu"
          {...register("full_name")}
          disabled={isSubmitting}
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiry_email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="inquiry_email"
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
        <Label htmlFor="inquiry_phone">Telefon (opțional)</Label>
        <Input
          id="inquiry_phone"
          type="tel"
          placeholder="+40 712 345 678"
          {...register("phone")}
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="visit_date">Data vizitei (opțional)</Label>
          <Input
            id="visit_date"
            type="date"
            {...register("visit_date")}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="number_of_people">Nr. persoane (opțional)</Label>
          <Input
            id="number_of_people"
            type="number"
            min="1"
            max="100"
            placeholder="2"
            {...register("number_of_people", { valueAsNumber: true })}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiry_message">
          Mesaj <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="inquiry_message"
          rows={5}
          placeholder="Întrebarea ta despre acest obiectiv..."
          {...register("message")}
          disabled={isSubmitting}
          className="resize-none"
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Se trimite...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Trimite întrebarea
          </>
        )}
      </Button>
    </form>
  );
}
