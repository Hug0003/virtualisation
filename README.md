# Labo Virtualisation

Site d'entraînement à la virtualisation, en React : QCM, commandes à taper, exercices de mise en ordre, calculs générés à l'infini (sous-réseaux, RAID, Ceph, quorum…), flashcards et examen blanc.

Les questions reprennent les cours « Les fondations » et « La virtualisation de A à Z » (Proxmox VE, VMware, LVM, ZFS, Ceph, réseau, Open vSwitch…).

## Contenu

| Mode | Description |
|---|---|
| Cours (parcours gamifié) | 11 chapitres, 33 leçons courtes avec questions rapides, une épreuve par chapitre (3 étoiles), XP, niveaux, série de jours et badges ; chaque chapitre réussi débloque le suivant |
| Session sur mesure | Choix des thèmes, des types de questions et du nombre (10, 20 ou 40) |
| Examen blanc | 30 questions en 30 minutes, note sur 20, correction complète à la fin |
| Terminal | Taper la vraie commande (`qm`, `pct`, `pvecm`, `lvcreate`, `zpool`, `ip`…) |
| Calculs réseau et stockage | Sous-réseaux, masques, débits, RAID, Ceph, quorum, chmod, sans fin |
| Remettre dans l'ordre | Démarrage, LVM, dépannage réseau, cluster, trajet d'un paquet… |
| Flashcards | Le glossaire des deux cours |
| Revoir mes erreurs | Les questions ratées, jusqu'à ce qu'elles soient réussies |

La progression est enregistrée dans le navigateur (localStorage).

## Développement

Le code est dans [`labo-virtualisation/`](labo-virtualisation).

```bash
cd labo-virtualisation
npm install
npm run dev        # http://localhost:5173
npm test           # tests Vitest
npm run lint       # oxlint
npm run typecheck  # TypeScript
npm run build      # build de production dans dist/
```

Ajouter des leçons : un fichier par chapitre dans `src/data/course/` (écrans de lecture `read(...)` et mini-questions `check(...)`, dont la première option est la bonne).

Ajouter des questions : un fichier par thème dans `src/data/questions/`. Pour un QCM, la **première** option est la bonne réponse (l'ordre est mélangé à l'affichage).

## CI/CD

Le workflow [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) s'exécute à chaque push et pull request sur `main` :

1. **ci** : `npm ci`, lint, vérification des types, tests, build.
2. **docker** : build de l'image multi-étapes (Node → nginx), test de fumée du conteneur, puis publication sur GitHub Container Registry (`ghcr.io/hug0003/virtualisation`, tags `latest` et `sha-…`). Rien n'est publié pour une pull request.

## Déploiement avec Docker

Avec l'image publiée par la CI :

```bash
cd labo-virtualisation
docker compose pull
docker compose up -d
```

Ou en construisant l'image en local, sans passer par GHCR :

```bash
cd labo-virtualisation
docker compose up -d --build
```

Le site est ensuite sur http://localhost:8080.

Pour un déploiement continu automatique, décommentez le service `watchtower` dans `docker-compose.yml` : il récupère chaque nouvelle image publiée par la CI et redémarre le conteneur.

> Si le paquet GHCR est privé, connectez-vous d'abord avec `docker login ghcr.io` (un token GitHub avec le droit `read:packages`), ou rendez le paquet public dans les réglages du paquet sur GitHub.
