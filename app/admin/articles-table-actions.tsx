"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toggleArticleStatus, deleteArticle } from "@/app/actions/admin-blog";
import { Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminArticle } from "@/lib/supabase/admin";

interface ArticlesTableActionsProps {
  article: AdminArticle;
}

export function ArticlesTableActions({ article }: ArticlesTableActionsProps) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const result = await toggleArticleStatus(article.id, article.is_published);
      if (result.success) {
        toast.success(article.is_published ? "Article dépublié" : "Article publié");
        window.location.reload();
      } else {
        toast.error(result.error);
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
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={article.is_published ? "secondary" : "default"}
        size="sm"
        onClick={handleToggle}
        disabled={toggling || deleting}
      >
        {toggling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : article.is_published ? (
          "Dépublier"
        ) : (
          "Publier"
        )}
      </Button>
      <Button variant="ghost" size="icon" asChild title="Voir sur le site">
        <Link href={`/blog/${article.slug}`} target="_blank" rel="noopener">
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={toggling || deleting}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        title="Supprimer"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
