# Rapport d'audit — à compléter

Auteur : AO
Date : 09/11/2026
Référence de départ (commit) : commit documentaire 

| ID constat | Règle CT | Fichier et fonction | Reproduction / observation | Impact | Priorité P0/P1/P2 | Action (corriger / surveiller / différer) |
|---|---|---|---|---|---|---|
| A-01 |CT-06|src/fees.js:calculateShippingFee|(0, 'FR') -> recu 4e, attendu RangeError/('1','XX')->NaN alors que attendu RangeError|facturation sur entrée interdite, sortie non numerique|P1|corriger avec 3 test initialement weight:0 , infinity et zone:'XX'|
| A-02 | CT-02, CT-03 | src/shipment.js : advanceShipment | Commande C2. Observé, sans erreur : created → delivered (saut), in_transit → prepared (retour), prepared → prepared (répétition), canceled → prepared (statut terminal quitté). Attendu : Error | Historique incohérent ; colis « livré » sans transit ; colis annulé qui repart | P1 | Corriger : n'autoriser que created → prepared → in_transit → delivered ; un test par transition interdite |
| A-03 | CT-04, CT-03 | src/shipment.js : cancelShipment | Commande C3. Observé : annulation acceptée depuis in_transit, et double annulation (historique created, canceled, canceled). Attendu : Error | Annulation d'un colis déjà en livraison ; doublon dans l'historique | P1 | Corriger : n'autoriser que depuis created ou prepared ; tests des cas refusés |
| A-04 | CT-07 | src/tracking.js : getPublicTracking | Commande C4. Observé : clés reference, status, recipientEmail, history. Attendu : exactement reference, status, history | Fuite du courriel du destinataire dans la vue publique (donnée personnelle) | P0 | Corriger : retirer recipientEmail ; test sur la liste exacte des clés et sur la copie de l'historique |
| A-05 | CT-08 | src/php/TrackingPresenter.php : publicCard | Commande C5. Observé : clés reference, statusLabel, recipientEmail. Attendu : exactement reference, statusLabel | Même fuite du courriel dans la carte publique PHP | P0 | Corriger : retirer recipientEmail en gardant les libellés existants ; test PHP sur les clés exactes |
| A-06 | CT-06 | src/shipment.js : createShipment | Commande C6. Observé : createShipment avec weightKg = -5 et zone = 'XX' renvoie un colis valide (statut created), sans erreur. Attendu : RangeError | Une masse ou une zone invalide est enregistrée puis n'échoue que plus tard, au calcul des frais ; données corrompues dans le colis | P2 | Corriger après A-01 : réutiliser la même validation (masse et zone) à la création ; tests d'abord |
| A-07 | CT-02 | src/shipment.js : advanceShipment | Commande C7. Observé : advanceShipment(colis, 'created') et advanceShipment(colis, 'canceled') lèvent « Unknown target status » alors que ce sont des statuts connus. Attendu : message indiquant une transition interdite | Message trompeur qui masque la vraie cause et complique le diagnostic | P2 | Corriger avec A-02 : message explicite « transition interdite de X vers Y » ; test sur le message |
| A-08 | CT-09 | tests/ (tests de départ) | Commande C8 : npm test affiche 7 tests JS verts, alors que C1 à C5 reproduisent des écarts. Les tests de départ ne détectent aucun des constats A-01 à A-05 | Faux sentiment de sécurité : un test vert ne prouve pas la conformité | P1 | Corriger : enrichir les tests avant chaque correctif (cœur du TP), un test rouge par constat |

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


