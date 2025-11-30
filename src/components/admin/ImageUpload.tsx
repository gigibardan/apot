import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  bucket?: string;
  folder?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  bucket = "objectives-images",
  folder = "uploads",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Fișierul este prea mare (max 10MB)");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Doar fișiere imagine sunt permise");
        return;
      }

      setUploading(true);

      try {
        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(fileName);

        onChange(publicUrl);
        toast.success("Imagine încărcată cu succes");
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.message || "Eroare la încărcarea imaginii");
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  if (value) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={value}
          alt="Upload preview"
          className="w-full h-48 object-cover rounded-lg border"
        />
        {onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      } ${uploading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Se încarcă...</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm">
              <p className="text-foreground">
                {isDragActive
                  ? "Eliberează pentru a încărca"
                  : "Trage imaginea aici sau click pentru a selecta"}
              </p>
              <p className="text-muted-foreground mt-1">
                JPG, PNG, WEBP (max 10MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
