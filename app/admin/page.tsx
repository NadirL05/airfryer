import Link from "next/link";
import { getAdminArticles } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArticlesTableActions } from "@/app/admin/articles-table-actions";
import { PlusCircle } from "lucide-react";
import { proxyImageUrl } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const articles = await getAdminArticles();

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez vos articles de blog (brouillons et publiés).
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/generate">
            <PlusCircle className="h-4 w-4" />
            Nouvel article (IA)
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
          <CardDescription>
            {articles.length} article{articles.length !== 1 ? "s" : ""} au total. Publiez ou dépubliez en un clic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Aucun article.{" "}
              <Link href="/admin/generate" className="text-primary hover:underline">
                Générer un article avec l&apos;IA
              </Link>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead className="w-[120px]">Statut</TableHead>
                  <TableHead className="w-[220px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-lg border bg-muted">
                        {article.main_image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={proxyImageUrl(article.main_image_url, 100)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-orange-300 to-amber-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{article.title}</span>
                    </TableCell>
                    <TableCell>
                      {article.is_published ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          En ligne
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Brouillon</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ArticlesTableActions article={article} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
