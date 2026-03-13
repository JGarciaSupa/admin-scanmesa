import { useState } from "react";
import { useParams } from "react-router";
import { type StaffUser } from "@/services/staff.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import TabPersonal from "@/components/dashboard/TabPersonal";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TENANT = {
  id: 7,
  name: "Inversiones Gastronómicas S.A.C.",
  documentId: "20512345678",
  schemaName: "tenant_la_pizzeria",
  isActive: true,
  subscriptionStart: "2025-01-01T00:00:00Z",
  subscriptionEnd: "2026-01-01T00:00:00Z",
  createdAt: "2024-03-15T10:30:00Z",
  updatedAt: "2025-02-20T14:55:00Z",
};

const MOCK_SETTINGS = {
  name: "La Pizzería del Centro",
  logoUrl: null,
  currency: "PEN",
  defaultTaxRate: "10.00",
  subscriptionStart: "2025-01-01T00:00:00Z",
  subscriptionEnd: "2026-01-01T00:00:00Z",
  latitude: "-12.04318",
  longitude: "-77.02824",
  allowedRadiusMeters: 150,
};



const MOCK_TABLES = [
  { id: 1, name: "Mesa 1",    status: "occupied" },
  { id: 2, name: "Mesa 2",    status: "free" },
  { id: 3, name: "Mesa 3",    status: "free" },
  { id: 4, name: "Barra A",   status: "occupied" },
  { id: 5, name: "Terraza 1", status: "free" },
  { id: 6, name: "VIP 1",     status: "occupied" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (iso) => iso
  ? new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const daysUntil = (iso) => {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ active }) {
  return active
    ? <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Activo
      </Badge>
    : <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Inactivo
      </Badge>;
}

function StatCard({ label, value, sub, accentClass }) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute left-0 top-0 h-full w-1 ${accentClass}`} />
      <CardContent className="pt-5 pl-6">
        <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
        <p className="text-2xl font-extrabold tracking-tight text-foreground leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function SubscriptionBar({ start, end }) {
  if (!start || !end) return <p className="text-sm text-muted-foreground">Sin fechas configuradas.</p>;
  const total = new Date(end) - new Date(start);
  const elapsed = new Date() - new Date(start);
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const days = daysUntil(end);
  const expired = days !== null && days < 0;
  const warning = days !== null && days <= 30 && !expired;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{fmt(start)}</span>
        <Badge variant="outline" className={
          expired ? "text-red-600 border-red-200 bg-red-50" :
          warning  ? "text-amber-600 border-amber-200 bg-amber-50" :
                     "text-indigo-600 border-indigo-200 bg-indigo-50"
        }>
          {expired ? "VENCIDA" : warning ? `Vence en ${days}d` : `${days} días restantes`}
        </Badge>
        <span className="text-xs text-muted-foreground">{fmt(end)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${expired ? "bg-red-500" : warning ? "bg-amber-400" : "bg-indigo-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TenantDetail() {
  const params = useParams();
  const schemaName = params.id!;

  const [tenant, setTenant] = useState(MOCK_TENANT);
  const [settings, setSettings] = useState(MOCK_SETTINGS);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const occupiedTables = MOCK_TABLES.filter(t => t.status === "occupied").length;
  const activeStaff = staff.filter(s => s.isActive).length;
  const subDays = daysUntil(tenant.subscriptionEnd);
  const subExpired = subDays !== null && subDays < 0;
  const subWarning = subDays !== null && subDays <= 30 && !subExpired;

  return (
    <div className="min-h-screen bg-muted/40 p-6 font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-foreground text-background text-sm font-medium px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2">
          ✓ {toast}
        </div>
      )}

      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-1">
          Panel Maestro › Tenants › <span className="text-foreground font-semibold">#{tenant.id}</span>
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{settings.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{tenant.name}</span>
              <span className="w-1 h-1 rounded-full bg-border inline-block" />
              <StatusBadge active={tenant.isActive} />
              {(subExpired || subWarning) && (
                <Badge variant="outline" className={subExpired ? "text-red-600 border-red-200 bg-red-50" : "text-amber-600 border-amber-200 bg-amber-50"}>
                  {subExpired ? "⚠ Suscripción vencida" : `⚠ Vence en ${subDays}d`}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen">
        <TabsList className="mb-6">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="mesas">Mesas</TabsTrigger>
        </TabsList>

        {/* ── Resumen ──────────────────────────────────────────────────────── */}
        <TabsContent value="resumen" className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Mesas Ocupadas"  value={`${occupiedTables}/${MOCK_TABLES.length}`} sub="En este momento"               accentClass="bg-amber-400" />
            <StatCard label="Personal Activo" value={activeStaff}                               sub={`de ${staff.length} registrados`} accentClass="bg-emerald-500" />
            <StatCard label="Días Restantes"  value={subExpired ? "Vencido" : (subDays ?? "—")} sub={subExpired ? `Venció ${fmt(tenant.subscriptionEnd)}` : `Hasta ${fmt(tenant.subscriptionEnd)}`} accentClass={subExpired ? "bg-red-500" : subWarning ? "bg-amber-400" : "bg-indigo-500"} />
            <StatCard label="Estado"          value={tenant.isActive ? "Online" : "Bloqueado"}  sub={`Desde ${fmt(tenant.createdAt)}`} accentClass={tenant.isActive ? "bg-emerald-500" : "bg-red-500"} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Datos del Tenant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {[
                  ["Razón Social", tenant.name],
                  ["RUC / Doc.",   tenant.documentId],
                  ["Schema BD",   <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-indigo-600">{tenant.schemaName}</code>],
                  ["Registrado",  fmt(tenant.createdAt)],
                  ["Actualizado", fmt(tenant.updatedAt)],
                ].map(([k, v], i) => (
                  <div key={i}>
                    {i > 0 && <Separator className="my-2" />}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{k}</span>
                      <span className="text-sm font-medium">{v}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Suscripción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SubscriptionBar start={tenant.subscriptionStart} end={tenant.subscriptionEnd} />
                <Separator />
                {[
                  ["Inicio",      fmt(tenant.subscriptionStart)],
                  ["Vencimiento", fmt(tenant.subscriptionEnd)],
                  ["Estado",      subExpired ? "Vencida" : subWarning ? `Por vencer (${subDays}d)` : "Vigente"],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{k}</span>
                    <span className={`text-sm font-medium ${subExpired && k === "Estado" ? "text-red-600" : subWarning && k === "Estado" ? "text-amber-600" : ""}`}>{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Danger zone */}
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-700 mb-0.5">{tenant.isActive ? "⚠ Suspender Acceso" : "✓ Reactivar Tenant"}</p>
                <p className="text-xs text-muted-foreground">
                  {tenant.isActive
                    ? "Bloqueará todas las peticiones a este restaurante inmediatamente."
                    : "Restaurará el acceso completo al sistema del restaurante."}
                </p>
              </div>
              <Button
                variant={tenant.isActive ? "destructive" : "default"}
                size="sm"
                className={!tenant.isActive ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                onClick={() => { setTenant(t => ({ ...t, isActive: !t.isActive })); showToast(tenant.isActive ? "Tenant suspendido." : "Tenant reactivado."); }}
              >
                {tenant.isActive ? "Suspender" : "Reactivar"}
              </Button>
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* ── Configuración ────────────────────────────────────────────────── */}
        <TabsContent value="configuracion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Datos del Local</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Nombre Comercial",   key: "name",                type: "text"   },
                  { label: "Moneda (ISO)",        key: "currency",            type: "text"   },
                  { label: "IGV por defecto (%)", key: "defaultTaxRate",      type: "text"   },
                  { label: "Radio GPS (metros)",  key: "allowedRadiusMeters", type: "number" },
                  { label: "Latitud",             key: "latitude",            type: "text"   },
                  { label: "Longitud",            key: "longitude",           type: "text"   },
                ].map(({ label, key, type }) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type={type}
                      value={settings[key]}
                      onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Fechas de Suscripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SubscriptionBar start={tenant.subscriptionStart} end={tenant.subscriptionEnd} />
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { label: "Inicio de suscripción", key: "subscriptionStart" },
                  { label: "Fin de suscripción",    key: "subscriptionEnd"   },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type="date"
                      value={tenant[key] ? tenant[key].slice(0, 10) : ""}
                      onChange={e => setTenant(t => ({ ...t, [key]: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => showToast("Configuración guardada correctamente.")}>Guardar Cambios</Button>
          </div>
        </TabsContent>

        {/* ── Personal ─────────────────────────────────────────────────────── */}
        <TabsContent value="personal">
          <TabPersonal 
            tenantIdentifier={schemaName} 
            onStaffUpdate={setStaff}
            showToast={showToast}
          />
        </TabsContent>

        {/* ── Mesas ────────────────────────────────────────────────────────── */}
        <TabsContent value="mesas" className="space-y-4">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Libre ({MOCK_TABLES.filter(t => t.status === "free").length})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Ocupada ({occupiedTables})</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {MOCK_TABLES.map(table => (
              <Card key={table.id} className={`text-center ${table.status === "occupied" ? "border-amber-200 bg-amber-50/60" : "border-emerald-200 bg-emerald-50/60"}`}>
                <CardContent className="pt-5 pb-4 flex flex-col items-center gap-2">
                  <span className="text-3xl">{table.status === "occupied" ? "🍽️" : "🪑"}</span>
                  <p className="font-bold text-sm">{table.name}</p>
                  <Badge variant="outline" className={table.status === "occupied"
                    ? "text-amber-700 border-amber-300 bg-amber-100 text-[10px]"
                    : "text-emerald-700 border-emerald-300 bg-emerald-100 text-[10px]"}>
                    {table.status === "occupied" ? "OCUPADA" : "LIBRE"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}