import { useState, useEffect, useMemo } from "react";
import { staffService, type StaffUser } from "@/services/staff.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Constants & Helpers ──────────────────────────────────────────────────────
const ROLE_CONFIG = {
  admin:   { label: "Admin",  variant: "outline", color: "text-amber-600 border-amber-300 bg-amber-50"   },
  waiter:  { label: "Mozo",   variant: "outline", color: "text-blue-600 border-blue-300 bg-blue-50"     },
  kitchen: { label: "Cocina", variant: "outline", color: "text-emerald-600 border-emerald-300 bg-emerald-50" },
};

function StatusBadge({ active }: { active: boolean }) {
  return active
    ? <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Activo
      </Badge>
    : <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Inactivo
      </Badge>;
}

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || { label: role, color: "" };
  return <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>;
}

// ─── Create Staff Modal ───────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", email: "", password: "", role: "waiter" as const };

interface CreateStaffModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

function CreateStaffModal({ open, onClose, onCreate }: CreateStaffModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<any>({});
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e: any = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (form.password.length < 8) e.password = "Mínimo 8 caracteres";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onCreate({ ...form, id: Date.now(), isActive: true });
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const handleClose = () => { setForm(EMPTY_FORM); setErrors({}); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Personal</DialogTitle>
          <p className="text-sm text-muted-foreground">Crea un usuario para este restaurante.</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="staff-name">Nombre completo</Label>
            <Input
              id="staff-name"
              placeholder="Ej: María García"
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors((er: any) => ({ ...er, name: undefined })); }}
              className={errors.name ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="staff-email">Correo electrónico</Label>
            <Input
              id="staff-email"
              type="email"
              placeholder="correo@restaurante.pe"
              value={form.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors((er: any) => ({ ...er, email: undefined })); }}
              className={errors.email ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="staff-password">Contraseña temporal</Label>
            <div className="relative">
              <Input
                id="staff-password"
                type={showPass ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors((er: any) => ({ ...er, password: undefined })); }}
                className={`pr-10 ${errors.password ? "border-red-400 focus-visible:ring-red-300" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Rol */}
          <div className="space-y-1.5">
            <Label>Rol</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "admin",   label: "Admin",  icon: "🛡️", desc: "Acceso total"      },
                { value: "waiter",  label: "Mozo",   icon: "🍽️", desc: "Atención de mesas" },
                { value: "kitchen", label: "Cocina", icon: "👨‍🍳", desc: "Vista de pedidos"  },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r.value as any }))}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-center transition-all cursor-pointer
                    ${form.role === r.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-border bg-muted/30 hover:border-muted-foreground/30"
                    }`}
                >
                  <span className="text-xl">{r.icon}</span>
                  <span className={`text-xs font-bold ${form.role === r.value ? "text-indigo-700" : "text-foreground"}`}>{r.label}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Crear Usuario</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface TabPersonalProps {
  tenantIdentifier: string;
  onStaffUpdate?: (staff: StaffUser[]) => void;
  showToast: (msg: string) => void;
}

export default function TabPersonal({ tenantIdentifier, onStaffUpdate, showToast }: TabPersonalProps) {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [staffFilter, setStaffFilter] = useState("all");

  const loadStaff = async () => {
    setIsLoadingStaff(true);
    try {
      const res = await staffService.getAll(tenantIdentifier);
      if (res.success && res.data) {
        setStaff(res.data);
        onStaffUpdate?.(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast("Error al cargar personal");
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [tenantIdentifier]);

  const handleCreateStaff = async (m: any) => {
    try {
      const res = await staffService.create(tenantIdentifier, m);
      if (res.success && res.data) {
        const newStaff = [res.data, ...staff];
        setStaff(newStaff);
        onStaffUpdate?.(newStaff);
        showToast(`Usuario "${m.name}" creado correctamente.`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || "Error al crear staff");
    }
  };

  const toggleStaffActive = async (id: number, currentActive: boolean) => {
    try {
      const res = await staffService.update(tenantIdentifier, id, { isActive: !currentActive });
      if (res.success && res.data) {
        const newStaff = staff.map(m => m.id === id ? res.data! : m);
        setStaff(newStaff);
        onStaffUpdate?.(newStaff);
        showToast(`Estado actualizado correctamente.`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || "Error al actualizar estado");
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      const res = await staffService.delete(tenantIdentifier, id);
      if (res.success) {
        const newStaff = staff.filter(m => m.id !== id);
        setStaff(newStaff);
        onStaffUpdate?.(newStaff);
        showToast("Usuario eliminado correctamente.");
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || "Error al eliminar usuario");
    }
  };

  const activeStaffCount = staff.filter(s => s.isActive).length;

  const filteredStaff = useMemo(() => {
    return staff.filter(s =>
      staffFilter === "all"      ? true :
      staffFilter === "active"   ? s.isActive :
      staffFilter === "inactive" ? !s.isActive :
      s.role === staffFilter
    );
  }, [staff, staffFilter]);

  return (
    <>
      <CreateStaffModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreate={handleCreateStaff} 
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Personal del Restaurante</CardTitle>
            <Badge variant="secondary">{activeStaffCount} activos · {staff.length} total</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={staffFilter} onValueChange={setStaffFilter}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="waiter">Mozos</SelectItem>
                <SelectItem value="kitchen">Cocina</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>+ Nuevo Usuario</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingStaff ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Cargando personal...
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No hay usuarios para este filtro.
                  </TableCell>
                </TableRow>
              ) : filteredStaff.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${s.role === "admin" ? "bg-amber-100 text-amber-700" : s.role === "waiter" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{s.email}</TableCell>
                  <TableCell><RoleBadge role={s.role} /></TableCell>
                  <TableCell><StatusBadge active={s.isActive} /></TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className={s.isActive
                        ? "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"}
                      onClick={() => { toggleStaffActive(s.id, s.isActive); }}
                    >
                      {s.isActive ? "Suspender" : "Reactivar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 ml-2 hover:bg-red-50"
                      onClick={() => { handleDeleteStaff(s.id); }}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
