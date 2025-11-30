import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">
          Dashboard
        </h2>
        <p className="text-muted-foreground mt-2">
          Prezentare generală a platformei APOT
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Obiective
            </p>
            <p className="text-3xl font-bold">-</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Articole Blog
            </p>
            <p className="text-3xl font-bold">-</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Media Files
            </p>
            <p className="text-3xl font-bold">-</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Vizitatori
            </p>
            <p className="text-3xl font-bold">-</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-display font-semibold mb-4">
          Acțiuni Rapide
        </h3>
        <p className="text-muted-foreground">
          Dashboard-ul complet va fi implementat în fazele următoare, incluzând:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Statistici detaliate despre obiective și vizitatori</li>
          <li>Grafice pentru analytics</li>
          <li>Activitate recentă și notificări</li>
          <li>Acțiuni rapide pentru administrare</li>
          <li>SEO insights și performance metrics</li>
        </ul>
      </Card>
    </div>
  );
}
