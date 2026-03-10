import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Loader2, AlertCircle, DollarSign, Plus, Pencil, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { planService, type Plan } from "@/services/tenant.service";

export default function PlansPage() {
  // Estado para los planes
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Estado para el diálogo de crear/editar/ver
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<{
    name: string;
    price: {
      monthly: number | string;
      annual: number | string;
      currency: string;
    };
    features: string[];
  }>({
    name: "",
    price: {
      monthly: "",
      annual: "",
      currency: "PEN",
    },
    features: [],
  });

  const [newFeature, setNewFeature] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Estado para el diálogo de confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Cargar planes cuando cambien los filtros
  useEffect(() => {
    loadPlans();
  }, [currentPage, search]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: 10,
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

  const handleOpenDialog = (mode: "create" | "edit" | "view", plan?: Plan) => {
    setDialogMode(mode);
    setSelectedPlan(plan || null);
    
    if (mode === "create") {
      setFormData({
        name: "",
        price: {
          monthly: "",
          annual: "",
          currency: "PEN",
        },
        features: [],
      });
    } else if (plan) {
      setFormData({
        name: plan.name,
        price: {
          monthly: plan.price.monthly,
          annual: plan.price.annual,
          currency: plan.price.currency,
        },
        features: [...plan.features],
      });
    }
    
    setNewFeature("");
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre es requerido";
    }

    if (!formData.price.monthly || Number(formData.price.monthly) <= 0) {
      errors.monthly = "El precio mensual debe ser mayor a 0";
    }

    if (!formData.price.annual || Number(formData.price.annual) <= 0) {
      errors.annual = "El precio anual debe ser mayor a 0";
    }

    if (!formData.price.currency.trim()) {
      errors.currency = "La moneda es requerida";
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
      const planData = {
        name: formData.name,
        price: {
          monthly: Number(formData.price.monthly),
          annual: Number(formData.price.annual),
          currency: formData.price.currency,
        },
        features: formData.features,
      };

      if (dialogMode === "create") {
        const response = await planService.create(planData);
        if (response.success) {
          await loadPlans();
          handleCloseDialog();
        } else {
          setError(response.error || "Error al crear el plan");
        }
      } else if (dialogMode === "edit" && selectedPlan) {
        const response = await planService.update(selectedPlan.id, planData);
        if (response.success) {
          await loadPlans();
          handleCloseDialog();
        } else {
          setError(response.error || "Error al actualizar el plan");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error al procesar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await planService.delete(planToDelete.id);
      if (response.success) {
        await loadPlans();
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
      } else {
        setError(response.error || "Error al eliminar el plan");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al eliminar el plan");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="w-full">
      <div className="w-full flex justify-between">
        <h2 className="text-2xl font-bold">Planes de Suscripción</h2>
        <Button onClick={() => handleOpenDialog("create")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Plan
        </Button>
      </div>
      <span className="text-sm text-gray-500 mt-2">
        Visualiza y gestiona los planes disponibles en la plataforma
      </span>
      
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
                  <TableHead>Precio Mensual</TableHead>
                  <TableHead>Precio Anual</TableHead>
                  <TableHead>Características</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                    </TableCell>
                  </TableRow>
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-sm text-gray-500">No se encontraron planes</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{plan.price.monthly}</span>
                          <span className="text-xs text-gray-500">/{plan.price.currency}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{plan.price.annual}</span>
                          <span className="text-xs text-gray-500">/{plan.price.currency}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {plan.features.length} característica{plan.features.length !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog("view", plan)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog("edit", plan)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(plan)}
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
          setDialogOpen(open);
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" && "Nuevo Plan"}
              {dialogMode === "edit" && "Editar Plan"}
              {dialogMode === "view" && "Detalle del Plan"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" && "Crea un nuevo plan de suscripción para la plataforma."}
              {dialogMode === "edit" && "Modifica la información del plan de suscripción."}
              {dialogMode === "view" && "Información completa del plan de suscripción."}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === "view" && selectedPlan ? (
            <div className="grid gap-4 py-4">
              {/* Nombre */}
              <div className="grid gap-2">
                <Label>Nombre del Plan</Label>
                <Input
                  value={selectedPlan.name}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Precio Mensual</Label>
                  <Input
                    value={`${selectedPlan.price.monthly} ${selectedPlan.price.currency}`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Precio Anual</Label>
                  <Input
                    value={`${selectedPlan.price.annual} ${selectedPlan.price.currency}`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {/* Características */}
              <div className="grid gap-2">
                <Label>Características</Label>
                <div className="p-4 border rounded-md bg-gray-50 space-y-2">
                  {selectedPlan.features.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay características definidas</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Fecha de Creación</Label>
                  <Input
                    value={new Date(selectedPlan.createdAt).toLocaleDateString('es-ES')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Última Actualización</Label>
                  <Input
                    value={new Date(selectedPlan.updatedAt).toLocaleDateString('es-ES')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Nombre */}
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Nombre del Plan <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Plan Básico"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500">{formErrors.name}</p>
                  )}
                </div>

                {/* Precios */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="monthly">
                      Precio Mensual <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="monthly"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price.monthly}
                      onChange={(e) => setFormData({
                        ...formData,
                        price: { ...formData.price, monthly: e.target.value }
                      })}
                      placeholder="99.00"
                    />
                    {formErrors.monthly && (
                      <p className="text-xs text-red-500">{formErrors.monthly}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="annual">
                      Precio Anual <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="annual"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price.annual}
                      onChange={(e) => setFormData({
                        ...formData,
                        price: { ...formData.price, annual: e.target.value }
                      })}
                      placeholder="999.00"
                    />
                    {formErrors.annual && (
                      <p className="text-xs text-red-500">{formErrors.annual}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">
                      Moneda <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="currency"
                      value={formData.price.currency}
                      onChange={(e) => setFormData({
                        ...formData,
                        price: { ...formData.price, currency: e.target.value.toUpperCase() }
                      })}
                      placeholder="PEN"
                      maxLength={3}
                    />
                    {formErrors.currency && (
                      <p className="text-xs text-red-500">{formErrors.currency}</p>
                    )}
                  </div>
                </div>

                {/* Características */}
                <div className="grid gap-2">
                  <Label>Características</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="Ej: Mesas ilimitadas"
                    />
                    <Button type="button" onClick={handleAddFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formErrors.features && (
                    <p className="text-xs text-red-500">{formErrors.features}</p>
                  )}
                  {formData.features.length > 0 && (
                    <div className="mt-2 p-4 border rounded-md space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded">
                          <span className="text-sm flex-1">{feature}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFeature(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {dialogMode === "create" ? "Creando..." : "Guardando..."}
                    </>
                  ) : (
                    <>{dialogMode === "create" ? "Crear Plan" : "Guardar Cambios"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {dialogMode === "view" && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cerrar
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El plan será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm">
              ¿Estás seguro de que deseas eliminar el plan{" "}
              <span className="font-semibold">"{planToDelete?.name}"</span>?
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPlanToDelete(null);
                setError(null);
              }}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
