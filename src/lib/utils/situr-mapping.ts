/**
 * SITUR Data Mapping Utilities
 * Funcții pentru procesarea și maparea datelor din lista oficială SITUR
 */

import { SITURRawData, SITURProcessedGuide } from "@/types/guides";

/**
 * Mapează tipul de atestat din SITUR la specializare APOT
 * 
 * Tipuri SITUR:
 * - "National"
 * - "Local"
 * - "Specializat - montan - drumetie montana"
 * - "Specializat - [alte specializări]"
 */
export function mapSITURAttestationType(attestationType: string): string {
  const lowerType = attestationType.toLowerCase();
  
  // Cazuri simple
  if (lowerType === "national") {
    return "Ghid Turistic National";
  }
  
  if (lowerType === "local") {
    return "Ghid Turistic Local";
  }
  
  // Specializări
  if (lowerType.includes("montan") || lowerType.includes("drumetie")) {
    return "Ghid Montan";
  }
  
  if (lowerType.includes("muzeu")) {
    return "Ghid Muzee";
  }
  
  if (lowerType.includes("cultural")) {
    return "Ghid Cultural";
  }
  
  if (lowerType.includes("gastronomic") || lowerType.includes("enogastronomic")) {
    return "Ghid Gastronomic";
  }
  
  if (lowerType.includes("natura") || lowerType.includes("ecologic")) {
    return "Ghid Natură";
  }
  
  if (lowerType.includes("urban")) {
    return "Ghid Urban";
  }
  
  if (lowerType.includes("religios") || lowerType.includes("biseric")) {
    return "Ghid Religios";
  }
  
  if (lowerType.includes("istoric")) {
    return "Ghid Istoric";
  }
  
  if (lowerType.includes("aventura") || lowerType.includes("extrem")) {
    return "Ghid Aventură";
  }
  
  if (lowerType.includes("foto")) {
    return "Ghid Foto";
  }
  
  // Pentru "Specializat - [altceva]", extragem partea specificată
  if (lowerType.includes("specializat")) {
    const parts = attestationType.split("-").map(p => p.trim());
    if (parts.length > 1) {
      // Capitalizăm prima literă
      const specialization = parts.slice(1).join(" - ");
      return "Ghid Specializat: " + specialization.charAt(0).toUpperCase() + specialization.slice(1);
    }
  }
  
  // Default: returnăm tipul original
  return attestationType;
}

/**
 * Parsează data din format românesc (DD.MM.YYYY) în ISO format
 */
export function parseRomanianDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  try {
    // Format: "07.03.2023"
    const parts = dateStr.split(".");
    if (parts.length !== 3) return null;
    
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    
    // Validare basic
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (dayNum < 1 || dayNum > 31) return null;
    if (monthNum < 1 || monthNum > 12) return null;
    if (yearNum < 2000 || yearNum > 2100) return null;
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return null;
  }
}

/**
 * Procesează un rând din CSV-ul SITUR
 */
export function processSITURRow(row: any): SITURProcessedGuide | null {
  try {
    // Validare date obligatorii
    const fullName = row["Nume și prenume"] || row["Nume si prenume"];
    const licenseNumber = row["Nr. atestat"] || row["Nr atestat"];
    const issueDate = row["Data eliberării"] || row["Data eliberarii"];
    const attestationType = row["Tip atestat"];
    
    if (!fullName || !licenseNumber) {
      console.warn("Missing required fields:", { fullName, licenseNumber });
      return null;
    }
    
    // Procesare
    const parsedIssueDate = issueDate ? parseRomanianDate(issueDate) : null;
    const mappedSpecialization = attestationType ? mapSITURAttestationType(attestationType) : "Ghid Turistic";
    
    return {
      full_name: fullName.trim(),
      license_number: licenseNumber.trim(),
      issue_date: parsedIssueDate || new Date().toISOString().split('T')[0],
      attestation_type: attestationType?.trim() || "National",
      specialization: mappedSpecialization,
      data_source: "situr_import_2025",
      verified_status: "imported_official",
      import_date: new Date().toISOString(),
      license_active: true,
      languages: [], // Nu avem din SITUR
      region: null, // Nu avem din SITUR
      phone: null, // Nu avem din SITUR
      email: null, // Nu avem din SITUR
      license_expiry_date: null, // Nu avem din SITUR
    };
  } catch (error) {
    console.error("Error processing SITUR row:", row, error);
    return null;
  }
}

/**
 * Normalizează text pentru căutare fără diacritice
 * Frontend version (pentru filtrare în UI)
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  
  const diacriticsMap: { [key: string]: string } = {
    'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
    'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
  };
  
  return text
    .split('')
    .map(char => diacriticsMap[char] || char)
    .join('')
    .toLowerCase();
}

/**
 * Verifică dacă un text conține un query (fără diacritice)
 */
export function matchesSearch(text: string, query: string): boolean {
  return normalizeText(text).includes(normalizeText(query));
}

/**
 * Generează un preview pentru import
 */
export function generateImportPreview(guides: SITURProcessedGuide[], limit: number = 20): SITURProcessedGuide[] {
  return guides.slice(0, limit);
}

/**
 * Validează datele înainte de import
 */
export function validateSITURData(guides: SITURProcessedGuide[]): {
  valid: SITURProcessedGuide[];
  invalid: { guide: SITURProcessedGuide; reason: string }[];
} {
  const valid: SITURProcessedGuide[] = [];
  const invalid: { guide: SITURProcessedGuide; reason: string }[] = [];
  
  guides.forEach(guide => {
    if (!guide.full_name || guide.full_name.length < 3) {
      invalid.push({ guide, reason: "Nume invalid (prea scurt)" });
      return;
    }
    
    if (!guide.license_number) {
      invalid.push({ guide, reason: "Număr atestat lipsă" });
      return;
    }
    
    valid.push(guide);
  });
  
  return { valid, invalid };
}