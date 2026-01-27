# Vérification des Variables d'Environnement

## Format du fichier .env.local

Assurez-vous que votre fichier `.env.local` à la racine du projet contient exactement :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

## Points importants :

1. **Pas d'espaces** autour du `=`
2. **Pas de guillemets** autour des valeurs
3. **Pas de point-virgule** à la fin
4. Le préfixe `NEXT_PUBLIC_` est **obligatoire** pour les variables accessibles côté client

## Vérification

Après avoir créé/modifié `.env.local`, vous **DEVEZ redémarrer le serveur** :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez :
npm run dev
```

## Test de connexion

Si vous voyez l'erreur :
```
Your project's URL and Key are required to create a Supabase client!
```

Cela signifie que :
- Les variables ne sont pas chargées (redémarrez le serveur)
- Les noms des variables sont incorrects
- Les valeurs sont vides ou invalides
