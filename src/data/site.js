/**
 * Données centrales du site SOS MÉNAGE 06.
 * Modifiez ce fichier pour mettre à jour les coordonnées ou les réalisations avant/après.
 */

export const CONTACT = {
  name: 'SOS Ménage 06',
  phoneDisplay: '07 63 42 19 00',
  phoneIntl: '+33763421900',
  whatsapp: '33763421900', // format international sans "+" pour wa.me
  email: 'contact.sosmenage06@gmail.com',
};

/**
 * Réalisations AVANT / APRÈS
 * ------------------------------------------------------------
 * Pour ajouter une vraie intervention :
 *   1. Déposez les deux photos dans  public/images/avant-apres/
 *      (même cadrage, idéalement au format paysage 3:2, ~1600 px de large, en .webp ou .jpg)
 *   2. Ajoutez un objet ci-dessous avec  demo: false
 *   3. Supprimez les entrées  demo: true  lorsque les vraies photos sont disponibles.
 *
 * Les entrées "demo: true" affichent automatiquement la mention « Visuel de démonstration ».
 */
export const REALISATIONS = [
  {
    title: 'Cuisine ouverte',
    category: 'Nettoyage d’appartement',
    description: 'Plans de travail, façades et électroménager remis en valeur.',
    before: '/images/avant-apres/demo-cuisine-avant.webp',
    after: '/images/avant-apres/demo-cuisine-apres.webp',
    alt: 'cuisine équipée',
    demo: true,
  },
  {
    title: 'Salle de bain',
    category: 'Grand nettoyage',
    description: 'Paroi de douche, robinetterie et surfaces nettoyées en profondeur.',
    before: '/images/avant-apres/demo-salle-de-bain-avant.webp',
    after: '/images/avant-apres/demo-salle-de-bain-apres.webp',
    alt: 'salle de bain',
    demo: true,
  },
  {
    title: 'Séjour',
    category: 'Location saisonnière',
    description: 'Un salon prêt à accueillir les prochains voyageurs.',
    before: '/images/avant-apres/demo-sejour-avant.webp',
    after: '/images/avant-apres/demo-sejour-apres.webp',
    alt: 'séjour',
    demo: true,
  },
  {
    title: 'Chambre',
    category: 'Préparation du logement',
    description: 'Literie préparée et chambre entièrement rafraîchie.',
    before: '/images/avant-apres/demo-chambre-avant.webp',
    after: '/images/avant-apres/demo-chambre-apres.webp',
    alt: 'chambre',
    demo: true,
  },
];
