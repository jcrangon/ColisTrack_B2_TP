export function getPublicTracking(shipment) {
  return {
    reference: shipment.reference,
    status: shipment.status,
    history: [...shipment.history],
  };
}
