# Rapport d'audit — à compléter

Auteur : Grégory
Date : 09/11/2026
Référence de départ (commit) : commit documentaire

| ID constat | Règle CT | Fichier et fonction | Reproduction / observation | Impact | Priorité P0/P1/P2 | Action (corriger / surveiller / différer) |
|---|---|---|---|---|---|---|
| A-01 | CT-06 | `src/fees.js`, `calculateShippingFee` | 0 kg -> 4 € ; Infinity kg -> Infinity ; zone XX -> NaN, au lieu d'une `RangeError`. | Tarif calculé sur des données invalides. | P1 | Corrigé : vérifier poids et zone -> 3 tests : (0, FR), (Infinity, FR), (1, XX), chacun doit lever une `RangeError`. |
| A-02 | CT-07 | `src/tracking.js`, `getPublicTracking` | Suivi public -> contient aussi l'e-mail. | E-mail visible publiquement. | P1 | Corrigé : retirer l'e-mail -> 2 tests : champs exacts et historique indépendant du colis. |
| A-03 | CT-08 | `src/php/TrackingPresenter.php`, `publicCard` | Carte publique -> contient aussi l'e-mail. | E-mail visible publiquement. | P1 | Corrigé : retirer l'e-mail -> 2 tests : champs exacts et libellés conservés (dont « Inconnu »). |
| A-04 | CT-02 | `src/shipment.js`, `advanceShipment` | `created -> delivered` accepté. Retours et répétitions aussi. | Étapes de livraison contournées. | P1 | Corrigé : imposer l'ordre des étapes -> 4 cas à tester : parcours normal, saut, retour et répétition. |
| A-05 | CT-03 | `src/shipment.js`, `advanceShipment` | `canceled -> prepared` accepté. | Un colis annulé repart en livraison. | P1 | Corrigé : bloquer toute évolution après livraison ou annulation -> tester les 2 états terminaux, erreur et objet inchangé. |
| A-06 | CT-04 | `src/shipment.js`, `cancelShipment` | `in_transit -> canceled` accepté. | Annulation alors que le colis est en route. | P1 | Corrigé : autoriser seulement `created` et `prepared` -> tester les 5 statuts, l'historique et l'objet inchangé si refus. |

## Dette différée et justification

- **Objet:** absence de CI distante sur Github.
- **Risque:** Un commit peut eêre poussé sans lancer les tests JS et PHP
- **Mesure Compréhensible:** Execution manuelle et publication des sorties dans la PR:
  - `npm test`
  - `php tests/TrackingPresenter.test.php`
  - `php -l src/php/TrackingPresenter.php`
  - `git diff --check`
- **Priorité:** P2.
- **Déclencheur:** Avant toute mise en production
- **Justification:** Aucun des defauts P0 n'est différé. La dette porte uniquement sur l'automatisation des controls, pas sur les corrections de confidentialité. 
## Contrôles avant modification
- Avant le fix A-01 -> les 3 nouveaux tests échouent (0, Infinity, XX).
- Après A-01 -> 10 tests JS réussis, les autres constats restent à corriger.
- A-02 -> test des champs publics en échec ; copie de l'historique déjà correcte.
- A-03 -> test des champs publics en échec (e-mail présent).
- A-04 -> 3 échecs : saut, retour et répétition.
- A-05 -> évolution après annulation acceptée ; livraison déjà bloquée.
- A-06 -> 2 échecs : annulation depuis `in_transit` et `canceled`.

## Contrôles après modification
- A-01 à A-06 corrigés ; tests existants conservés.
- `npm.cmd test` -> 22 tests JavaScript réussis, 0 échec (commande Windows).
- `php tests/TrackingPresenter.test.php` -> `PHP : 9 vérifications conformes`.
- `php -l src/php/TrackingPresenter.php` -> syntaxe PHP valide.
- `git diff --check` -> pas d’erreur de whitespace dans le patch.


## Limites et risques résiduels
Les suites présentées couvrent les scénarios énumérés par les règles et les exercices, **pas l’ensemble infini des entrées possibles**. L’absence de CI distante reste une dette documentée ; GitHub dépend des accès et permissions réellement attribués. Aucune URL de PR ne peut être préremplie par un corrigé local.
