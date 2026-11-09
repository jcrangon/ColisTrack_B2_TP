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

function atStatus(status) {
  let shipment = sample();
  if (status === "canceled") return cancelShipment(shipment);
  for (const next of ["prepared", "in_transit", "delivered"]) {
    if (shipment.status === status) break;
    shipment = advanceShipment(shipment, next);
  }
  return shipment;
}

test("toutes les transitions interdites lèvent Error sans mutation", () => {
  const allowed = { created: "prepared", prepared: "in_transit", in_transit: "delivered" };
  for (const status of Object.values(SHIPMENT_STATUSES)) {
    for (const target of [...Object.values(SHIPMENT_STATUSES), "unknown"]) {
      if (allowed[status] === target) continue;
      const shipment = atStatus(status);
      const before = structuredClone(shipment);
      assert.throws(() => advanceShipment(shipment, target), Error, `${status} -> ${target}`);
      assert.deepEqual(shipment, before);
    }
  }
});

test("annulation permise depuis created et prepared sans mutation", () => {
  for (const status of ["created", "prepared"]) {
    const shipment = atStatus(status);
    const before = structuredClone(shipment);
    const canceled = cancelShipment(shipment);
    assert.equal(canceled.status, "canceled");
    assert.deepEqual(canceled.history, [...before.history, "canceled"]);
    assert.deepEqual(shipment, before);
  }
});

test("annulation interdite depuis in_transit et les états terminaux", () => {
  for (const status of ["in_transit", "delivered", "canceled"]) {
    const shipment = atStatus(status);
    const before = structuredClone(shipment);
    assert.throws(() => cancelShipment(shipment), Error);
    assert.deepEqual(shipment, before);
  }
});
