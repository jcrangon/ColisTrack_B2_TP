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

export function advanceShipment(shipment, nextStatus) {
  if (shipment.status === SHIPMENT_STATUSES.DELIVERED || shipment.status === SHIPMENT_STATUSES.CANCELED) {
    throw new Error("Un colis livré ou annulé ne peut plus évoluer");
  }

  const nextStatusByStatus = {
    created: SHIPMENT_STATUSES.PREPARED,
    prepared: SHIPMENT_STATUSES.IN_TRANSIT,
    in_transit: SHIPMENT_STATUSES.DELIVERED,
  };
  if (nextStatus !== nextStatusByStatus[shipment.status]) {
    throw new Error("Cette transition n'est pas autorisée");
  }

  return {
    ...shipment,
    status: nextStatus,
    history: [...shipment.history, nextStatus],
  };
}

export function cancelShipment(shipment) {
  if (shipment.status !== SHIPMENT_STATUSES.CREATED && shipment.status !== SHIPMENT_STATUSES.PREPARED) {
    throw new Error("Seul un colis créé ou préparé peut être annulé");
  }

  return {
    ...shipment,
    status: SHIPMENT_STATUSES.CANCELED,
    history: [...shipment.history, SHIPMENT_STATUSES.CANCELED],
  };
}
