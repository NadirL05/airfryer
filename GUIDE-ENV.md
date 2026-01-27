# 📋 Guide de Configuration - Variables d'Environnement

## ✅ Vérification rapide

Votre fichier `.env.local` doit être à la **racine du projet** (même niveau que `package.json`) et contenir :

```env
NEXT_PUBLIC_SUPABASE_URL=https://ecxotlfomabiibtngsnr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

## 🔍 Où trouver vos valeurs Supabase ?

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. **Settings** → **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Erreurs courantes

### ❌ Format incorrect
```env
# MAUVAIS - avec guillemets
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# MAUVAIS - avec espaces
NEXT_PUBLIC_SUPABASE_URL = https://...

# BON - sans guillemets, sans espaces
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### ❌ Fichier au mauvais endroit
Le fichier `.env.local` doit être à la racine :
```
airfryer/
  ├── .env.local  ← ICI
  ├── package.json
  ├── app/
  └── ...
```

### ❌ Serveur non redémarré
Après avoir créé/modifié `.env.local`, vous **DEVEZ** redémarrer :

1. Arrêtez le serveur : `Ctrl+C` dans le terminal
2. Relancez : `npm run dev`

## 🧪 Test de connexion

Si vous voyez cette erreur dans la console :
```
Your project's URL and Key are required to create a Supabase client!
```

Cela signifie que les variables ne sont pas chargées. Vérifiez :
1. ✅ Le fichier `.env.local` existe bien
2. ✅ Les noms des variables sont exacts (avec `NEXT_PUBLIC_`)
3. ✅ Le serveur a été redémarré après la création du fichier

## 💡 Astuce

Pour vérifier que les variables sont chargées, ajoutez temporairement dans `app/page.tsx` :

```typescript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20));
```

Vous devriez voir l'URL dans les logs du serveur (pas dans le navigateur).
