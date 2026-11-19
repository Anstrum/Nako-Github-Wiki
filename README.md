# 🦉 Nako // Project Vault & Omen Wing Legion Archives

Catalogue interactif et portail de projets hébergé sur **GitHub Pages**, fusionnant l'univers dynamique de **Nako** (Crimson Red) et l'aura mystique de **Omen Wing Legion [OWL]** (Cyber Teal).

Ce site permet d'explorer l'ensemble des créations (jeux en Lua / LÖVE 2D, applications réactives, projets communautaires) avec un système avancé de **toggles de filtrage catégorisés** et une **transparence totale sur l'utilisation de l'IA**.

---

## ✨ Fonctionnalités Clés

- 🎯 **Filtres par Toggles Catégorisés** :
  - **Statut** : *En cours*, *Terminé*, *En pause*, *Idée / Prévu*.
  - **Usage de l'IA** : *Sans IA (100% fait main)*, *Aide & veille (idéation/doc)*, *Code partiel (copilote/snippets)*, *Complet*.
  - **Collaboration** : *Projet Solo*, *En équipe*.
  - **Technologies** : Tags dynamiques extraits automatiquement des projets (Lua, JS, Node, Docker, etc.).
- 🔍 **Recherche temps réel** instantanée sur le titre, le résumé, la description et les technologies.
- 🦉 **Spotlight Omen Wing Legion [OWL]** : Carte vedette dédiée au projet communautaire majeur.
- 🌓 **Mode Sombre / Clair** immersif mémorisé dans le navigateur.
- 📊 **Tableau de bord statistique** calculé en direct.
- 📱 **100% Responsive** et fluide sans aucun framework lourd (HTML5, Vanilla CSS & Vanilla JS).
- ➕ **Générateur de projet JSON intégré** : Cliquez sur *"➕ Nouveau"* dans la barre de navigation pour générer facilement le snippet JSON à copier/coller.

---

## 🚀 Déploiement GitHub Pages

Ce site est entièrement statique (zéro build nécessaire). Pour l'activer sur GitHub :

1. Rendez-vous sur votre dépôt : `https://github.com/Anstrum/Nako-Github-Wiki`
2. Allez dans **Settings** > **Pages**
3. Sous **Build and deployment** :
   - **Source** : `Deploy from a branch`
   - **Branch** : `master` (ou `main`), dossier `/ (root)`
4. Cliquez sur **Save**. Votre site sera en ligne sous quelques instants à l'adresse :
   `https://anstrum.github.io/Nako-Github-Wiki/`

---

## 🛠️ Ajouter ou Modifier un Projet

Pour ajouter un projet, il suffit d'ouvrir le fichier `projects.json` et d'ajouter un nouvel objet :

```json
{
  "id": "nom-du-projet",
  "title": "Nom du Projet",
  "tagline": "Une phrase d'accroche résumant le projet.",
  "version": "v1.0.0",
  "status": "in-progress",
  "progress": 65,
  "featured": false,
  "collaboration": "solo",
  "ai_usage": "research",
  "image": "assets/images/mon-image.png",
  "description": "Description détaillée...",
  "technologies": ["Lua", "LÖVE 2D", "Game Dev"],
  "links": {
    "github": "https://github.com/Anstrum/mon-projet",
    "demo": "https://..."
  },
  "dates": {
    "started": "2026-11",
    "lastUpdate": "2026-11"
  },
  "highlights": [
    "Points clés du projet 1",
    "Points clés du projet 2"
  ]
}
```

> **Astuce** : Utilisez le bouton **➕ Nouveau** directement sur le site web pour remplir le formulaire et copier le JSON généré automatiquement !
