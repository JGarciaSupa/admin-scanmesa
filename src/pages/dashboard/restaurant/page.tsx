import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "@/components/ui/pagination";
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
import { Plus, Pencil, Trash2, Eye, Loader2, AlertCircle, RotateCw, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { tenantService, planService, type Tenant, type Plan, type CreateTenantData } from "@/services/tenant.service";
import { Link } from "react-router";

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
  const [limit, setLimit] = useState("10");

  // Estado para el diálogo de crear/editar/ver
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- NUEVO: Estado para el diálogo de confirmación de eliminación ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToToggle, setTenantToToggle] = useState<Tenant | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<CreateTenantData>({
    name: "",
    documentId: "",
    schemaName: "tenant_",
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
  }, [currentPage, search, statusFilter, limit]);

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

  // --- Handlers ---
  const handleLimitChange = (value: string) => {
    setLimit(value);
    setCurrentPage(1); // Resetear a la primera página al cambiar el límite
  };

  const handleOpenDialog = (mode: "create" | "edit" | "view", tenant?: Tenant) => {
    setDialogMode(mode);
    setSelectedTenant(tenant || null);

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
    setError(null);
  };

  // --- NUEVO: Funciones para el Modal de Confirmación ---
  const handleOpenDeleteDialog = (tenant: Tenant) => {
    setTenantToToggle(tenant);
    setDeleteDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!tenantToToggle) return;

    setSubmitting(true);
    try {
      const response = await tenantService.update(tenantToToggle.id, {
        isActive: !tenantToToggle.isActive
      });

      if (response.success) {
        await loadTenants();
        setDeleteDialogOpen(false);
      } else {
        alert(response.error || "Error al procesar la solicitud");
      }
    } catch (err: any) {
      alert("Ocurrió un error inesperado al cambiar el estado.");
    } finally {
      setSubmitting(false);
      setTenantToToggle(null);
    }
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

  return (
    <div className="w-full">
      {/* Cabecera con botones de acción */}
      <div className="w-full flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Restaurantes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los locales registrados en la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadTenants()}
            disabled={loading}
            title="Refrescar lista"
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => handleOpenDialog("create")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Restaurante
          </Button>
        </div>
      </div>

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
                onValueChange={(value: string) => {
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

      {/* Alerta de Error Principal */}
      {error && !dialogOpen && (
        <div className="w-full mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tabla de Datos */}
      <div className="w-full mt-4">
        <div className="w-full space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
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
                      <TableCell className="text-xs">{tenant.id}</TableCell>
                      <TableCell className="text-xs">{tenant.name}</TableCell>
                      <TableCell className="text-xs">{tenant.documentId}</TableCell>
                      <TableCell className="text-xs">{tenant.schemaName}</TableCell>
                      <TableCell className="text-xs">{tenant.plan?.name || "-"}</TableCell>
                      <TableCell className="text-xs">
                        <Badge className="text-inherit" variant={tenant.isActive ? "success" : "destructive"}>
                          {tenant.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                          >
                            <Link to={`${tenant.schemaName}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDialog("edit", tenant)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleOpenDeleteDialog(tenant)}
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
        </div>
      </div>

      {/* --- UI DE PAGINACIÓN EN ESPAÑOL --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Mostrar:</span>
          <Select value={limit} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-15">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">
            <span>{currentPage}</span> de <span>{totalPages}</span>
          </span>
        </div>

        <Pagination className="justify-end w-auto mx-0 order-1 sm:order-2">
          <PaginationContent>
            {/* Botón Anterior */}
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(p => p - 1); }}
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
                onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(p => p + 1); }}
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

      {/* Diálogo Principal (Crear/Editar/Ver) */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
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
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nombre del Restaurante <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={dialogMode === "view"}
                  placeholder="Ej: Restaurante El Buen Sabor"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="documentId">
                  Identificador Fiscal <span className="text-red-500">*</span>
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

              {dialogMode === "create" ? (
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
                    Solo letras minúsculas, números y guiones bajos.
                  </p>
                  {formErrors.schemaName && (
                    <p className="text-xs text-red-500">{formErrors.schemaName}</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label>Schema</Label>
                  <Input
                    value={selectedTenant?.schemaName || ""}
                    disabled
                    className="font-mono text-sm bg-gray-50"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="planId">Plan de Suscripción</Label>
                <Select
                  value={formData.planId?.toString() || "none"}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, planId: value !== "none" ? parseInt(value) : undefined })
                  }
                  disabled={dialogMode === "view"}
                >
                  <SelectTrigger className="w-full max-w-48">
                    <SelectValue placeholder="Selecciona un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Planes</SelectLabel>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - ${plan.price.monthly}/{plan.price.currency}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

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

            {error && dialogOpen && (
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

      {/* --- NUEVO: Diálogo de Confirmación para Activar/Desactivar --- */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="h-6 w-6" />
              <DialogTitle>Confirmar acción</DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-700">
              ¿Estás seguro de que deseas {tenantToToggle?.isActive ? (
                <span className="font-bold text-red-600">desactivar</span>
              ) : (
                <span className="font-bold text-green-600">activar</span>
              )} el restaurante <strong>"{tenantToToggle?.name}"</strong>?
              {tenantToToggle?.isActive && (
                <p className="mt-2 text-sm text-gray-500">
                  Esta acción impedirá el acceso a los usuarios de este local hasta que sea reactivado.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
            >
              No, cancelar
            </Button>
            <Button
              variant={tenantToToggle?.isActive ? "destructive" : "default"}
              onClick={confirmToggleStatus}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, {tenantToToggle?.isActive ? "Desactivar" : "Activar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}