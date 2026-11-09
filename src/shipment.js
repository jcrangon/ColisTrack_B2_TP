export const SHIPMENT_STATUSES = Object.freeze({
  CREATED: "created",
  PREPARED: "prepared",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELED: "canceled",
});

// CT-02 : seule transition autorisée depuis chaque statut du parcours
const NEXT_STATUS = Object.freeze({
  [SHIPMENT_STATUSES.CREATED]: SHIPMENT_STATUSES.PREPARED,
  [SHIPMENT_STATUSES.PREPARED]: SHIPMENT_STATUSES.IN_TRANSIT,
  [SHIPMENT_STATUSES.IN_TRANSIT]: SHIPMENT_STATUSES.DELIVERED,
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

export function advanceShipment(shipment, nextStatus) {
  if (shipment.status === SHIPMENT_STATUSES.DELIVERED) {
    throw new Error("A delivered shipment cannot be changed");
  }

  const possibleStatuses = [
    SHIPMENT_STATUSES.PREPARED,
    SHIPMENT_STATUSES.IN_TRANSIT,
    SHIPMENT_STATUSES.DELIVERED,
  ];
  if (!possibleStatuses.includes(nextStatus)) {
    throw new Error("Unknown target status");
  }

  if (!NEXT_STATUS.hasOwnProperty(shipment.status) || NEXT_STATUS[shipment.status] !== nextStatus) {
    throw new Error("Transition interdite");
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
