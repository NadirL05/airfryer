import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TechSpec {
  label: string;
  value: string | number | null | undefined;
}

interface TechSpecsTableProps {
  specs: TechSpec[];
}

export function TechSpecsTable({ specs }: TechSpecsTableProps) {
  const filteredSpecs = specs.filter(
    (spec) => spec.value !== null && spec.value !== undefined && spec.value !== ""
  );

  if (filteredSpecs.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
        Aucune spécification technique disponible
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] font-semibold">
              Caractéristique
            </TableHead>
            <TableHead className="font-semibold">Valeur</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSpecs.map((spec, index) => (
            <TableRow
              key={spec.label}
              className={cn(
                index % 2 === 0 && "bg-muted/50"
              )}
            >
              <TableCell className="font-medium">{spec.label}</TableCell>
              <TableCell>{spec.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
