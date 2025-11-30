import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/lib/supabase/queries/settings";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const settings = await getSettings();
      settings.forEach((setting: any) => {
        setValue(setting.key, setting.value);
      });
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Eroare la încărcarea setărilor");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: any) {
    setSaving(true);
    try {
      await updateSettings(data);
      toast.success("Setări salvate cu succes!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Eroare la salvarea setărilor");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold">Setări Site</h2>
        <p className="text-muted-foreground mt-2">
          Configurează setările generale ale site-ului
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="integrations">Integrări</TabsTrigger>
          </TabsList>

          {/* TAB 1: GENERAL */}
          <TabsContent value="general">
            <Card className="p-6 space-y-6">
              <div>
                <Label htmlFor="site_name">Nume Site</Label>
                <Input
                  id="site_name"
                  {...register("site_name")}
                  placeholder="APOT"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="site_tagline">Tagline</Label>
                <Input
                  id="site_tagline"
                  {...register("site_tagline")}
                  placeholder="Asociația pentru Protejarea Obiectivelor Turistice"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="site_description">Descriere Site</Label>
                <Textarea
                  id="site_description"
                  {...register("site_description")}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Email Contact</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register("contact_email")}
                  placeholder="contact@apot.ro"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Telefon Contact</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  {...register("contact_phone")}
                  placeholder="+40 XXX XXX XXX"
                  className="mt-2"
                />
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: SEO */}
          <TabsContent value="seo">
            <Card className="p-6 space-y-6">
              <div>
                <Label htmlFor="seo_title_template">Template Titlu (Meta Title)</Label>
                <Input
                  id="seo_title_template"
                  {...register("seo_title_template")}
                  placeholder="%s | APOT"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  %s va fi înlocuit cu titlul paginii
                </p>
              </div>

              <div>
                <Label htmlFor="seo_default_description">Descriere Meta Implicită</Label>
                <Textarea
                  id="seo_default_description"
                  {...register("seo_default_description")}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                <Input
                  id="google_analytics_id"
                  {...register("google_analytics_id")}
                  placeholder="G-XXXXXXXXXX"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="gsc_verification">Google Search Console Verification</Label>
                <Input
                  id="gsc_verification"
                  {...register("gsc_verification")}
                  placeholder="content meta tag"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="robots_default">Robots Meta Default</Label>
                <Select
                  value={watch("robots_default")}
                  onValueChange={(value) => setValue("robots_default", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selectează" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index,follow">index, follow</SelectItem>
                    <SelectItem value="noindex,nofollow">noindex, nofollow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: SOCIAL MEDIA */}
          <TabsContent value="social">
            <Card className="p-6 space-y-6">
              <div>
                <Label htmlFor="social_facebook">Facebook Page URL</Label>
                <Input
                  id="social_facebook"
                  {...register("social_facebook")}
                  placeholder="https://facebook.com/apot"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="social_instagram">Instagram Profile</Label>
                <Input
                  id="social_instagram"
                  {...register("social_instagram")}
                  placeholder="https://instagram.com/apot"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="social_youtube">YouTube Channel</Label>
                <Input
                  id="social_youtube"
                  {...register("social_youtube")}
                  placeholder="https://youtube.com/@apot"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="social_twitter">Twitter/X Handle</Label>
                <Input
                  id="social_twitter"
                  {...register("social_twitter")}
                  placeholder="@apot_ro"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Imagine Social Media Implicită (OG Image)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Folosită când o pagină nu are imagine specifică
                </p>
                <ImageUpload
                  bucket="settings"
                  value={watch("social_default_image")}
                  onChange={(url) => setValue("social_default_image", url)}
                />
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: INTEGRĂRI */}
          <TabsContent value="integrations">
            <Card className="p-6 space-y-6">
              <div>
                <Label htmlFor="google_maps_api_key">Google Maps API Key</Label>
                <Input
                  id="google_maps_api_key"
                  type="password"
                  {...register("google_maps_api_key")}
                  placeholder="AIza..."
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pentru hărți interactive
                </p>
              </div>

              <div>
                <Label htmlFor="newsletter_provider">Furnizor Newsletter</Label>
                <Select
                  value={watch("newsletter_provider")}
                  onValueChange={(value) => setValue("newsletter_provider", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selectează" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Niciunul</SelectItem>
                    <SelectItem value="mailchimp">MailChimp</SelectItem>
                    <SelectItem value="convertkit">ConvertKit</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {watch("newsletter_provider") !== "none" && (
                <>
                  <div>
                    <Label htmlFor="newsletter_api_key">Newsletter API Key</Label>
                    <Input
                      id="newsletter_api_key"
                      type="password"
                      {...register("newsletter_api_key")}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newsletter_list_id">Newsletter List ID</Label>
                    <Input
                      id="newsletter_list_id"
                      {...register("newsletter_list_id")}
                      className="mt-2"
                    />
                  </div>
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={saving} size="lg">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvează Setări
          </Button>
        </div>
      </form>
    </div>
  );
}
