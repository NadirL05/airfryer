"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { toggleArticleStatus, deleteArticle } from "@/app/actions/admin-blog";
import { Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminArticle } from "@/lib/supabase/admin";
import { proxyImageUrl } from "@/lib/utils";

interface AdminArticleRowProps {
  article: AdminArticle;
}

export function AdminArticleRow({ article }: AdminArticleRowProps) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const result = await toggleArticleStatus(article.id, article.is_published);
      if (result.success) {
        toast.success(article.is_published ? "Article dépublié" : "Article publié");
        router.refresh();
      } else {
        toast.error("Erreur", { description: result.error });
      }
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cet article ? Cette action est irréversible.")) return;
    setDeleting(true);
    try {
      const result = await deleteArticle(article.id);
      if (result.success) {
        toast.success("Article supprimé");
        router.refresh();
      } else {
        toast.error("Erreur", { description: result.error });
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="w-16">
        <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
          {article.main_image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={proxyImageUrl(article.main_image_url, 120)}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium line-clamp-2">{article.title}</span>
      </TableCell>
      <TableCell>
        <Badge
          variant={article.is_published ? "default" : "secondary"}
          className={article.is_published ? "bg-green-600 hover:bg-green-700 border-0" : undefined}
        >
          {article.is_published ? "En ligne" : "Brouillon"}
        </Badge>
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          variant={article.is_published ? "secondary" : "default"}
          size="sm"
          onClick={handleToggle}
          disabled={toggling}
        >
          {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : article.is_published ? "Dépublier" : "Publier"}
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/blog/${article.slug}`} target="_blank" rel="noopener" aria-label="Voir">
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Supprimer"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </TableCell>
    </TableRow>
  );
}
