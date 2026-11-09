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

test("CT-07 : le suivi contient uniquement les champs publics", () => {
  const shipment = createShipment({
    reference: "CT-109", recipientEmail: "personne@example.test", weightKg: 1, zone: "FR",
  });
  assert.deepEqual(getPublicTracking(shipment), {
    reference: "CT-109",
    status: "created",
    history: ["created"],
  });
});

test("CT-07 : modifier l'historique public ne modifie pas le colis", () => {
  const shipment = createShipment({
    reference: "CT-109", recipientEmail: "personne@example.test", weightKg: 1, zone: "FR",
  });
  const tracking = getPublicTracking(shipment);
  tracking.history.push("prepared");
  assert.deepEqual(shipment.history, ["created"]);
});
