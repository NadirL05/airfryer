# Interface d'Administration

## 📍 Accès
`/admin/products`

## ✨ Fonctionnalités

### 1. Gestion Rapide des Produits
Interface tableau avec édition inline pour gérer rapidement tous vos produits.

### 2. Édition Inline
- **Prix** : Cliquez sur le champ, modifiez, puis :
  - Appuyez sur `Entrée` pour sauvegarder
  - Ou cliquez en dehors (onBlur)

- **Lien d'Affiliation** : Même principe
  - Collez votre lien Amazon complet
  - Le système nettoie automatiquement l'URL pour ne garder que l'ASIN et le tag d'affiliation

### 3. Nettoyage Automatique des URLs Amazon
Exemple de transformation automatique :
```
Input:  https://www.amazon.fr/dp/B0XXXXXX/ref=sr_1_1?keywords=air+fryer&qid=123456789&tag=mon-tag-21
Output: https://www.amazon.fr/dp/B0XXXXXX?tag=mon-tag-21
```

### 4. Gestion de la Visibilité
- Badge **Publié** (vert) : Produit visible sur le site
- Badge **Masqué** (gris) : Produit non visible
- Cliquez sur le badge pour basculer

### 5. Ajout Rapide de Produits
Bouton "Ajouter un produit" :
- Formulaire modal avec validation
- Champs obligatoires : Nom, Modèle, Marque, Prix
- Champs optionnels : Capacité, Puissance, Image, Lien d'affiliation
- Aperçu de l'image en temps réel

### 6. Suppression
- Icône poubelle rouge
- Confirmation requise avant suppression

## 🔧 Architecture Technique

### Server Actions (`app/actions/admin-products.ts`)
- `updateProductLink(id, url)` : Met à jour le lien d'affiliation
- `updateProductPrice(id, price)` : Met à jour le prix
- `toggleProductVisibility(id)` : Change le statut publié/masqué
- `deleteProduct(id)` : Supprime un produit
- `createProduct(data)` : Crée un nouveau produit

Toutes les actions incluent :
- Validation des données
- Revalidation automatique du cache Next.js
- Gestion d'erreurs complète
- Messages de retour (success/error)

### Composants
- `page.tsx` : Page serveur qui récupère les données
- `products-table.tsx` : Composant client avec état d'édition
- `create-product-dialog.tsx` : Modal de création

### UX
- Toast notifications pour chaque action
- États de chargement pour éviter les doubles-clics
- Édition optimiste avec rollback si erreur
- Interface dense pour voir beaucoup de produits

## 🚀 Utilisation Rapide

1. **Ajouter un lien d'affiliation** :
   - Allez sur Amazon, copiez le lien complet
   - Collez-le dans le champ "Lien Affiliation"
   - Appuyez sur Entrée → Toast "Lien sauvegardé"

2. **Modifier un prix** :
   - Cliquez sur le prix
   - Tapez le nouveau montant
   - Appuyez sur Entrée → Toast "Prix sauvegardé"

3. **Publier un produit** :
   - Cliquez sur le badge "Masqué"
   - → Devient "Publié" + Toast de confirmation

4. **Ajouter un produit** :
   - Clic sur "Ajouter un produit"
   - Remplir le formulaire
   - "Créer le produit" → Toast + Fermeture auto

## 📝 Notes
- Les modifications sont instantanées (pas besoin de bouton "Sauvegarder")
- Le cache est automatiquement invalidé après chaque modification
- Les URLs Amazon sont nettoyées pour être plus propres et traçables
