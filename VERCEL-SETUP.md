# 🚀 Configuration Vercel - Guide de Déploiement

## ⚠️ Erreur "Application error: a server-side exception has occurred"

Cette erreur survient généralement parce que **les variables d'environnement Supabase ne sont pas configurées sur Vercel**.

## ✅ Solution : Configurer les Variables d'Environnement sur Vercel

### Étape 1 : Accéder aux Paramètres du Projet

1. Va sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionne ton projet `airfryer`
3. Va dans **Settings** → **Environment Variables**

### Étape 2 : Ajouter les Variables

Ajoute ces **2 variables d'environnement** :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ton-projet.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `ton_cle_anon_ici` |

**Important :**
- ✅ Pas d'espaces autour du `=`
- ✅ Pas de guillemets autour des valeurs
- ✅ Le préfixe `NEXT_PUBLIC_` est **obligatoire**

### Étape 3 : Où trouver ces valeurs ?

1. Va sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionne ton projet
3. **Settings** → **API**
4. Copie :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Étape 4 : Redéployer

Après avoir ajouté les variables :

1. Va dans **Deployments**
2. Clique sur **Redeploy** sur le dernier déploiement
3. Ou pousse un nouveau commit : `git push`

## 🔍 Vérification

Une fois redéployé, vérifie que :

1. ✅ Le build passe sans erreur
2. ✅ La page d'accueil se charge correctement
3. ✅ Les produits s'affichent

## 📝 Exemple de Configuration Vercel

Dans le dashboard Vercel, tu devrais voir :

```
Environment Variables:
┌─────────────────────────────────────┬──────────────────────────┐
│ Name                                │ Value                     │
├─────────────────────────────────────┼──────────────────────────┤
│ NEXT_PUBLIC_SUPABASE_URL           │ https://xxx.supabase.co  │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY      │ eyJhbGciOiJIUzI1NiIsIn... │
└─────────────────────────────────────┴──────────────────────────┘
```

## ⚠️ Erreurs Courantes

### ❌ "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"
- **Cause** : La variable `NEXT_PUBLIC_SUPABASE_URL` est vide ou invalide
- **Solution** : Vérifie que l'URL commence bien par `https://`

### ❌ "Variables d'environnement Supabase manquantes"
- **Cause** : Les variables ne sont pas définies sur Vercel
- **Solution** : Ajoute-les dans **Settings** → **Environment Variables**

### ❌ Build réussit mais l'app crash au runtime
- **Cause** : Les variables sont définies mais le déploiement n'a pas été redémarré
- **Solution** : Fais un **Redeploy** après avoir ajouté les variables

## 💡 Astuce : Variables par Environnement

Tu peux définir des variables différentes pour :
- **Production** : Variables pour le site en ligne
- **Preview** : Variables pour les previews de PR
- **Development** : Variables pour le développement local

Par défaut, sélectionne **Production, Preview, Development** pour toutes les variables.
