# Rapport d'audit — module d'expédition

Auteur : Israel Kokesha
Date : 2026-11-09
Référence de départ (commit) : non disponible — l'archive fournie (`Archive.zip` : `shipment.js`, `fees.js`, `tracking.js`) ne contient pas d'historique Git. À renseigner avec le hash du dépôt d'origine.

## Synthèse par règle

| Règle | Résultat | Constats |
|---|---|---|
| CT-01 | Conforme | — |
| CT-02 | Non conforme | A-02, A-03 |
| CT-03 | Partiellement conforme | A-04, A-05 |
| CT-04 | Non conforme | A-05, A-06 |
| CT-05 | Conforme | — |
| CT-06 | Non conforme | A-01, A-07 |
| CT-07 | Non conforme | A-08 |
| CT-08 | Non vérifiable | A-09 |
| CT-09 | Non satisfaite à ce jour | A-10 |

## Constats

| ID constat | Règle CT | Fichier et fonction | Reproduction / observation | Impact | Priorité P0/P1/P2 | Action (corriger / surveiller / différer) |
|---|---|---|---|---|---|---|
| A-01 | CT-06 | `fees.js` — `calculateShippingFee` | `fee(0, "FR")` → `4` ; `fee(Infinity, "FR")` → `Infinity` ; `fee(1, "xx")` → `NaN`. Aucune `RangeError` levée. | Frais facturés pour un colis sans masse, montant infini ou `NaN` propagé vers la facturation. | P0 | Corriger avec trois tests : `weight: 0`, `Infinity` et `zone: 'xx'` doivent lever une `RangeError`. |
| A-02 | CT-02 | `shipment.js` — `advanceShipment` | `advanceShipment(created, "delivered")` accepté → historique `["created","delivered"]`. Idem `created → in_transit`. Seule l'appartenance à une liste est vérifiée, pas l'ordre. | Colis déclaré livré sans avoir été préparé ni expédié : historique faux, suivi et facturation incohérents. | P0 | Corriger : n'autoriser que le statut suivant (table de transitions). Tests `created→in_transit` et `created→delivered` → `Error`. |
| A-03 | CT-02 | `shipment.js` — `advanceShipment` | Retour arrière `in_transit → prepared` accepté → `["created","prepared","in_transit","prepared"]`. Répétition `prepared → prepared` acceptée → `["created","prepared","prepared"]`. | Historique régressif ou dupliqué, état réel du colis ambigu. | P1 | Corriger (même correctif que A-02). Tests `in_transit→prepared` et `prepared→prepared` → `Error`. |
| A-04 | CT-03 | `shipment.js` — `advanceShipment` | `canceled` n'est pas terminal : `advanceShipment(canceled, "in_transit")` accepté → `["created","canceled","in_transit"]`. Seul `delivered` est bloqué. | Expédition annulée relancée : colis envoyé après annulation, éventuellement déjà remboursé. | P0 | Corriger : bloquer toute transition depuis `canceled`. Test `canceled→in_transit` → `Error` et objet fourni inchangé. |
| A-05 | CT-03 / CT-04 | `shipment.js` — `cancelShipment` | Double annulation acceptée : `cancelShipment(canceled)` → `["created","canceled","canceled"]`. | Historique dupliqué ; un traitement lié à l'annulation (remboursement, notification) peut s'exécuter deux fois. | P1 | Corriger (avec A-06). Test `canceled→cancel` → `Error` et objet fourni inchangé. |
| A-06 | CT-04 | `shipment.js` — `cancelShipment` | Annulation depuis `in_transit` acceptée → `["created","prepared","in_transit","canceled"]`. Seul `delivered` est refusé. | Colis marqué annulé alors qu'il est physiquement en route : statut contraire à la réalité, litige client possible. | P1 | Corriger : n'autoriser l'annulation que depuis `created` ou `prepared`. Test `in_transit→cancel` → `Error`. |
| A-07 | CT-06 | `fees.js` — `calculateShippingFee` | Autres entrées invalides acceptées : `-1` → `4`, `null` → `4`, `"3"` (chaîne) → `6`, `NaN` → `NaN`, `undefined` → `NaN`, zone `"fr"` (minuscule) → `NaN`, zone absente → `NaN`. | Même risque que A-01 sur des cas moins visibles (masse négative facturée au tarif de base, conversion implicite de chaînes). | P1 | Corriger dans le même correctif que A-01 (`Number.isFinite(weightKg) && weightKg > 0`, zone dans `{FR, EU}`). Ajouter les cas `-1`, `null`, `"3"`, `NaN`, `"fr"`. |
| A-08 | CT-07 | `tracking.js` — `getPublicTracking` | Clés retournées : `reference, status, recipientEmail, history`. Le courriel du destinataire est exposé. (Conforme par ailleurs : ni poids ni zone ; `history` est une copie, modifier la vue ne modifie pas l'historique interne.) | Fuite de donnée personnelle à toute personne connaissant la référence (RGPD). | P0 | Corriger : retirer `recipientEmail`. Test : clés exactement `["reference","status","history"]` + historique non partagé par référence. |
| A-09 | CT-08 | Carte publique PHP (fichier absent) | Aucun fichier PHP dans l'archive : impossible de vérifier les clés `reference` / `statusLabel`, l'absence de `recipientEmail` ni les libellés du contrat. | Risque inconnu : la même fuite qu'A-08 peut exister côté PHP. | P1 | Différer : obtenir le fichier PHP et le contrat de libellés, puis auditer. |
| A-10 | CT-09 | Ensemble du module | Aucun test existant, aucune commande de test, aucun historique Git dans l'archive. | Aucune modification ne peut aujourd'hui être prouvée non régressive. | P1 | Corriger : créer une suite de tests (ex. `node --test`) couvrant CT-01 à CT-07 avant tout correctif ; fournir commandes et diff relu. |

## Règles conformes (observées)

- **CT-01** : `createShipment(...)` renvoie `status: "created"` et `history: ["created"]`.
- **CT-03, partie `delivered`** : depuis `delivered`, `advanceShipment` et `cancelShipment` lèvent une `Error` ; l'objet fourni n'est pas modifié (comparaison JSON avant/après identique). Un statut cible inconnu lève aussi une `Error` sans modifier l'objet.
- **CT-05** : 1 kg FR = 4 €, 2 kg FR = 4 €, 2,1 kg FR = 6 €, 3 kg EU = 10 €, 3,5 kg EU = 12 €, 10 kg FR = 20 €.
- **CT-07, partie historique** : `history` retourné est une copie (un `push` sur la vue laisse l'historique interne à `["created"]`).

## Dette différée et justification

- **A-09 (CT-08, carte PHP)** : différé faute de fichier source et de contrat de libellés. À reprendre dès réception ; à traiter en P0 si une fuite de `recipientEmail` est confirmée.
- **Validation dans `createShipment`** : `createShipment({ weightKg: -1, zone: "xx" })` est accepté. CT-06 vise explicitement les frais ; son application à la création n'est pas précisée. Non retenu comme constat, à arbitrer (une validation à la création éviterait des colis invalides en amont).

## Contrôles avant modification

- Environnement : Node.js v22.23.4, modules ES importés directement depuis l'archive.
- Scripts de reproduction exécutés (hors archive) : ils appellent chaque fonction publique avec les cas listés ci-dessus et affichent le résultat ou l'erreur. Tous les résultats cités dans les colonnes « Reproduction / observation » sont issus de ces exécutions.
- Contrôle d'immuabilité : sérialisation JSON de l'objet avant/après chaque appel interdit — identique dans tous les cas où une `Error` est levée.
- Aucun test existant à exécuter (voir A-10).

## Contrôles après modification

Aucune modification n'a encore été apportée au code. Conformément à CT-09, chaque correctif devra être accompagné de :

1. Exécution des tests existants (à créer, voir A-10) — tous verts avant et après.
2. Nouveaux tests révélateurs, qui échouent sur le code actuel et passent après correctif :
   - CT-02 : `created→in_transit`, `created→delivered`, `in_transit→prepared`, `prepared→prepared` → `Error`.
   - CT-03 : `canceled→in_transit`, `canceled→cancel` → `Error`, objet inchangé.
   - CT-04 : `in_transit→cancel` → `Error` ; `created→cancel` et `prepared→cancel` ajoutent `canceled`.
   - CT-06 : `0`, `-1`, `Infinity`, `NaN`, `null`, `"3"`, zone `"xx"`, `"fr"`, absente → `RangeError`.
   - CT-07 : clés exactement `reference, status, history`.
3. Commandes exécutées et leur sortie jointes au rapport.
4. Diff relu et joint.

## Limites et risques résiduels

- **Périmètre** : seuls les trois fichiers JS de l'archive ont été audités. Le code appelant, la persistance et la carte PHP (CT-08) n'ont pas été vus.
- **Traçabilité** : sans historique Git, la référence de départ ne peut pas être garantie.
- **Preuves** : les reproductions sont des scripts ponctuels, pas une suite de tests versionnée ; elles ne protègent pas contre une régression future tant que A-10 n'est pas traité.
- **Interprétation** : la portée de CT-06 (frais seulement, ou aussi création du colis) et le comportement attendu d'une masse fournie sous forme de chaîne numérique (`"3"`) ont été interprétés au sens strict (refus).
- **Effets externes** : les impacts « remboursement » ou « notification » en double (A-04, A-05) sont supposés ; aucun code de ce type n'est présent dans l'archive.
