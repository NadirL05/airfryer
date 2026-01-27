# Composants Produit

## ProductGallery

Galerie d'images avec image principale et miniatures cliquables.

```tsx
<ProductGallery
  mainImage="/images/product-main.jpg"
  images={["/images/product-1.jpg", "/images/product-2.jpg"]}
/>
```

**Props:**
- `mainImage`: string | null - Image principale
- `images`: string[] | null - Tableau d'images supplémentaires

## ScoreCard

Carte affichant les scores détaillés avec barres de progression.

```tsx
<ScoreCard
  overallScore={8.5}
  cookingScore={9.0}
  qualityScore={8.5}
  easeOfUseScore={8.0}
  valueScore={7.5}
/>
```

**Props:**
- `overallScore`: number | null - Score global (affiché dans le badge circulaire)
- `cookingScore`: number | null - Score performance
- `qualityScore`: number | null - Score qualité
- `easeOfUseScore`: number | null - Score facilité
- `valueScore`: number | null - Score rapport qualité/prix

## TechSpecsTable

Tableau de spécifications techniques avec lignes alternées.

```tsx
<TechSpecsTable
  specs={[
    { label: "Capacité", value: "5.5L" },
    { label: "Puissance", value: "1700W" },
    { label: "Dimensions", value: "32 x 30 x 35 cm" },
    { label: "Poids", value: "5.2 kg" },
    { label: "Type", value: "Familial" },
    { label: "Modes", value: "8 programmes" },
  ]}
/>
```

**Props:**
- `specs`: Array<{ label: string; value: string | number | null }>

## ProsConsList

Liste des avantages et inconvénients en 2 colonnes.

```tsx
<ProsConsList
  pros={[
    "Cuisson uniforme et rapide",
    "Double zone pour cuisiner deux plats simultanément",
    "Application connectée intuitive",
  ]}
  cons={[
    "Prix élevé",
    "Encombrement important",
    "Nettoyage des accessoires fastidieux",
  ]}
/>
```

**Props:**
- `pros`: string[] - Liste des points positifs
- `cons`: string[] - Liste des points négatifs
