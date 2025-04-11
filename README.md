# Echo Link

**Echo Link** est une application web développée avec **React**, **TypeScript**, et **Vite**. Elle permet aux utilisateurs de signaler des urgences, de collaborer avec des volontaires, et d'accéder à des ressources utiles. L'application utilise **Supabase** pour la gestion des données et l'authentification, ainsi que **TailwindCSS** pour le style.

## Fonctionnalités

- **Signalement d'urgences** : Les utilisateurs peuvent soumettre des signalements d'urgence avec des détails tels que le titre, la description, la catégorie, la priorité et leur position géographique.
- **Notification des volontaires** : Les volontaires proches reçoivent des notifications pour les signalements d'urgence.
- **Carte interactive** : Une carte intégrée permet de visualiser les signalements et les ressources.
- **Chat communautaire** : Un espace de discussion pour les utilisateurs.
- **Assistant IA** : Fournit des réponses et des suggestions basées sur les besoins des utilisateurs.
- **Vérification d'identité** : Assure la sécurité et la fiabilité des utilisateurs.
- **Ressources utiles** : Accès à des informations et outils pertinents.

## Prérequis

- **Node.js** (version 18 ou supérieure)
- **bun** (gestionnaire de paquets)
- Une clé API pour **Supabase**

## Installation

1. Clonez le dépôt :

   ```bash
   git clone <URL_DU_DEPOT>
   cd echo-link
   ```

2. Installez les dépendances avec `bun` :

   ```bash
   bun install
   ```

3. Configurez les variables d'environnement dans un fichier `.env` :

   ```env
   VITE_SUPABASE_URL=<votre_url_supabase>
   VITE_SUPABASE_ANON_KEY=<votre_cle_anon_supabase>
   ```

4. Lancez le serveur de développement :

   ```bash
   bun run dev
   ```

5. Accédez à l'application à l'adresse `http://localhost:5173`.

## Scripts

- `bun run dev` : Lance le serveur de développement.
- `bun run build` : Génère une version de production.
- `bun run build:dev` : Génère une version de développement.
- `bun run lint` : Analyse le code avec ESLint.
- `bun run preview` : Prévisualise la version de production.

## Technologies utilisées

- **React** : Framework JavaScript pour la création d'interfaces utilisateur.
- **TypeScript** : Superset de JavaScript pour un typage statique.
- **Vite** : Outil de build rapide pour les projets modernes.
- **Supabase** : Backend-as-a-Service pour la base de données et l'authentification.
- **TailwindCSS** : Framework CSS utilitaire pour le style.

## Contribution

1. Forkez le projet.
2. Créez une branche pour votre fonctionnalité ou correction de bug : `git checkout -b feature/nom-fonctionnalite`.
3. Effectuez vos modifications et commitez-les : `git commit -m "Ajout de la fonctionnalité X"`.
4. Poussez vos modifications : `git push origin feature/nom-fonctionnalite`.
5. Ouvrez une Pull Request.