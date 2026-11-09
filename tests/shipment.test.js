import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  SHIPMENT_STATUSES as S,
  createShipment,
  advanceShipment,
  cancelShipment,
} from "../src/shipment.js";

// --- Tests existants (non-régression, CT-09) ---
const sample = () => createShipment({
  reference: "CT-104",
  recipientEmail: "personne@example.test",
  weightKg: 1,
  zone: "FR",
});

test("création : état initial et historique", () => {
  const shipment = sample();
  assert.equal(shipment.status, S.CREATED);
  assert.deepEqual(shipment.history, [S.CREATED]);
});

test("étape initiale : created vers prepared", () => {
  const prepared = advanceShipment(sample(), S.PREPARED);
  assert.equal(prepared.status, S.PREPARED);
});

test("étape suivante : prepared vers in_transit", () => {
  const prepared = advanceShipment(sample(), S.PREPARED);
  const inTransit = advanceShipment(prepared, S.IN_TRANSIT);
  assert.equal(inTransit.status, S.IN_TRANSIT);
});

test("une livraison complète conserve son historique", () => {
  let shipment = sample();
  for (const status of ["prepared", "in_transit", "delivered"]) {
    shipment = advanceShipment(shipment, status);
  }
  assert.deepEqual(shipment.history, ["created", "prepared", "in_transit", "delivered"]);
});

// --- Nouveaux tests : CT-02 / A-03 ---

const newShipment = () =>
  createShipment({
    reference: "REF-1",
    recipientEmail: "client@example.com",
    weightKg: 1,
    zone: "FR",
  });

// Fait avancer un colis le long d'une suite de statuts valides.
const advanceTo = (shipment, ...statuses) =>
  statuses.reduce((s, next) => advanceShipment(s, next), shipment);

describe("advanceShipment — parcours nominal", () => {
  test("created → prepared → in_transit → delivered", () => {
    const s = advanceTo(newShipment(), S.PREPARED, S.IN_TRANSIT, S.DELIVERED);
    assert.equal(s.status, S.DELIVERED);
    assert.deepEqual(s.history, [S.CREATED, S.PREPARED, S.IN_TRANSIT, S.DELIVERED]);
  });

  test("ne modifie pas le colis d'origine", () => {
    const original = newShipment();
    advanceShipment(original, S.PREPARED);
    assert.equal(original.status, S.CREATED);
    assert.deepEqual(original.history, [S.CREATED]);
  });
});

describe("advanceShipment — CT-02 : sauts de statut refusés", () => {
  test("created → delivered lève une Error", () => {
    assert.throws(() => advanceShipment(newShipment(), S.DELIVERED), Error);
  });

  test("created → in_transit lève une Error", () => {
    assert.throws(() => advanceShipment(newShipment(), S.IN_TRANSIT), Error);
  });

  test("prepared → delivered lève une Error", () => {
    const s = advanceTo(newShipment(), S.PREPARED);
    assert.throws(() => advanceShipment(s, S.DELIVERED), Error);
  });
});

describe("advanceShipment — A-03 : retour arrière et répétition refusés", () => {
  test("in_transit → prepared lève une Error", () => {
    const s = advanceTo(newShipment(), S.PREPARED, S.IN_TRANSIT);
    assert.throws(() => advanceShipment(s, S.PREPARED), Error);
  });

  test("prepared → prepared lève une Error", () => {
    const s = advanceTo(newShipment(), S.PREPARED);
    assert.throws(() => advanceShipment(s, S.PREPARED), Error);
  });

  test("in_transit → in_transit lève une Error", () => {
    const s = advanceTo(newShipment(), S.PREPARED, S.IN_TRANSIT);
    assert.throws(() => advanceShipment(s, S.IN_TRANSIT), Error);
  });

  test("l'historique reste intact après une transition refusée", () => {
    const s = advanceTo(newShipment(), S.PREPARED, S.IN_TRANSIT);
    assert.throws(() => advanceShipment(s, S.PREPARED));
    assert.equal(s.status, S.IN_TRANSIT);
    assert.deepEqual(s.history, [S.CREATED, S.PREPARED, S.IN_TRANSIT]);
  });
});

describe("advanceShipment — comportements existants conservés", () => {
  test("un colis livré ne peut plus changer", () => {
    const s = advanceTo(newShipment(), S.PREPARED, S.IN_TRANSIT, S.DELIVERED);
    assert.throws(() => advanceShipment(s, S.DELIVERED), {
      message: "A delivered shipment cannot be changed",
    });
  });

  test("statut cible inconnu refusé", () => {
    assert.throws(() => advanceShipment(newShipment(), "lost"), {
      message: "Unknown target status",
    });
  });

  test("on ne peut pas passer à created ou canceled via advanceShipment", () => {
    assert.throws(() => advanceShipment(newShipment(), S.CREATED), {
      message: "Unknown target status",
    });
    assert.throws(() => advanceShipment(newShipment(), S.CANCELED), {
      message: "Unknown target status",
    });
  });

  test("un colis annulé ne peut plus avancer", () => {
    const s = cancelShipment(newShipment());
    assert.throws(() => advanceShipment(s, S.PREPARED), Error);
  });
});
