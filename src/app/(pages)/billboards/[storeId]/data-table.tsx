"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IoCopyOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import axios from "axios";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export type Billboards = {
  id: string;
  Date: string;
  Label: string;
  ImageURL: string;
  publicId: string;
};

export const columns: ColumnDef<Billboards>[] = [
  {
    accessorKey: "Label",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Label
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("Label")}</div>,
  },
  {
    accessorKey: "Date",
    header: () => <div className="">Date</div>,
    cell: ({ row }) => {
      const Date: string = row.getValue("Date");

      return <div className=" font-medium">{Date}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;
      const { toast } = useToast();
      const { storeId } = useUserStore();
      const data = {
        imageURL: payment.ImageURL,
        label: payment.Label,
        id: payment.id,
        publicId: payment.publicId
      };
      
      const handleDelete = async () => {
        try {
          const response = await axios.delete(`/api/billboards/${storeId}`, {
            data: { id: payment.id },
            headers: { "Content-Type": "application/json" },
          });
          
          await axios.delete("/api/cloudinary", {
            data: { public_id: payment.publicId },
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          toast({
            title: "Success",
            description: response.data.message,
          });
        } catch (error: any) {
          let errorMessage = "Error deleting billboard";
          if (error.response) {
            errorMessage = error.response.data.message || errorMessage;
          }
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(payment.ImageURL);
                toast({
                  title: "Copied",
                  description: "Billboard image url copied",
                });
              }}
            >
              <IoCopyOutline className="mr-2" />
              Copy image
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FaRegEdit className="mr-2" />
              <Link
                href={{
                  pathname: `/manage-billboards/storeId?${storeId}`,
                  query: data,
                }}
              >
                Update
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MdDeleteOutline className="mr-2" />
              <span onClick={handleDelete}>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState([]);
  const { storeId } = useUserStore();

  React.useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const response = await axios.get(`/api/billboards/${storeId}`);
        const transformedData = response.data.data.map((item: any) => ({
          id: item._id,
          Label: item.label,
          Date: new Date(item.createdAt).toLocaleDateString(),
          ImageURL: item.imageURL,
          publicId: item.publicId
        }));
        
        setData(transformedData);
      } catch (error) {
        console.error("Error fetching store ID:", error);
      }
    };

    fetchStoreId();
  }, [storeId]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search"
          value={(table.getColumn("Label")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("Label")?.setFilterValue(event.target.value)
          }
          className="max-w-[300px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
