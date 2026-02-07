"use client";

import { useState } from "react";
import { generateBlogPost } from "@/app/actions/generate-blog";
import { saveArticle } from "@/app/actions/save-article";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminGeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<{
    title: string;
    content: string;
    slug: string;
    meta_description: string;
    image_url: string | null;
  } | null>(null);

  const handleGenerate = async () => {
    const t = topic.trim();
    if (!t) {
      setError("Indiquez un sujet.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await generateBlogPost(t);
      if (result.success && result.data) {
        setGenerated(result.data);
      } else {
        setError(result.success ? "Aucune donnée." : result.error);
        setGenerated(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setGenerated(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generated) return;
    setSaveLoading(true);
    try {
      const result = await saveArticle({
        title: generated.title,
        slug: generated.slug,
        content: generated.content,
        meta_description: generated.meta_description,
        main_image_url: generated.image_url ?? undefined,
      });
      if (result.success) {
        toast.success("Brouillon enregistré", {
          description: `Article enregistré. Vous pourrez le publier plus tard.`,
        });
      } else {
        toast.error("Erreur", { description: result.error });
      }
    } catch (e) {
      toast.error("Erreur", {
        description: e instanceof Error ? e.message : "Erreur inconnue",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Générer un article de blog (IA)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Page d&apos;administration — articles optimisés SEO pour Airfryer.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sujet de l&apos;article</CardTitle>
          <CardDescription>
            Exemple : Recette frites patates douces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Sujet de l&apos;article</Label>
            <Input
              id="topic"
              type="text"
              placeholder="Ex : Recette frites patates douces"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              className="max-w-md"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rédaction en cours…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Générer avec GPT-4o
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generated && (
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation</CardTitle>
            <CardDescription>
              Modifiez les champs si besoin, puis enregistrez le brouillon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {generated.image_url && (
              <div className="space-y-2">
                <Label>Image de couverture</Label>
                <div className="overflow-hidden rounded-xl border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generated.image_url}
                    alt={generated.title}
                    className="h-auto w-full max-h-80 object-cover"
                  />
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input
                  value={generated.title}
                  onChange={(e) =>
                    setGenerated((g) => (g ? { ...g, title: e.target.value } : null))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={generated.slug}
                  onChange={(e) =>
                    setGenerated((g) => (g ? { ...g, slug: e.target.value } : null))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Méta description (SEO)</Label>
              <Input
                value={generated.meta_description}
                onChange={(e) =>
                  setGenerated((g) =>
                    g ? { ...g, meta_description: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contenu (Markdown)</Label>
              <textarea
                value={generated.content}
                onChange={(e) =>
                  setGenerated((g) => (g ? { ...g, content: e.target.value } : null))
                }
                rows={18}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                spellCheck={false}
              />
            </div>
            <Button
              onClick={handleSaveDraft}
              disabled={saveLoading}
              className="gap-2"
            >
              {saveLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer le brouillon
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
