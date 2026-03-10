import { useState, useEffect } from "react";
import { 
  Eye, 
  Loader2,
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  RefreshCw, 
  Search,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Services
import { planService, type Plan } from "@/services/tenant.service";

export default function PlansPage() {
  // --- Estados de Datos ---
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estado para Paginación, Búsqueda y Límite ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("10");

  // --- Estado para Diálogos ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Estado del Formulario ---
  const [formData, setFormData] = useState({
    name: "",
    price: { monthly: "" as string | number, annual: "" as string | number, currency: "PEN" },
    features: [] as string[],
  });
  const [newFeature, setNewFeature] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- Estado de Eliminación ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Carga de Datos ---
  useEffect(() => {
    loadPlans();
  }, [currentPage, search, limit]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { 
        page: currentPage, 
        limit: Number(limit) 
      };
      if (search) params.search = search;

      const response = await planService.getAll(params);
      if (response.success) {
        setPlans(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los planes");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleLimitChange = (value: string) => {
    setLimit(value);
    setCurrentPage(1); // Resetear a la primera página al cambiar el límite
  };

  const handleOpenDialog = (mode: "create" | "edit" | "view", plan?: Plan) => {
    setDialogMode(mode);
    setSelectedPlan(plan || null);
    if (mode === "create") {
      setFormData({ name: "", price: { monthly: "", annual: "", currency: "PEN" }, features: [] });
    } else if (plan) {
      setFormData({
        name: plan.name,
        price: { ...plan.price },
        features: [...plan.features],
      });
    }
    setNewFeature("");
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setError(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "El nombre es requerido";
    if (!formData.price.monthly || Number(formData.price.monthly) <= 0) errors.monthly = "Precio mensual inválido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dialogMode === "view") return;
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const planData = {
        ...formData,
        price: { ...formData.price, monthly: Number(formData.price.monthly), annual: Number(formData.price.annual) }
      };

      const response = dialogMode === "create" 
        ? await planService.create(planData)
        : await planService.update(selectedPlan!.id, planData);

      if (response.success) {
        await loadPlans();
        handleCloseDialog();
      } else {
        setError(response.error || "Error en la operación");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;
    setDeleting(true);
    try {
      const response = await planService.delete(planToDelete.id);
      if (response.success) {
        await loadPlans();
        setDeleteDialogOpen(false);
      }
    } catch (err: any) {
      setError("No se pudo eliminar el plan");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planes de Suscripción</h2>
          <p className="text-sm text-muted-foreground">Configura y gestiona los niveles de precio.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadPlans} disabled={loading} title="Actualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => handleOpenDialog("create")}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Plan
          </Button>
        </div>
      </div>

      {/* Filtros y Selector de Límite */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Filas por página:</span>
          <Select value={limit} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio Mensual</TableHead>
              <TableHead>Precio Anual</TableHead>
              <TableHead>Características</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Cargando datos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No se encontraron planes.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.price.monthly} {plan.price.currency}</TableCell>
                  <TableCell>{plan.price.annual} {plan.price.currency}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan.features.length} ítems</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog("view", plan)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog("edit", plan)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setPlanToDelete(plan); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- UI DE PAGINACIÓN EN ESPAÑOL --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Mostrando página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
        </p>
        
        <Pagination className="justify-end w-auto mx-0 order-1 sm:order-2">
          <PaginationContent>
            {/* Botón Anterior */}
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.preventDefault(); if(currentPage > 1) setCurrentPage(p => p - 1); }}
                disabled={currentPage === 1}
                className="gap-1 pl-2.5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Anterior</span>
              </Button>
            </PaginationItem>

            {/* Números */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page} className="hidden sm:inline-block">
                      <PaginationLink 
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                   return <PaginationItem key={page} className="hidden sm:inline-block"><PaginationEllipsis /></PaginationItem>;
                }
                return null;
            })}

            {/* Botón Siguiente */}
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) setCurrentPage(p => p + 1); }}
                disabled={currentPage === totalPages}
                className="gap-1 pr-2.5"
              >
                <span>Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Diálogo Crear/Editar/Ver */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" && "Nuevo Plan"}
              {dialogMode === "edit" && "Editar Plan"}
              {dialogMode === "view" && "Detalle del Plan"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input 
                id="name" 
                disabled={dialogMode === "view"}
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Mensual</Label>
                <Input 
                  type="number" 
                  disabled={dialogMode === "view"}
                  value={formData.price.monthly} 
                  onChange={e => setFormData({...formData, price: {...formData.price, monthly: e.target.value}})} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Anual</Label>
                <Input 
                  type="number" 
                  disabled={dialogMode === "view"}
                  value={formData.price.annual} 
                  onChange={e => setFormData({...formData, price: {...formData.price, annual: e.target.value}})} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Moneda</Label>
                <Input disabled value={formData.price.currency} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Características</Label>
              {dialogMode !== "view" && (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Agregar característica..." 
                    value={newFeature} 
                    onChange={e => setNewFeature(e.target.value)} 
                    onKeyDown={e => {
                      if(e.key === 'Enter') {
                        e.preventDefault();
                        if(newFeature.trim()) {
                          setFormData({...formData, features: [...formData.features, newFeature.trim()]});
                          setNewFeature("");
                        }
                      }
                    }}
                  />
                  <Button type="button" size="icon" onClick={() => {
                    if(newFeature.trim()) {
                      setFormData({...formData, features: [...formData.features, newFeature.trim()]});
                      setNewFeature("");
                    }
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="border rounded-md p-2 space-y-2 bg-muted/30">
                {formData.features.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-background border p-2 rounded-sm text-sm">
                    <span className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> {f}</span>
                    {dialogMode !== "view" && <X className="h-3 w-3 cursor-pointer text-destructive" onClick={() => setFormData({...formData, features: formData.features.filter((_, idx) => idx !== i)})} />}
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                {dialogMode === "view" ? "Cerrar" : "Cancelar"}
              </Button>
              {dialogMode !== "view" && (
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Guardar
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmar Eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>¿Estás seguro?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción eliminará permanentemente el plan {planToDelete?.name}.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}