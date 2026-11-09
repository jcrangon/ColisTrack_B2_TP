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

test("CT-02 : impossible de sauter une étape", () => {
  const shipment = sample();
  const before = structuredClone(shipment);
  assert.throws(() => advanceShipment(shipment, "delivered"), Error);
  assert.deepEqual(shipment, before);
});

test("CT-02 : impossible de revenir en arrière", () => {
  const prepared = advanceShipment(sample(), "prepared");
  const inTransit = advanceShipment(prepared, "in_transit");
  const before = structuredClone(inTransit);
  assert.throws(() => advanceShipment(inTransit, "prepared"), Error);
  assert.deepEqual(inTransit, before);
});

test("CT-02 : impossible de répéter une étape", () => {
  const prepared = advanceShipment(sample(), "prepared");
  const before = structuredClone(prepared);
  assert.throws(() => advanceShipment(prepared, "prepared"), Error);
  assert.deepEqual(prepared, before);
});

for (const status of ["delivered", "canceled"]) {
  test(`CT-03 : ${status} bloque toute évolution sans modifier le colis`, () => {
    let shipment = sample();
    if (status === "canceled") {
      shipment = cancelShipment(shipment);
    } else {
      for (const step of ["prepared", "in_transit", "delivered"]) {
        shipment = advanceShipment(shipment, step);
      }
    }
    const before = structuredClone(shipment);

    for (const target of Object.values(SHIPMENT_STATUSES)) {
      assert.throws(() => advanceShipment(shipment, target), Error);
      assert.deepEqual(shipment, before);
    }
  });
}

for (const status of Object.values(SHIPMENT_STATUSES)) {
  test(`CT-04 : annulation depuis ${status}`, () => {
    let shipment = sample();
    if (status === "canceled") {
      shipment = cancelShipment(shipment);
    } else {
      for (const step of ["prepared", "in_transit", "delivered"]) {
        if (shipment.status === status) break;
        shipment = advanceShipment(shipment, step);
      }
    }
    const before = structuredClone(shipment);

    if (status === "created" || status === "prepared") {
      const canceled = cancelShipment(shipment);
      assert.equal(canceled.status, "canceled");
      assert.deepEqual(canceled.history, [...before.history, "canceled"]);
    } else {
      assert.throws(() => cancelShipment(shipment), Error);
    }
    assert.deepEqual(shipment, before);
  });
}
