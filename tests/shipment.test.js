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


function makeShipment() {
  return createShipment({ reference: "R1", recipientEmail: "a@b.fr", weightKg: 1, zone: "FR" });
}

test("CT-02 : saut, retour et répétition sont refusés", () => {
  const created = makeShipment();
  const prepared = advanceShipment(created, "prepared");
  const inTransit = advanceShipment(prepared, "in_transit");

  assert.throws(() => advanceShipment(created, "in_transit"), Error);
  assert.throws(() => advanceShipment(created, "delivered"), Error);
  assert.throws(() => advanceShipment(prepared, "created"), Error);
  assert.throws(() => advanceShipment(prepared, "prepared"), Error);
  assert.throws(() => advanceShipment(inTransit, "prepared"), Error);
});

test("CT-03 : delivered et canceled sont terminaux", () => {
  const created = makeShipment();
  const inTransit = advanceShipment(advanceShipment(created, "prepared"), "in_transit");
  const delivered = advanceShipment(inTransit, "delivered");
  const canceled = cancelShipment(created);

  for (const target of ["prepared", "in_transit", "delivered", "canceled"]) {
    assert.throws(() => advanceShipment(delivered, target), Error);
    assert.throws(() => advanceShipment(canceled, target), Error);
  }
});

test("CT-03 : une transition refusée ne modifie pas l'objet fourni", () => {
  const prepared = advanceShipment(makeShipment(), "prepared");
  const before = structuredClone(prepared);

  assert.throws(() => advanceShipment(prepared, "delivered"), Error);
  assert.deepEqual(prepared, before);
});