import test from "node:test";
import assert from "node:assert/strict";
import { createShipment } from "../src/shipment.js";
import { getPublicTracking } from "../src/tracking.js";

test("un suivi public contient la référence et le statut", () => {
  const shipment = createShipment({
    reference: "CT-109", recipientEmail: "personne@example.test", weightKg: 1, zone: "FR",
  });
  const tracking = getPublicTracking(shipment);
  assert.equal(tracking.reference, "CT-109");
  assert.equal(tracking.status, "created");
});

test("suivi public : clés exactes et historique indépendant", () => {
  const shipment = createShipment({
    reference: "CT-110", recipientEmail: "prive@example.test", weightKg: 3, zone: "EU",
  });
  const tracking = getPublicTracking(shipment);
  assert.deepEqual(Object.keys(tracking).sort(), ["history", "reference", "status"]);
  assert.deepEqual(tracking.history, shipment.history);
  tracking.history.push("prepared");
  assert.deepEqual(shipment.history, ["created"]);
});
