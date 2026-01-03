/**
 * Authorized Guides Admin Page - COMPLETE REDESIGN
 * Modern, mobile-friendly UI cu import SITUR și filtre avansate
 */

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ADMIN_ROUTES } from "@/lib/constants/routes";
import { getAuthorizedGuides, getImportStatistics } from "@/lib/supabase/queries/guides";
import { 
  bulkInsertSITURGuides, 
  bulkDeleteAuthorizedGuides,
  deleteAuthorizedGuide 
} from "@/lib/supabase/mutations/guides";
import { processSITURRow, generateImportPreview, validateSITURData } from "@/lib/utils/situr-mapping";
import { toast } from "sonner";
import { 
  Search, 
  Download, 
  Upload, 
  Shield, 
  FileText,
  Filter,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  FileSpreadsheet,
  Database
} from "lucide-react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import Papa from "papaparse";
import { AuthorizedGuideInput, SITURProcessedGuide, SITURImportStats } from "@/types/guides";
import { formatDate } from "@/lib/utils";

export default function AuthorizedGuidesAdmin() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const siturFileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [search, setSearch] = useState("");
  const [attestationTypeFilter, setAttestationTypeFilter] = useState<string>("all");
  const [dataSourceFilter, setDataSourceFilter] = useState<string>("all");
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<SITURProcessedGuide[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null);
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);

  // Queries
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["authorized-guides", search, attestationTypeFilter, dataSourceFilter],
    queryFn: () => getAuthorizedGuides({ 
      search: search || undefined,
      attestationType: attestationTypeFilter !== "all" ? attestationTypeFilter : undefined,
      dataSource: dataSourceFilter !== "all" ? dataSourceFilter : undefined,
      limit: 100 
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ["authorized-guides-stats"],
    queryFn: getImportStatistics,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteAuthorizedGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorized-guides"] });
      queryClient.invalidateQueries({ queryKey: ["authorized-guides-stats"] });
      toast.success("Ghid șters cu succes");
      setGuideToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la ștergerea ghidului");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteAuthorizedGuides,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorized-guides"] });
      queryClient.invalidateQueries({ queryKey: ["authorized-guides-stats"] });
      toast.success(`${selectedGuides.length} ghizi șterși cu succes`);
      setSelectedGuides([]);
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Eroare la ștergerea ghizilor");
    },
  });

  const guides = data?.guides || [];
  const total = data?.total || 0;

  // Template CSV Manual
  const downloadManualTemplate = () => {
    const csvContent = `full_name,license_number,specialization,languages,region,phone,email,license_active,license_expiry_date
Ion Popescu,GTR123456,Ghid Turistic National,română;engleză,București,0722123456,ion.popescu@example.com,true,2025-12-31
Maria Ionescu,GTR789012,Ghid Montan,română;engleză;franceză,Transilvania,0733456789,maria.ionescu@example.com,true,2026-06-30`;

    downloadCSV(csvContent, "template_ghizi_manual.csv");
  };

  // Template CSV SITUR
  const downloadSITURTemplate = () => {
    const csvContent = `Nume și prenume,Nr. atestat,Data eliberării,Tip atestat
POPESCU ION ADRIAN,12345,07.03.2023,National
IONESCU MARIA,67890,15.06.2022,"Specializat - montan - drumetie montana"
GEORGESCU ANDREI,11111,20.01.2024,Local`;

    downloadCSV(csvContent, "template_ghizi_situr.csv");
  };

  // Helper pentru download CSV
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Import CSV Manual (format vechi)
  const handleManualCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
              data_source: "manual",
              verified_status: "pending",
              import_date: null,
              issue_date: null,
              attestation_type: null,
            }));

          if (guides.length === 0) {
            toast.error("Nu s-au găsit date valide în fișier");
            return;
          }

          const stats = await bulkInsertSITURGuides(guides, true);
          
          toast.success(
            `Import finalizat: ${stats.successfully_imported} ghizi adăugați, ${stats.skipped_duplicates} duplicate skipate`
          );
          
          queryClient.invalidateQueries({ queryKey: ["authorized-guides"] });
          queryClient.invalidateQueries({ queryKey: ["authorized-guides-stats"] });
        } catch (error: any) {
          toast.error(error.message || "Eroare la importul ghizilor");
        } finally {
          setImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },
      error: () => {
        toast.error("Eroare la parsarea fișierului CSV");
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  // Import CSV SITUR (format oficial)
  const handleSITURCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const processedGuides = results.data
            .map(row => processSITURRow(row))
            .filter((guide): guide is SITURProcessedGuide => guide !== null);

          if (processedGuides.length === 0) {
            toast.error("Nu s-au găsit date valide în fișier SITUR");
            setImporting(false);
            return;
          }

          // Validare
          const { valid, invalid } = validateSITURData(processedGuides);

          if (invalid.length > 0) {
            console.warn("Invalid guides:", invalid);
            toast.warning(`${invalid.length} ghizi au fost ignorați din cauza datelor invalide`);
          }

          // Preview
          setImportPreview(valid);
          setImportDialogOpen(true);
        } catch (error: any) {
          toast.error(error.message || "Eroare la procesarea fișierului");
        } finally {
          setImporting(false);
          if (siturFileInputRef.current) {
            siturFileInputRef.current.value = "";
          }
        }
      },
      error: () => {
        toast.error("Eroare la parsarea fișierului CSV");
        setImporting(false);
        if (siturFileInputRef.current) {
          siturFileInputRef.current.value = "";
        }
      },
    });
  };

  // Confirm SITUR Import cu batch processing
  const confirmSITURImport = async () => {
    if (importPreview.length === 0) return;

    setImporting(true);
    setImportDialogOpen(false);

    try {
      // Batch processing - împarte în loturi de 500 pentru stabilitate
      const batchSize = 500;
      const batches = [];
      
      for (let i = 0; i < importPreview.length; i += batchSize) {
        batches.push(importPreview.slice(i, i + batchSize));
      }

      let totalImported = 0;
      let totalSkipped = 0;
      let totalErrors = 0;

      // Procesare batch cu batch cu progress
      for (let i = 0; i < batches.length; i++) {
        const batchNum = i + 1;
        const batch = batches[i];
        
        toast.info(`📦 Procesare batch ${batchNum}/${batches.length} (${batch.length} ghizi)...`, {
          duration: 2000
        });

        const stats = await bulkInsertSITURGuides(batch, true);
        
        totalImported += stats.successfully_imported;
        totalSkipped += stats.skipped_duplicates;
        totalErrors += stats.errors;

        // Pauză mică între batch-uri pentru a nu suprasolicita DB
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast.success(
        `✅ Import SITUR finalizat:\n${totalImported} ghizi importați\n${totalSkipped} duplicate skipate${totalErrors > 0 ? `\n❌ ${totalErrors} erori` : ""}`,
        { duration: 5000 }
      );

      queryClient.invalidateQueries({ queryKey: ["authorized-guides"] });
      queryClient.invalidateQueries({ queryKey: ["authorized-guides-stats"] });
      setImportPreview([]);
    } catch (error: any) {
      toast.error(error.message || "Eroare la importul ghizilor SITUR");
    } finally {
      setImporting(false);
    }
  };

  // Toggle select guide
  const toggleSelectGuide = (id: string) => {
    setSelectedGuides(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  // Select all guides
  const toggleSelectAll = () => {
    if (selectedGuides.length === guides.length) {
      setSelectedGuides([]);
    } else {
      setSelectedGuides(guides.map((g: any) => g.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Breadcrumbs
        items={[
          { label: "Admin", href: ADMIN_ROUTES.dashboard },
          { label: "Ghizi Autorizați", href: ADMIN_ROUTES.authorizedGuides },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            Ghizi Autorizați
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Lista oficială din Direcția Generală Turism (SITUR)
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-1">
                <Database className="h-3 w-3" />
                SITUR
              </CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-blue-600">{stats.situr}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Manual
              </CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-purple-600">{stats.manual}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Oficial
              </CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-green-600">{stats.imported_official}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Pending
              </CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-orange-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Actions Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Import & Acțiuni</CardTitle>
          <CardDescription>
            Importați ghizi din format manual sau din lista oficială SITUR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="situr" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="situr" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Import SITUR</span>
                <span className="sm:hidden">SITUR</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Import Manual</span>
                <span className="sm:hidden">Manual</span>
              </TabsTrigger>
            </TabsList>

            {/* SITUR Import Tab */}
            <TabsContent value="situr" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-900">
                      Format oficial SITUR (Direcția Generală Turism)
                    </p>
                    <p className="text-blue-700">
                      CSV cu coloane: <span className="font-mono">Nume și prenume, Nr. atestat, Data eliberării, Tip atestat</span>
                    </p>
                    <p className="text-blue-600 text-xs">
                      Sursa: <a 
                        href="https://se.situr.gov.ro/OpenData/OpenDataList?type=listaGhizi" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-800"
                      >
                        https://se.situr.gov.ro/OpenData/OpenDataList?type=listaGhizi
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={downloadSITURTemplate}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Template SITUR
                </Button>
                <input
                  ref={siturFileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleSITURCSVUpload}
                  className="hidden"
                  id="situr-upload"
                />
                <Button 
                  disabled={importing}
                  onClick={() => siturFileInputRef.current?.click()}
                  className="flex-1"
                >
                  {importing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Procesare...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import SITUR
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Manual Import Tab */}
            <TabsContent value="manual" className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-purple-900">
                      Format manual cu date complete
                    </p>
                    <p className="text-purple-700">
                      CSV cu toate datele: nume, licență, specializare, limbi, regiune, contact, etc.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={downloadManualTemplate}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Template Manual
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleManualCSVUpload}
                  className="hidden"
                  id="manual-upload"
                />
                <Button 
                  disabled={importing}
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  {importing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Procesare...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Manual
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtre & Căutare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută după nume sau nr. atestat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Attestation Type Filter */}
            <Select value={attestationTypeFilter} onValueChange={setAttestationTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tip atestat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate tipurile</SelectItem>
                <SelectItem value="National">National</SelectItem>
                <SelectItem value="Local">Local</SelectItem>
                <SelectItem value="Specializat">Specializat</SelectItem>
              </SelectContent>
            </Select>

            {/* Data Source Filter */}
            <Select value={dataSourceFilter} onValueChange={setDataSourceFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sursă date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate sursele</SelectItem>
                <SelectItem value="situr_import_2025">SITUR</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedGuides.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                {selectedGuides.length} ghizi selectați
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Șterge selecția
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Afișare <span className="font-semibold text-foreground">{guides.length}</span> din{" "}
          <span className="font-semibold text-foreground">{total}</span> ghizi
        </p>
        {(search || attestationTypeFilter !== "all" || dataSourceFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setAttestationTypeFilter("all");
              setDataSourceFilter("all");
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Resetează filtre
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={selectedGuides.length === guides.length && guides.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Nume</TableHead>
                <TableHead className="hidden md:table-cell">Nr. Atestat</TableHead>
                <TableHead className="hidden lg:table-cell">Tip Atestat</TableHead>
                <TableHead className="hidden xl:table-cell">Data Eliberare</TableHead>
                <TableHead className="hidden sm:table-cell">Specializare</TableHead>
                <TableHead className="hidden md:table-cell">Sursă</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileSpreadsheet className="h-12 w-12 opacity-20" />
                      <p>Nu au fost găsiți ghizi</p>
                      {(search || attestationTypeFilter !== "all" || dataSourceFilter !== "all") && (
                        <p className="text-sm">Încercați să modificați filtrele</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                guides.map((guide: any) => (
                  <TableRow key={guide.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedGuides.includes(guide.id)}
                        onChange={() => toggleSelectGuide(guide.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{guide.full_name}</p>
                        <div className="md:hidden flex flex-wrap gap-1 mt-1">
                          {guide.data_source?.startsWith("situr") && (
                            <Badge variant="default" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              SITUR
                            </Badge>
                          )}
                          {guide.verified_status === "imported_official" && (
                            <Badge variant="secondary" className="text-xs">
                              Oficial
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">
                      {guide.license_number || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {guide.attestation_type ? (
                        <Badge variant="outline">{guide.attestation_type}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {guide.issue_date ? formatDate(guide.issue_date) : "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {guide.specialization || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {guide.data_source?.startsWith("situr") ? (
                        <Badge variant="default" className="gap-1">
                          <Database className="h-3 w-3" />
                          SITUR
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <FileText className="h-3 w-3" />
                          Manual
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {guide.verified_status === "imported_official" ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Oficial
                        </Badge>
                      ) : guide.verified_status === "verified" ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verificat
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setGuideToDelete(guide.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Import Preview Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Preview Import SITUR
            </DialogTitle>
            <DialogDescription>
              Verificați datele înainte de import. Duplicate vor fi skipate automat.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total ghizi</CardDescription>
                  <CardTitle className="text-2xl">{importPreview.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Vor fi importați</CardDescription>
                  <CardTitle className="text-2xl text-green-600">{importPreview.length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nume</TableHead>
                    <TableHead>Nr. Atestat</TableHead>
                    <TableHead>Tip Atestat</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generateImportPreview(importPreview, 10).map((guide, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{guide.full_name}</TableCell>
                      <TableCell className="font-mono text-sm">{guide.license_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{guide.attestation_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(guide.issue_date)}</TableCell>
                    </TableRow>
                  ))}
                  {importPreview.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        ... și încă {importPreview.length - 10} ghizi
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setImportDialogOpen(false);
                  setImportPreview([]);
                }}
              >
                Anulează
              </Button>
              <Button
                onClick={confirmSITURImport}
                disabled={importing}
              >
                {importing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Import în progres...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Confirmă Import ({importPreview.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Single Guide Dialog */}
      <AlertDialog open={!!guideToDelete} onOpenChange={() => setGuideToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi acest ghid autorizat? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => guideToDelete && deleteMutation.mutate(guideToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere bulk</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi {selectedGuides.length} ghizi selectați? 
              Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate(selectedGuides)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Șterge {selectedGuides.length} ghizi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}