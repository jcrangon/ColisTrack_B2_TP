# [ColisTrack] Titre précis de ma PR — à compléter

> Rédiger chaque rubrique, conserver les règles CT et les résultats effectivement observés.

## Pourquoi cette PR ?
Le suivi ColisTrack passait initialement ses sept tests JavaScript et ses trois vérifications PHP, mais plusieurs règles contractuelles n’étaient pas respectées. En particulier, un colis pouvait sauter des étapes de livraison, être annulé après mise en transit et exposer le courriel du destinataire dans des vues publiques. La tarification acceptait également des poids ou des zones interdits. Cette PR corrige ces écarts identifiés dans le rapport d’audit A-01 à A-05, sans modifier les tarifs nominaux ni les libellés des statuts.

## Règles métier couvertes
- **CT-06** : refuser par `RangeError` les masses nulles, infinies et les zones non autorisées.
- **CT-02 et CT-03** : autoriser uniquement `created -> prepared -> in_transit -> delivered`, bloquer les états terminaux et refuser sans mutation.
- **CT-04** : permettre l’annulation seulement depuis `created` et `prepared`, avec historique cohérent.
- **CT-07** : limiter la réponse JS publique aux trois clés `reference`, `status`, `history`, en copiant l’historique.
- **CT-08** : limiter la carte PHP aux deux clés `reference`, `statusLabel`, sans exposer `recipientEmail`.
- **CT-01, CT-05 et CT-09** : préserver les comportements initiaux et démontrer la non-régression.

## Modifications fichier par fichier
| Fichier | Modification et raison |
|---|---|
| `src/fees.js` | Ajout de deux gardes avant le calcul ; la formule existante et la table FR/EU restent inchangées. |
| `tests/fees.test.js` | Trois cas négatifs (0 kg, Infinity, zone XX), en plus des deux tarifs normaux. |
| `src/shipment.js` | Carte des successeurs explicite pour `advanceShipment` ; annulation limitée aux deux premiers états ; copies d’objet et d’historique conservées. |
| `tests/shipment.test.js` | Refus des sauts, répétitions et réouvertures ; annulation autorisée/interdite et absence de mutation. |
| `src/tracking.js` | Réponse publique construite par liste blanche, sans courriel. |
| `tests/tracking.test.js` | Vérification des clés exactes et de la copie d’historique. |
| `src/php/TrackingPresenter.php` | Suppression de `recipientEmail` du tableau public ; libellés préservés. |
| `tests/TrackingPresenter.test.php` | Vérification de la liste exacte des clés et de l’absence du courriel. |
| `docs/RAPPORT_AUDIT.md` | Cinq constats traçables et la dette D-01 différée. |

## Preuves (commandes et résultats effectivement observés)
```text
npm test                              -> 21 tests JS réussis ; 0 échec
php tests/TrackingPresenter.test.php  -> PHP : 5 vérifications conformes
php -l src/php/TrackingPresenter.php  -> pas d’erreur de syntaxe
git diff --check                      -> aucune alerte
git diff main...HEAD --stat           -> changements limités aux fichiers déclarés
```
Les résultats ci-dessus sont ceux obtenus sur **le corrigé S4 de référence**. Sur une PR d’étudiant, remplacer ce bloc par les résultats **réellement observés** et joindre, si demandé, la sortie terminal. Les chiffres S4+ passent à 22 JS et 6 PHP uniquement si les tests post-review ci-dessous ont été ajoutés.

## Risques, choix refusés et dette reportée

## Demande de revue

## Références de livraison et état de revue

## Mises à jour après revue
