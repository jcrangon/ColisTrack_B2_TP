# Rapport d'audit — à compléter

Auteur :
Date :
Référence de départ (commit) :

| ID constat | Règle CT | Fichier et fonction | Reproduction / observation | Impact | Priorité P0/P1/P2 | Action (corriger / surveiller / différer) |
|---|---|---|---|---|---|---|
| A-01 | | | | | |corriger avec trois test: weight:0, infinity et zone: 'xx' |
| A-02 ||shipment.js — advanceShipment  |advanceShipment(created, "delivered") est accepté → historique ["created","delivered"]. Idem created → in_transit. Seule l'appartenance à une liste de statuts est vérifiée, pas l'ordre. |Un colis peut être déclaré livré sans avoir été préparé ni expédié : historique faux, suivi client et facturation incohérents. |PO |Corriger : n'autoriser que le statut suivant du parcours (table de transitions) ; tests created→in_transit et created→delivered doivent lever une Error. |
| A-03 | | | | | | |
| A-04 | | | | | | |
| A-05 | | | | | | |

## Dette différée et justification

## Contrôles avant modification

## Contrôles après modification

## Limites et risques résiduels
