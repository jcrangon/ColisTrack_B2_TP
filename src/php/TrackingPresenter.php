<?php

declare(strict_types=1);

final class TrackingPresenter
{
    /** @param array{reference:string,status:string,recipientEmail:string} $shipment */
    public function publicCard(array $shipment): array
    {
        $labels = [
            'created' => 'Créé',
            'prepared' => 'Préparé',
            'in_transit' => 'En transit',
            'delivered' => 'Livré',
            'canceled' => 'Annulé',
        ];

        return [
            'reference' => $shipment['reference'],
            'statusLabel' => $labels[$shipment['status']] ?? 'Inconnu',
        ];
    }
}
