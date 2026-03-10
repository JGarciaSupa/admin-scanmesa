import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { tenantService, planService, type Tenant, type Plan, type CreateTenantData } from "@/services/tenant.service";

export default function RestaurantPage() {
  // Estado para los tenants
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Estado para el diálogo de crear/editar
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<CreateTenantData>({
    name: "",
    documentId: "",
    schemaName: "",
    planId: undefined,
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Cargar planes al montar
  useEffect(() => {
    loadPlans();
  }, []);

  // Cargar tenants cuando cambien los filtros
  useEffect(() => {
    loadTenants();
  }, [currentPage, search, statusFilter]);

  const loadPlans = async () => {
    try {
      const response = await planService.getActive();
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch (err) {
      console.error("Error loading plans:", err);
    }
  };

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (search) params.search = search;
      if (statusFilter !== "all") params.isActive = statusFilter === "active";

      const response = await tenantService.getAll(params);
      
      if (response.success) {
        setTenants(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los restaurantes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode: "create" | "edit" | "view", tenant?: Tenant) => {
    setDialogMode(mode);
    setSelectedTenant(tenant || null);
    
    // Siempre se limpia o llena el estado ANTES de abrir, no al cerrar.
    if (mode === "create") {
      setFormData({
        name: "",
        documentId: "",
        schemaName: "",
        planId: undefined,
        isActive: true,
      });
    } else if (tenant) {
      setFormData({
        name: tenant.name,
        documentId: tenant.documentId,
        schemaName: tenant.schemaName,
        planId: tenant.planId || undefined,
        isActive: tenant.isActive,
      });
    }
    
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    // No limpiamos el formulario aquí para evitar que los inputs
    // parpadeen o se vacíen mientras ocurre la animación de cierre de shadcn
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre es requerido";
    }

    if (!formData.documentId.trim()) {
      errors.documentId = "El documento es requerido";
    }

    if (dialogMode === "create" && !formData.schemaName.trim()) {
      errors.schemaName = "El nombre del schema es requerido";
    }

    if (dialogMode === "create" && formData.schemaName && !/^[a-z][a-z0-9_]*$/.test(formData.schemaName)) {
      errors.schemaName = "El schema debe empezar con letra minúscula y solo contener letras, números y guiones bajos";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      if (dialogMode === "create") {
        const response = await tenantService.create(formData);
        if (response.success) {
          await loadTenants();
          handleCloseDialog();
        } else {
          setError(response.error || "Error al crear el restaurante");
        }
      } else if (dialogMode === "edit" && selectedTenant) {
        const { schemaName, ...updateData } = formData;
        const response = await tenantService.update(selectedTenant.id, updateData);
        if (response.success) {
          await loadTenants();
          handleCloseDialog();
        } else {
          setError(response.error || "Error al actualizar el restaurante");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error al procesar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tenant: Tenant) => {
    if (!confirm(`¿Estás seguro de que deseas ${tenant.isActive ? 'desactivar' : 'activar'} "${tenant.name}"?`)) {
      return;
    }

    try {
      const response = await tenantService.update(tenant.id, { isActive: !tenant.isActive });
      if (response.success) {
        await loadTenants();
      } else {
        alert(response.error || "Error al cambiar el estado");
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al cambiar el estado");
    }
  };

  const generateSchemaName = (name: string) => {
    const clean = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    return `tenant_${clean}`;
  };

  return (
    <div className="w-full">
      <div className="w-full flex justify-between">
        <h2 className="text-2xl font-bold">Restaurantes</h2>
        <Button onClick={() => handleOpenDialog("create")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Restaurante
        </Button>
      </div>
      <span className="text-sm text-gray-500 mt-2">
        Gestiona los locales registrados en la plataforma
      </span>

      {/* Filtros */}
      <div className="w-full mt-4">
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="w-full flex flex-col gap-2 md:flex-row lg:gap-4">
              <Input
                placeholder="Buscar por nombre"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Estados</SelectLabel>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <div className="w-full mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="w-full mt-4">
        <div className="w-full space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Schema</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                    </TableCell>
                  </TableRow>
                ) : tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-sm text-gray-500">No se encontraron restaurantes</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.documentId}</TableCell>
                      <TableCell className="font-mono text-xs">{tenant.schemaName}</TableCell>
                      <TableCell>{tenant.plan?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={tenant.isActive ? "success" : "destructive"}>
                          {tenant.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog("view", tenant)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog("edit", tenant)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tenant)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      {/* Diálogo de Crear/Editar/Ver */}
      <Dialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          // Aseguramos que el estado local y el estado de RadixUI estén sincronizados
          setDialogOpen(open);
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" && "Nuevo Restaurante"}
              {dialogMode === "edit" && "Editar Restaurante"}
              {dialogMode === "view" && "Detalle del Restaurante"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" && "Crea un nuevo restaurante en la plataforma. Se creará automáticamente su base de datos."}
              {dialogMode === "edit" && "Modifica la información del restaurante."}
              {dialogMode === "view" && "Información detallada del restaurante."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Nombre */}
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nombre del Restaurante <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    // Actualizamos usando callback para evitar problemas de sincronización 
                    // si se actualizan múltiples propiedades del estado.
                    setFormData((prev) => ({
                      ...prev,
                      name: newValue,
                      ...(dialogMode === "create" && !prev.schemaName 
                          ? { schemaName: generateSchemaName(newValue) } 
                          : {})
                    }));
                  }}
                  disabled={dialogMode === "view"}
                  placeholder="Ej: Restaurante El Buen Sabor"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Documento */}
              <div className="grid gap-2">
                <Label htmlFor="documentId">
                  RUC / Documento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="documentId"
                  value={formData.documentId}
                  onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                  disabled={dialogMode === "view"}
                  placeholder="Ej: 20123456789"
                />
                {formErrors.documentId && (
                  <p className="text-xs text-red-500">{formErrors.documentId}</p>
                )}
              </div>

              {/* Schema Name (solo en crear) */}
              {dialogMode === "create" && (
                <div className="grid gap-2">
                  <Label htmlFor="schemaName">
                    Nombre del Schema <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="schemaName"
                    value={formData.schemaName}
                    onChange={(e) => setFormData({ ...formData, schemaName: e.target.value })}
                    placeholder="Ej: tenant_buen_sabor"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Solo letras minúsculas, números y guiones bajos. Debe empezar con letra.
                  </p>
                  {formErrors.schemaName && (
                    <p className="text-xs text-red-500">{formErrors.schemaName}</p>
                  )}
                </div>
              )}

              {/* Schema Name (mostrar en editar/ver) */}
              {dialogMode !== "create" && selectedTenant && (
                <div className="grid gap-2">
                  <Label>Schema</Label>
                  <Input
                    value={selectedTenant.schemaName}
                    disabled
                    className="font-mono text-sm bg-gray-50"
                  />
                </div>
              )}

              {/* Plan */}
              <div className="grid gap-2">
                <Label htmlFor="planId">Plan de Suscripción</Label>
                <Select
                  // Radix no acepta strings vacíos. Cambiamos "" por "none"
                  value={formData.planId?.toString() || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, planId: value !== "none" ? parseInt(value) : undefined })
                  }
                  disabled={dialogMode === "view"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Planes</SelectLabel>
                      {/* El valor debe ser "none", no "" */}
                      <SelectItem value="none">Sin plan</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - ${plan.price.monthly}/{plan.price.currency}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  disabled={dialogMode === "view"}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Restaurante activo
                </Label>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                {dialogMode === "view" ? "Cerrar" : "Cancelar"}
              </Button>
              {dialogMode !== "view" && (
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {dialogMode === "create" ? "Creando..." : "Guardando..."}
                    </>
                  ) : (
                    <>{dialogMode === "create" ? "Crear Restaurante" : "Guardar Cambios"}</>
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}