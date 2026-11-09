<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/php/TrackingPresenter.php';

$checked = 0;
function verify(mixed $actual, mixed $expected, string $label): void
{
    global $checked;
    if ($actual !== $expected) {
        throw new RuntimeException($label . ' : résultat inattendu ' . var_export($actual, true));
    }
    $checked++;
}

$shipment = [
    'reference' => 'CT-109',
    'status' => 'in_transit',
    'recipientEmail' => 'personne@example.test',
];
$card = (new TrackingPresenter())->publicCard($shipment);
verify($card['reference'], 'CT-109', 'reference');
verify($card['statusLabel'], 'En transit', 'libelle');
verify((new TrackingPresenter())->publicCard([...$shipment, 'status' => 'unknown'])['statusLabel'], 'Inconnu', 'statut inconnu');
verify($card, [
    'reference' => 'CT-109',
    'statusLabel' => 'En transit',
], 'CT-08 : uniquement les champs publics');

foreach ([
    'created' => 'Créé',
    'prepared' => 'Préparé',
    'in_transit' => 'En transit',
    'delivered' => 'Livré',
    'canceled' => 'Annulé',
] as $status => $label) {
    $card = (new TrackingPresenter())->publicCard([...$shipment, 'status' => $status]);
    verify($card['statusLabel'], $label, "CT-08 : libellé $status");
}

echo "PHP : $checked vérifications conformes\n";
