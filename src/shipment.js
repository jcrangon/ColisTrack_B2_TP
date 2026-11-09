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
  const nextByStatus = new Map([
    [SHIPMENT_STATUSES.CREATED, SHIPMENT_STATUSES.PREPARED],
    [SHIPMENT_STATUSES.PREPARED, SHIPMENT_STATUSES.IN_TRANSIT],
    [SHIPMENT_STATUSES.IN_TRANSIT, SHIPMENT_STATUSES.DELIVERED],
  ]);
  if (!nextByStatus.has(shipment.status) || nextByStatus.get(shipment.status) !== nextStatus) {
    throw new Error("Forbidden shipment transition");
  }

  return {
    ...shipment,
    status: nextStatus,
    history: [...shipment.history, nextStatus],
  };
}

export function cancelShipment(shipment) {
  if (shipment.status !== SHIPMENT_STATUSES.CREATED && shipment.status !== SHIPMENT_STATUSES.PREPARED) {
    throw new Error("Only created or prepared shipments can be canceled");
  }

  return {
    ...shipment,
    status: SHIPMENT_STATUSES.CANCELED,
    history: [...shipment.history, SHIPMENT_STATUSES.CANCELED],
  };
}
