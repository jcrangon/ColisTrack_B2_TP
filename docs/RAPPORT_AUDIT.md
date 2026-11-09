# Rapport d'audit — à compléter

Auteur :Anais
Date :09/11/26
Référence de départ (commit) :commit documentaire

| ID constat | Règle CT | Fichier et fonction | Reproduction / observation | Impact | Priorité P0/P1/P2 | Action (corriger / surveiller / différer) |
|---|---|---|---|---|---|---|
| A-01 |CT-06 | src/feess.js: calculateShippingFee | (0, 'FR') -> reçu 4, attendu RangeError/ (1,'XX') -> NaN alors que attendu RangeError| Facturation sur entrée interdite, sortie non numerique| P1 | Corriger avec 3 tests initialement: weight: 0, infinity et Zone: 'XX'|
| A-02 |CT-02 | src/shipment.js: advanceShipment | created -> 'delivered' -> accepté, attendu Error / prepared -> 'prepared' -> accepté, attendu Error| Parcours sauté ou répété, historique incohérent| P1 | Corriger avec 3 tests initialement: sautée, répétée et arrière|
| A-03 |CT-03 | src/shipment.js: advanceShipment, cancelShipment | canceled -> 'prepared' -> accepté, attendu Error / cancel(canceled) -> accepté, attendu Error| Colis annulé réactivable, état terminal non protégé| P1 | Corriger avec 2 tests initialement: canceled -> prepared et canceled -> cancel|
| A-04 |CT-07 | src/tracking.js: getPublicTracking | vue publique -> contient recipientEmail, attendu reference/status/history| Fuite du courriel| P0 | Corriger avec 2 tests: clés exactes et historique copié|
| A-05 |CT-08 | src/php/TrackingPresenter.php: publicCard | carte publique -> contient recipientEmail, attendu reference/statusLabel| Fuite du courriel| P0 | Corriger avec 2 tests: clés exactes et libellés conservés|
| A-06 |CT-04 | src/shipment.js: cancelShipment | in_transit -> cancel -> accepté, attendu Error| Colis en transit annulable| P1 | Corriger avec 3 tests: in_transit refusé, created et prepared acceptés|

## Dette différée et justification
**Objet:** absence et CI distante sur Github
**Risque:** Un commit peut etre poussé sans lancer les tests JS et PHP. Pas de `npm tst` ni les controles PHP 
automatiquement à chaque PR.
**Mesure Compensatoire:** Execution manuelle et publication des sorties dans la PR:
-`npm test`
-`php tests/TrackingPresenter.test.php`
-`php -1 src/php/TrackingPresenter.php`
-`git diff --check`

**Priorité:** P2.
**Declencheur:** Avant toute mise en production
**Justification:** Aucun des defauts P0 n'est différé. La dette porte uniquement sur l'automatisation des controls, pas sur les corrections de confidentialité.

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