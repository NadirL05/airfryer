# 🎛️ Guide d'Administration - AirFryer Deal

## Accès Rapide
**URL** : `/admin/products`

## 🎯 Cas d'Usage Principaux

### 1. Ajouter un Lien d'Affiliation Amazon
Le workflow le plus courant :

1. Trouvez le produit sur Amazon
2. Copiez l'URL complète (même avec tous les paramètres)
3. Dans l'admin, trouvez le produit dans le tableau
4. Collez l'URL dans le champ "Lien Affiliation"
5. Appuyez sur **Entrée** ou cliquez ailleurs

**Résultat** :
- ✅ URL nettoyée automatiquement
- ✅ Toast "Lien sauvegardé"
- ✅ Cache invalidé (changement visible immédiatement sur le site)

**Exemple** :
```
Vous collez :
https://www.amazon.fr/Philips-HD9252-90-Essential-Airfryer/dp/B0BXXX/ref=sr_1_1?keywords=air+fryer&qid=1234567890&sr=8-1&tag=mon-tag-21

Système sauvegarde :
https://www.amazon.fr/dp/B0BXXX?tag=mon-tag-21
```

### 2. Mise à Jour des Prix
1. Cliquez sur le champ prix
2. Tapez le nouveau prix (ex: `149.99`)
3. Appuyez sur **Entrée**

**Résultat** :
- ✅ Prix mis à jour
- ✅ Toast "Prix sauvegardé"
- ✅ Visible immédiatement sur le comparateur

### 3. Publier/Masquer un Produit
1. Cliquez sur le badge de statut (Publié/Masqué)
2. Le statut change instantanément

**Usages** :
- Masquer un produit en rupture de stock
- Masquer un produit avant d'avoir ajouté son lien d'affiliation
- Publier un nouveau produit quand il est prêt

### 4. Ajouter un Nouveau Produit

**Scénario** : Vous découvrez un nouveau air fryer à référencer

1. Cliquez sur **"Ajouter un produit"**
2. Remplissez les champs obligatoires :
   - Nom : Ex: "Air Fryer XXL"
   - Modèle : Ex: "AF-5000"
   - Marque : Sélectionnez dans la liste
   - Prix : Ex: `129.99`
3. Optionnel mais recommandé :
   - Capacité : Ex: `5.5` (en litres)
   - Puissance : Ex: `1700` (en watts)
   - URL Image : Collez l'URL de l'image produit
   - Lien Affiliation : Collez le lien Amazon
4. Cliquez sur **"Créer le produit"**

**Résultat** :
- ✅ Produit créé (masqué par défaut)
- ✅ Toast de confirmation
- ✅ Modal se ferme automatiquement
- ✅ Produit apparaît dans le tableau

**Pro Tip** : Le produit est créé en mode "Masqué" par défaut. Vous pouvez ensuite :
1. Vérifier que tout est OK
2. Cliquer sur le badge pour le publier

## 🎨 Interface Utilisateur

### Tableau des Produits
```
┌──────────┬──────────────────┬─────────┬───────┬──────────────────┬────────┬─────────┐
│  Image   │     Produit      │ Marque  │ Prix  │ Lien Affiliation │ Statut │ Actions │
├──────────┼──────────────────┼─────────┼───────┼──────────────────┼────────┼─────────┤
│ [Avatar] │ Air Fryer XXL    │ [Logo]  │ Input │ Input + 🔗       │ Badge  │   🗑️    │
│          │ Model AF-3000    │ Ninja   │ €€    │ editable         │ Click  │         │
└──────────┴──────────────────┴─────────┴───────┴──────────────────┴────────┴─────────┘
```

### Badges de Statut
- 🟢 **Publié** (vert + icône œil) : Visible sur le site
- ⚪ **Masqué** (gris + icône œil barré) : Non visible

### Toasts
Tous les retours utilisateur sont via des toasts (notifications temporaires) :
- ✅ Vert : Succès
- ❌ Rouge : Erreur

## ⚡ Raccourcis & Tips

### Édition Rapide
- **Tab** : Passe au champ suivant
- **Shift + Tab** : Champ précédent
- **Entrée** : Sauvegarde et passe au suivant
- **Échap** : Annule l'édition (TODO: à implémenter)

### Workflow Recommandé
1. **Nouveau produit** :
   - Créer → Vérifier → Ajouter lien → Publier

2. **Mise à jour prix** :
   - Si changement Amazon → Mettre à jour direct dans le tableau

3. **Produit en rupture** :
   - Masquer (pas supprimer) → Republier quand dispo

## 🔒 Sécurité

### Validation Automatique
- Prix : Doit être > 0
- URLs : Nettoyage automatique
- Champs requis : Validation côté serveur

### Confirmations
- **Suppression** : Demande confirmation (action irréversible)
- **Autres actions** : Pas de confirmation (faciliter l'édition rapide)

## 🐛 Dépannage

### "Lien sauvegardé" mais le lien ne fonctionne pas
- Vérifiez que le lien contient bien un ASIN Amazon valide (format B0XXXXX)
- Le nettoyage automatique nécessite une URL amazon.fr/dp/ASIN ou amazon.fr/gp/product/ASIN

### Le prix ne se sauvegarde pas
- Vérifiez que vous avez entré un nombre valide (ex: `99.99`)
- Appuyez bien sur Entrée ou cliquez en dehors du champ

### Le produit n'apparaît pas sur le site
- Vérifiez que le badge est "Publié" (vert)
- Attendez quelques secondes (invalidation du cache)
- Rafraîchir la page du site

## 📊 Statistiques

L'interface affiche :
- **Nombre total de produits** en haut de la page
- **Compteur en temps réel** (se met à jour après création/suppression)

## 🚀 Prochaines Améliorations (Roadmap)

- [ ] Édition en masse (modifier plusieurs produits à la fois)
- [ ] Filtres de recherche
- [ ] Tri par colonne
- [ ] Export CSV
- [ ] Historique des modifications
- [ ] Import de produits depuis CSV
- [ ] Détection automatique des changements de prix Amazon

---

**Note** : Cette interface est optimisée pour la gestion rapide au quotidien. Pour des modifications complexes, utilisez directement Supabase.
