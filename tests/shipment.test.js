import test from "node:test";
import assert from "node:assert/strict";
import {
  SHIPMENT_STATUSES,
  createShipment,
  advanceShipment,
  cancelShipment,
} from "../src/shipment.js";

const sample = () => createShipment({
  reference: "CT-104",
  recipientEmail: "personne@example.test",
  weightKg: 1,
  zone: "FR",
});

test("création : état initial et historique", () => {
  const shipment = sample();
  assert.equal(shipment.status, SHIPMENT_STATUSES.CREATED);
  assert.deepEqual(shipment.history, [SHIPMENT_STATUSES.CREATED]);
});

test("étape initiale : created vers prepared", () => {
  const prepared = advanceShipment(sample(), SHIPMENT_STATUSES.PREPARED);
  assert.equal(prepared.status, SHIPMENT_STATUSES.PREPARED);
});

test("étape suivante : prepared vers in_transit", () => {
  const prepared = advanceShipment(sample(), SHIPMENT_STATUSES.PREPARED);
  const inTransit = advanceShipment(prepared, SHIPMENT_STATUSES.IN_TRANSIT);
  assert.equal(inTransit.status, SHIPMENT_STATUSES.IN_TRANSIT);
});

test("une livraison complète conserve son historique", () => {
  let shipment = sample();
  for (const status of ["prepared", "in_transit", "delivered"]) {
    shipment = advanceShipment(shipment, status);
  }
  assert.deepEqual(shipment.history, ["created", "prepared", "in_transit", "delivered"]);
});

test("CT-02 : transition sautée refusée (created vers delivered)", () => {
  assert.throws(() => advanceShipment(sample(), SHIPMENT_STATUSES.DELIVERED), Error);
});

test("CT-02 : transition répétée refusée (prepared vers prepared)", () => {
  const prepared = advanceShipment(sample(), SHIPMENT_STATUSES.PREPARED);
  assert.throws(() => advanceShipment(prepared, SHIPMENT_STATUSES.PREPARED), Error);
});

test("CT-02 : transition arrière refusée (in_transit vers prepared)", () => {
  const prepared = advanceShipment(sample(), SHIPMENT_STATUSES.PREPARED);
  const inTransit = advanceShipment(prepared, SHIPMENT_STATUSES.IN_TRANSIT);
  assert.throws(() => advanceShipment(inTransit, SHIPMENT_STATUSES.PREPARED), Error);
  assert.equal(inTransit.status, SHIPMENT_STATUSES.IN_TRANSIT);
});
