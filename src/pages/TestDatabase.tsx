import { useEffect, useState } from "react";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/layout/Container";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  getContinents,
  getObjectiveTypes,
} from "@/lib/supabase/queries/taxonomies";
import { getObjectives } from "@/lib/supabase/queries/objectives";
import type { Continent, ObjectiveType } from "@/types/database.types";

/**
 * Database Connection Test Page
 * Tests Supabase integration and displays sample data
 */
export default function TestDatabase() {
  const [continents, setContinents] = useState<Continent[]>([]);
  const [types, setTypes] = useState<ObjectiveType[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        setLoading(true);
        setError(null);

        // Test all query functions in parallel
        const [continentsData, typesData, objectivesData] = await Promise.all([
          getContinents(),
          getObjectiveTypes(),
          getObjectives({ limit: 5 }),
        ]);

        setContinents(continentsData);
        setTypes(typesData);
        setObjectives(objectivesData.data);
      } catch (err: any) {
        console.error("Database test error:", err);
        setError(err.message || "Failed to connect to database");
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) {
    return (
      <>
        <SEO title="Database Test" noindex />
        <Container className="py-24 flex justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">
              Testing database connection...
            </p>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO title="Database Test - Error" noindex />
        <Container className="py-24">
          <div className="max-w-2xl mx-auto">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <span className="text-destructive font-bold text-xl">✕</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-destructive mb-2">
                    Database Connection Error
                  </h2>
                  <p className="text-sm text-destructive/80 mb-4">{error}</p>
                  <div className="bg-background/50 rounded p-4 text-sm">
                    <p className="font-semibold mb-2">Troubleshooting:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Verify Supabase credentials in environment variables</li>
                      <li>Check if database tables exist</li>
                      <li>Ensure Row Level Security policies are configured</li>
                      <li>Review browser console for detailed errors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEO title="Database Connection Test" noindex />
      <Container className="py-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Database Connection Test</h1>
            <p className="text-muted-foreground">
              Testing Supabase integration and displaying sample data from all tables.
            </p>
          </div>

          <div className="space-y-8">
            {/* Continents Section */}
            <section className="border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Continents</h2>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {continents.length} found
                </span>
              </div>
              {continents.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No continents data. Please run seed script.
                </p>
              ) : (
                <div className="grid gap-3">
                  {continents.map((continent) => (
                    <div
                      key={continent.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{continent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          /{continent.slug}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Order: {continent.order_index}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Objective Types Section */}
            <section className="border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Objective Types</h2>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {types.length} found
                </span>
              </div>
              {types.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No objective types. Please run seed script.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {types.map((type) => (
                    <div
                      key={type.id}
                      className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg text-center"
                    >
                      {type.icon && (
                        <span className="text-3xl">{type.icon}</span>
                      )}
                      <p className="font-medium text-sm">{type.name}</p>
                      <p className="text-xs text-muted-foreground">
                        /{type.slug}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Objectives Section */}
            <section className="border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Objectives</h2>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {objectives.length} found
                </span>
              </div>
              {objectives.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    No objectives yet in database.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Database is ready to receive content via Admin CMS.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {objectives.map((obj: any) => (
                    <div
                      key={obj.id}
                      className="p-4 bg-muted/30 rounded-lg"
                    >
                      <p className="font-semibold mb-1">{obj.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {obj.country?.flag_emoji && (
                          <span>{obj.country.flag_emoji}</span>
                        )}
                        <span>{obj.country?.name || "No country"}</span>
                        <span>•</span>
                        <span>{obj.continent?.name || "No continent"}</span>
                      </div>
                      {obj.excerpt && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {obj.excerpt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Success Message */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">✓</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-primary mb-2">
                    Database Connected Successfully!
                  </h3>
                  <p className="text-sm text-primary/80 mb-4">
                    Supabase integration is working correctly. All query functions
                    tested and operational.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Continents</p>
                      <p className="text-muted-foreground">{continents.length} loaded</p>
                    </div>
                    <div>
                      <p className="font-semibold">Types</p>
                      <p className="text-muted-foreground">{types.length} loaded</p>
                    </div>
                    <div>
                      <p className="font-semibold">Objectives</p>
                      <p className="text-muted-foreground">{objectives.length} loaded</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Run database seed scripts to populate initial data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Configure Row Level Security policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Implement Admin CMS for content creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Set up authentication for admin access</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
