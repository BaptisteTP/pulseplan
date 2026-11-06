# PulsePlan - Générateur de programmes d'entraînement sur-mesure (Endurance)

PulsePlan est une application web & mobile sobre, ergonomique et ultra-lisible (style SaaS B2B / Nolio / Intervals.icu / Strava Pro) pour générer des programmes d'entraînement pour les sports d'endurance :
- **Triathlon** (S, M, 70.3, Ironman)
- **Course à pied** (5k, 10k, Semi-marathon, Marathon)
- **Trail & Ultra** (Trail court, 50k, Ultra 100k+ avec D+)

---

## 🚀 Démarrage Rapide

Dans le répertoire du projet :

```bash
# Lancer le serveur de développement local
npm run dev
```

L'application est immédiatement accessible sur `http://localhost:5173`.

Pour construire la version de production :
```bash
npm run build
```

---

## 📁 Architecture des Fichiers

```
app_entrainement/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Dashboard.jsx        # Vue hebdomadaire, calendrier, charge TSS & macrocycle
│   │   ├── ExportPanel.jsx      # Export multi-montres (Garmin FIT, Wahoo, Coros, Suunto, Polar, iCal, PDF)
│   │   ├── GeneratorForm.jsx    # Formulaire de configuration (discipline, distance, 3 à 6 jours)
│   │   ├── Header.jsx           # Barre de navigation sobre et accessible
│   │   ├── ProfileModal.jsx     # Paramétrage athlète (VMA, FTP, FC Max, volume hebdo)
│   │   └── WorkoutCard.jsx      # Carte de séance avec cibles individualisées et étapes
│   ├── context/
│   │   └── ProfileContext.jsx   # Persistance localStorage du profil et des métriques
│   ├── data/
│   │   └── trainingDatabase.json# Bibliothèque de séances, filières et formats d'épreuves
│   ├── services/
│   │   ├── exportService.js     # Moteur d'export (.FIT JSON, formats plateformes, iCal .ics, Print/PDF)
│   │   └── planGenerator.js     # Algorithme de génération, périodisation et calcul des allures/puissances
│   ├── App.jsx                  # Assemblage et gestion des onglets
│   ├── index.css                # Configuration Tailwind CSS & palette sobre
│   └── main.jsx                 # Point d'entrée avec ProfileProvider
├── package.json
└── vite.config.js
```

---

## ⚡ Fonctionnalités Clés

1. **Générateur Algorithmique Dynamique** :
   - Ajustement de 3 à 6 jours par semaine avec positionnement optimal des blocs clés (intervalles, tempo, sortie longue, briques enchaînées).
   - Périodisation ondulante avec phase de développement foncier, spécifique seuil, récupération programmée toutes les 4 semaines et affûtage.
2. **Personnalisation Physiologique** :
   - Calcul des zones Z2/Z4/Z5 selon la VMA (allures min/km), la FTP (watts) et la Fréquence Cardiaque Maximale (FC Max).
3. **Export Universel** :
   - Fichiers structurés .FIT simulés compatibles Garmin Connect.
   - Formats structurés pour Wahoo, COROS, Suunto, Polar.
   - Fichier calendrier `.ics` pour synchronisation avec Google Calendar / Apple Calendar.
   - Fiche d'entraînement propre imprimable / PDF.
