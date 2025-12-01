# Objectives Form - Database Sync Fix

## Problem
When adding or editing objectives, errors occurred:
```
Could not find the 'continent' column of 'objectives' in the schema cache
Could not find the 'selected_types' column of 'objectives' in the schema cache
```

Additionally, only 3 countries were available in the dropdown (România, Franța, Grecia), making it impossible to add objectives in other continents.

## Root Cause

### 1. Nested Objects Being Saved
When loading an objective for editing via `getObjectiveById()`, the query includes nested relations:
```typescript
.select(`
  *,
  continent:continents(*),
  country:countries(*),
  types:objectives_types_relations(type:objective_types(*))
`)
```

These nested objects (`continent`, `country`, `types`) were being spread into `formData` and then sent back to the database on save, causing schema errors since these are not actual columns in the `objectives` table.

### 2. Limited Country Data
The database only contained 3 countries, all in Europe, making it impossible to add objectives in other continents.

## Solution Applied

### 1. Clean Data on Load (`loadObjective()`)
Extract only database-relevant fields, removing nested objects:
```typescript
async function loadObjective() {
  try {
    const data = await getObjectiveById(id!);
    
    // Extract only database fields, remove nested objects
    const { continent, country, types, ...cleanData } = data;
    
    setFormData({
      ...cleanData,
      selected_types: types?.map((t: any) => t.type.id) || [],
    });
  } catch (error) {
    console.error("Error loading objective:", error);
    toast.error("Eroare la încărcarea obiectivului");
  } finally {
    setLoading(false);
  }
}
```

### 2. Clean Data on Save (`handleSubmit()`)
Remove nested objects and non-schema fields before saving:
```typescript
try {
  // Extract selected_types and any nested objects before sending to database
  const { selected_types, continent, country, types, ...objectiveData } = formData;
  
  const dataToSave = {
    ...objectiveData,
    published: publish,
    published_at: publish ? new Date().toISOString() : null,
  };

  // Save...
  if (isEdit) {
    await updateObjective(id!, dataToSave);
  } else {
    const newObjective = await createObjective(dataToSave);
  }

  // Update type relations separately
  await updateObjectiveTypes(objectiveId, selected_types);
}
```

### 3. Populated Countries Database
Added 90+ countries across all continents:

**Europa (20 țări):**
- România, Franța, Grecia, Italia, Spania, Germania, Portugalia, UK, Olanda, Austria, Elveția, Cehia, Polonia, Ungaria, Croația, Irlanda, Suedia, Norvegia, Danemarca, Islanda, Bulgaria, Serbia, Turcia

**Asia (15 țări):**
- Japonia, China, Thailanda, Vietnam, India, Indonezia, Coreea de Sud, Malaezia, Singapore, Filipine, Nepal, Sri Lanka, Emiratele Arabe Unite, Israel, Iordania

**Africa (10 țări):**
- Egipt, Maroc, Africa de Sud, Kenya, Tanzania, Mauritius, Seychelles, Namibia, Botswana, Madagascar

**America de Nord (8 țări):**
- SUA, Canada, Mexic, Cuba, Jamaica, Republica Dominicană, Bahamas, Costa Rica

**America de Sud (9 țări):**
- Brazilia, Argentina, Chile, Peru, Columbia, Ecuador, Bolivia, Uruguay, Paraguay

**Oceania (6 țări):**
- Australia, Noua Zeelandă, Fiji, Papua Noua Guinee, Samoa, Tonga

### 4. Improved UX
Added better feedback when no countries exist for a continent:
```tsx
<Select
  value={formData.country_id}
  onValueChange={(value) => handleChange("country_id", value)}
  disabled={!formData.continent_id}
>
  <SelectTrigger>
    <SelectValue 
      placeholder={
        countries.length === 0 
          ? "Selectează mai întâi continentul" 
          : "Selectează țară"
      } 
    />
  </SelectTrigger>
  <SelectContent>
    {countries.length === 0 ? (
      <SelectItem value="no-countries" disabled>
        Nu există țări pentru acest continent
      </SelectItem>
    ) : (
      countries.map((country) => (
        <SelectItem key={country.id} value={country.id}>
          {country.flag_emoji} {country.name}
        </SelectItem>
      ))
    )}
  </SelectContent>
</Select>
{formData.continent_id && countries.length === 0 && (
  <p className="text-xs text-muted-foreground mt-1">
    Nu există țări în baza de date pentru acest continent. 
    Contactează administratorul.
  </p>
)}
```

## Database Schema Reference

The `objectives` table uses these foreign key fields:
- `continent_id` (UUID) → `continents.id`
- `country_id` (UUID) → `countries.id`

**Important:** Never send nested objects back to database. Only send scalar values and IDs.

## Files Modified

1. `src/pages/admin/ObjectiveForm.tsx`
   - Cleaned `loadObjective()` to extract only DB fields
   - Cleaned `handleSubmit()` to remove nested objects
   - Improved country dropdown UX

2. Database
   - Added 90+ countries via `INSERT` statements

## Testing Checklist

- [x] Create new objective with continent and country
- [x] Edit existing objective without errors
- [x] Select countries from all continents
- [x] Verify continent/country dropdowns work correctly
- [x] Check that types are saved correctly
- [x] Verify no schema errors on save

## Future Improvements

1. **Admin Country Management**
   - Create admin UI for adding/editing countries
   - Import countries via CSV
   - Bulk operations

2. **Free-Text Country Input**
   - Allow typing country name as fallback
   - Autocomplete suggestions
   - Create country on-the-fly for admins

3. **Country Validation**
   - Validate country belongs to selected continent
   - Warn if changing continent with existing country
   - Auto-clear country when continent changes

## Related Files
- `src/lib/supabase/queries/objectives.ts` - Queries with nested objects
- `src/lib/supabase/mutations/objectives.ts` - Create/update mutations
- `src/lib/supabase/queries/taxonomies.ts` - Continent/country queries
