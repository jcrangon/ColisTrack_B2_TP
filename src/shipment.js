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

const NEXT_STATUS = Object.freeze({
  [SHIPMENT_STATUSES.CREATED]: SHIPMENT_STATUSES.PREPARED,
  [SHIPMENT_STATUSES.PREPARED]: SHIPMENT_STATUSES.IN_TRANSIT,
  [SHIPMENT_STATUSES.IN_TRANSIT]: SHIPMENT_STATUSES.DELIVERED,
});

export function advanceShipment(shipment, nextStatus) {
  const isAllowed =
    Object.hasOwn(NEXT_STATUS, shipment.status) &&
    NEXT_STATUS[shipment.status] === nextStatus;

  if (!isAllowed) {
    throw new Error(`Transition not allowed: ${shipment.status} -> ${nextStatus}`);
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
