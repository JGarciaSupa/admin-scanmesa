import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Plus, Filter } from "lucide-react";
import { useState } from "react";

export default function RestaurantPage() {
  const data = [
    { id: "1", name: "Cevichería La Mar", category: "Marina", status: "Abierto" },
    { id: "2", name: "Pizzería Napoli", category: "Italiana", status: "Cerrado" },
    { id: "3", name: "Sushi Zen", category: "Japonesa", status: "Abierto" },
    { id: "4", name: "Sushi Zen", category: "Japonesa", status: "Abierto" },
    { id: "5", name: "Sushi Zen", category: "Japonesa", status: "Abierto" },
    { id: "6", name: "Sushi Zen", category: "Japonesa", status: "Abierto" },
    { id: "7", name: "Sushi Zen", category: "Japonesa", status: "Abierto" },
    { id: "8", name: "Sushi Zen", category: "Japonesa", status: "Abierto" },
    { id: "9", name: "Sushi Zen", category: "Japonesa", status: "Abierto" },
    { id: "10", name: "Sushi Zen", category: "Japonesa", status: "Abierto" },
    { id: "11", name: "Sushi Zen", category: "Japonesa", status: "Abierto" },
    { id: "12", name: "Sushi Zen", category: "Japonesa", status: "Abierto" },
    { id: "13", name: "El Asado", category: "Parrilla", status: "Abierto" },
    { id: "14", name: "Burger King", category: "Fast Food", status: "Abierto" },
    { id: "15", name: "Tacos Way", category: "Mexicana", status: "Cerrado" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="w-full">
      <div className="w-full flex justify-between">
        <h2 className="text-2xl font-bold">Restaurantes</h2>
        <Button variant="default" size="lg">
          <Plus />
          Nuevo Restaurante
        </Button>
      </div>
      <span className="text-sm text-gray-300 mt-2">
        Gestiona los locales registrados en la plataforma
      </span>
      <div className="w-full mt-4">
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="w-full flex flex-col gap-2 md:flex-row lg:gap-4">
              <Input placeholder="Buscar por nombre" />
              <Select>
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Estados</SelectLabel>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="w-full mt-4">
        <div className="w-full space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Control de Paginación */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
