"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TablePaginationProps = {
  rowsPerPage: number;
  rowOptions: number[];
  previousHref?: string | null;
  nextHref?: string | null;
};

export function TablePagination({
  rowsPerPage,
  rowOptions,
  previousHref,
  nextHref,
}: TablePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRowsPerPageChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("pageSize", value);
    nextParams.delete("cursor");
    nextParams.delete("direction");
    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="rows-per-page" className="text-[10px] font-normal text-muted-foreground/50">
          Rows per page
        </FieldLabel>
        <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
          <SelectTrigger
            className="h-6 w-[68px] rounded-md border-border/40 bg-transparent px-2 text-[11px] text-muted-foreground/80 shadow-none"
            id="rows-per-page"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              {rowOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Pagination className="mx-0 w-auto">
        <PaginationContent className="gap-0.5">
          <PaginationItem>
            {previousHref ? (
              <PaginationPrevious
                href={previousHref}
                className="h-6 px-2 text-[11px] font-normal text-muted-foreground/80 hover:bg-muted/30"
              />
            ) : (
              <span className="inline-flex h-6 items-center px-2 text-[11px] text-muted-foreground/45">
                Previous
              </span>
            )}
          </PaginationItem>
          <PaginationItem>
            {nextHref ? (
              <PaginationNext
                href={nextHref}
                className="h-6 px-2 text-[11px] font-normal text-muted-foreground/80 hover:bg-muted/30"
              />
            ) : (
              <span className="inline-flex h-6 items-center px-2 text-[11px] text-muted-foreground/45">
                Next
              </span>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
