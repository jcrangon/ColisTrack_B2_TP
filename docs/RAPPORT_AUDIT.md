# Rapport d'audit — à compléter

Auteur : rayane badi 
Date : 9 / 11 / 2026
Référence de départ (commit) : commit documentaire

| ID constat | Règle CT | Fichier et fonction | Reproduction / observation | Impact | Priorité P0/P1/P2 | Action (corriger / surveiller / différer) |
|---|---|---|---|---|---|---|
| A-01 | CT-06 |src/fees.js: calculateXhippingFee |(0,'FR') -> reçu 4E, attendu RangerError/(1,'XX') -> NaN alorque attendu RangeError |facturation sur entrée interdite, sortie non numerique  | p1  | corriger avec 3 test initialement: weight :0 , inifnity et Zone:'XX||' | 
| A-02 | CT-03 | src/shipment.js: advanceShipment() | Créer un colis, l’annuler avec cancelShipment(), puis demander prepared avec advanceShipment() : la transition est acceptée. | Un colis annulé peut reprendre son parcours alors que canceled est terminal. | P0 | Corriger : interdire toute transition depuis canceled en levant une Error. |
| A-03 | CT-04 | src/shipment.js: cancelShipment() | Faire avancer un colis jusqu’à in_transit, puis appeler cancelShipment() : l’annulation est acceptée. | Un colis déjà en transport peut être annulé contrairement au contrat. | P1 | Corriger : autoriser l’annulation uniquement depuis created ou prepared. |
| A-06 | CT-08 | src/php/TrackingPresenter.php — publicCard() | La carte publique contient recipientEmail en plus de reference et statusLabel. | Divulgation du courriel du destinataire dans la carte publique PHP. | P0 | Corriger en priorité : tester les clés exactes, puis retirer recipientEmail tout en conservant les libellés existants. || A-05 | CT-07 | src/tracking.js — getPublicTracking() | La vue publique contient recipientEmail en plus de reference, status et history. | Divulgation du courriel du destinataire dans une représentation publique. | P0 | Corriger en priorité : tester les clés exactes et l'indépendance de l'historique, puis retirer recipientEmail de la vue publique. |

## Dette différée et justification
- **objet:** absence de CI distante dur Github.
- **risque:** Un commit peut etre poussé sans lancer les tests JS et PHP.
- **Mesure Compesatoire:** Execution manuelle et publication des sorties dans le PR 
- `npm test`
- `php test/TrackingPresenter.test.php`
- `php -1 src/php/TrackingPresenter.php`
- `git dif --check`

- **Priorité:** P2.
- **Déclencheur:** Avant toute mise en production.
- **Justification:** Aucun des defauts P0 n'est diféré porte uniquemenet sir l'automatisation des controles, pas sur les corrections de confidentialité

## Contrôles avant modification
- Point S0 : `npm test` -> 7 tests JavaScript réussis, 0 échec.
- Point S0 : `php tests/TrackingPresenter.test.php` -> `PHP : 3 vérifications conformes`.
- Point S0 : `php -l src/php/TrackingPresenter.php` -> syntaxe valide.
- La réussite de ces tests **ne prouve pas** CT-02/03/04/06/07/08.

## Contrôles après modification
- `npm test` -> 21 tests JavaScript réussis, 0 échec.
- `php tests/TrackingPresenter.test.php` -> `PHP : 5 vérifications conformes`.
- `php -l src/php/TrackingPresenter.php` -> syntaxe PHP valide.
- `git diff --check` -> pas d’erreur de whitespace dans le patch.
- Revue pédagogique optionnelle S4+ : 22 JS + 6 PHP après deux tests complémentaires demandés par le relecteur.

## Limites et risques résiduels
Les suites présentées couvrent les scénarios énumérés par les règles et les exercices, **pas l’ensemble infini des entrées possibles**. L’absence de CI distante reste une dette documentée ; GitHub dépend des accès et permissions réellement attribués. Aucune URL de PR ne peut être préremplie par un corrigé local.