# SOS Ménage 06 — Site internet

Site vitrine de **SOS Ménage 06**, entreprise de nettoyage à Nice et dans les Alpes-Maritimes.
Une seule page (accueil, prestations, conciergeries, avant/après, tarifs, réservation, à propos, contact) et deux pages légales.

Stack : HTML, CSS et JavaScript sans framework, construits avec [Vite](https://vitejs.dev).
Les polices (Cormorant Garamond et Manrope) sont hébergées sur le site, sans appel à Google Fonts.

## Lancer le site en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # génère le site final dans dist/
npm run preview    # prévisualise dist/
```

## Publier

### GitHub Pages (automatique)
1. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
2. Chaque push sur `main` publie le site (workflow `.github/workflows/deploy.yml`).

### Autre hébergeur (Netlify, Vercel, OVH, o2switch…)
Lancez `SITE_URL=https://www.votre-domaine.fr npm run build`, puis envoyez le contenu de `dist/` sur l'hébergement.
`SITE_URL` sert à générer l'URL canonique, les balises Open Graph, les données structurées et le `sitemap.xml`.
Sans elle, ces éléments sont simplement omis : aucune URL n'est inventée.

## Modifier le contenu

| Quoi | Où |
|---|---|
| Textes, prestations, sections | `index.html` |
| Coordonnées utilisées par les formulaires | `src/data/site.js` → `CONTACT` |
| Réalisations avant / après | `src/data/site.js` → `REALISATIONS` (mode d'emploi en commentaire) |
| Photos avant / après | `public/images/avant-apres/` |
| Photo principale (hero) | `public/images/hero-appartement-nice.webp` (2400 px) et `-1200.webp` |
| Photos des prestations | `public/images/prestations/*.webp` |
| Photo « À propos » (dirigeante / équipe) | `public/images/a-propos.webp` |
| Logo | `public/brand/` (logo source : `assets-source/logo-original.png`) |
| Couleurs, typographies, espacements | `src/styles/main.css` (variables en tête de fichier) |
| Mentions légales / confidentialité | `mentions-legales.html`, `confidentialite.html` (champs `[À COMPLÉTER]`) |

Pour remplacer une image, conservez le **même nom de fichier**, ou mettez à jour le chemin dans le HTML.
Formats conseillés : WebP ou JPG, au format paysage.

## Formulaires

Les formulaires n'utilisent aucun serveur. Ils préparent un message complet, puis :
- **WhatsApp** : ils ouvrent `wa.me/33763421900` avec le message prérempli ;
- **Email** : ils ouvrent la messagerie du visiteur (`mailto:`) avec l'objet et le corps préremplis.

C'est le visiteur qui confirme l'envoi. Le site n'affiche jamais de faux message de succès.
Pour recevoir les demandes directement par email, branchez plus tard un service d'envoi (Formspree, Web3Forms, fonction serveur…).
La clé secrète doit alors rester côté serveur.

## Crédits photos
Les photos d'illustration proviennent d'Unsplash (licence Unsplash).
Les visuels avant/après actuels sont des **démonstrations** (photo « avant » dégradée artificiellement), signalées comme telles sur le site.
Remplacez-les par de vraies photos d'intervention.
