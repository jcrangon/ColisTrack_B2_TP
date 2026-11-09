export const SHIPMENT_STATUSES = Object.freeze({
  CREATED: "created",
  PREPARED: "prepared",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELED: "canceled",
});

export function createShipment({ reference, recipientEmail, weightKg, zone }) {
  return {
    reference,
    recipientEmail,
    weightKg,
    zone,
    status: SHIPMENT_STATUSES.CREATED,
    history: [SHIPMENT_STATUSES.CREATED],
  };
}

// Transitions autorisées par advanceShipment : uniquement le statut suivant.
// Pas de saut (created → delivered), pas de retour arrière, pas de répétition.
// L'annulation passe par cancelShipment, pas par cette table.
const NEXT_STATUS = Object.freeze({
  [SHIPMENT_STATUSES.CREATED]: SHIPMENT_STATUSES.PREPARED,
  [SHIPMENT_STATUSES.PREPARED]: SHIPMENT_STATUSES.IN_TRANSIT,
  [SHIPMENT_STATUSES.IN_TRANSIT]: SHIPMENT_STATUSES.DELIVERED,
});

const ADVANCEABLE_TARGETS = Object.freeze(Object.values(NEXT_STATUS));

export function advanceShipment(shipment, nextStatus) {
  if (shipment.status === SHIPMENT_STATUSES.DELIVERED) {
    throw new Error("A delivered shipment cannot be changed");
  }

  if (!ADVANCEABLE_TARGETS.includes(nextStatus)) {
    throw new Error("Unknown target status");
  }

  const expected = NEXT_STATUS[shipment.status];
  if (nextStatus !== expected) {
    throw new Error(
      `Invalid transition: ${shipment.status} -> ${nextStatus}` +
        (expected ? ` (expected ${expected})` : "")
    );
  }

  return {
    ...shipment,
    status: nextStatus,
    history: [...shipment.history, nextStatus],
  };
}

export function cancelShipment(shipment) {
  if (shipment.status === SHIPMENT_STATUSES.DELIVERED) {
    throw new Error("A delivered shipment cannot be canceled");
  }

  return {
    ...shipment,
    status: SHIPMENT_STATUSES.CANCELED,
    history: [...shipment.history, SHIPMENT_STATUSES.CANCELED],
  };
}
