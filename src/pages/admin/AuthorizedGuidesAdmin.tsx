import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ADMIN_ROUTES } from "@/lib/constants/routes";
import { getAuthorizedGuides } from "@/lib/supabase/queries/guides";
import { bulkInsertAuthorizedGuides } from "@/lib/supabase/mutations/guides";
import { toast } from "sonner";
import { Search, Download, Upload, Shield } from "lucide-react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import Papa from "papaparse";
import { AuthorizedGuideInput } from "@/types/guides";

export default function AuthorizedGuidesAdmin() {
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["authorized-guides", search],
    queryFn: () => getAuthorizedGuides({ search: search || undefined, limit: 50 }),
  });

  const downloadTemplate = () => {
    const csvContent = `full_name,license_number,specialization,languages,region,phone,email,license_active,license_expiry_date
Ion Popescu,GTR123456,Ghid Turistic,română;engleză;franceză,București,0722123456,ion.popescu@example.com,true,2025-12-31
Maria Ionescu,GTR789012,Ghid Montană,română;engleză,Transilvania,0733456789,maria.ionescu@example.com,true,2026-06-30`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "template_ghizi_autorizati.csv";
    link.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const guides: AuthorizedGuideInput[] = results.data
            .filter((row: any) => row.full_name && row.license_number)
            .map((row: any) => ({
              full_name: row.full_name,
              license_number: row.license_number,
              specialization: row.specialization || null,
              languages: row.languages ? row.languages.split(";") : [],
              region: row.region || null,
              phone: row.phone || null,
              email: row.email || null,
              license_active: row.license_active?.toLowerCase() === "true" || true,
              license_expiry_date: row.license_expiry_date || null,
            }));

          if (guides.length === 0) {
            toast.error("Nu s-au găsit date valide în fișier");
            return;
          }

          await bulkInsertAuthorizedGuides(guides);
          toast.success(`${guides.length} ghizi autorizați au fost importați cu succes`);
          refetch();
        } catch (error: any) {
          toast.error(error.message || "Eroare la importul ghizilor");
        } finally {
          setImporting(false);
          event.target.value = "";
        }
      },
      error: (error) => {
        toast.error("Eroare la parsarea fișierului CSV");
        setImporting(false);
        event.target.value = "";
      },
    });
  };

  const guides = data?.guides || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Admin", href: ADMIN_ROUTES.dashboard },
          { label: "Ghizi Autorizați", href: ADMIN_ROUTES.authorizedGuides },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ghizi Autorizați</h1>
          <p className="text-muted-foreground">
            Lista completă cu ghizii autorizați de Ministerul Turismului
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Template CSV
          </Button>
          <label htmlFor="csv-upload">
            <Button disabled={importing} asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {importing ? "Importare..." : "Import CSV"}
              </span>
            </Button>
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după nume sau număr licență..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total: {data?.count || 0} ghizi autorizați</span>
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume Complet</TableHead>
                  <TableHead>Număr Licență</TableHead>
                  <TableHead>Specializare</TableHead>
                  <TableHead>Limbi</TableHead>
                  <TableHead>Regiune</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nu există ghizi autorizați
                    </TableCell>
                  </TableRow>
                ) : (
                  guides.map((guide) => (
                    <TableRow key={guide.id}>
                      <TableCell className="font-medium">{guide.full_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{guide.license_number}</Badge>
                      </TableCell>
                      <TableCell>
                        {guide.specialization || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {guide.languages?.map((lang) => (
                            <Badge key={lang} variant="secondary" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{guide.region || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {guide.phone && <div>{guide.phone}</div>}
                          {guide.email && <div className="text-muted-foreground">{guide.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {guide.license_active ? (
                          <Badge variant="default">
                            <Shield className="h-3 w-3 mr-1" />
                            Activ
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Inactiv</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
