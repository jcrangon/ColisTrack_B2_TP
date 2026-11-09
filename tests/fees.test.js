import test from "node:test";
import assert from "node:assert/strict";
import { calculateShippingFee } from "../src/fees.js";

test("FR : tarif de base pour 1 kg", () => {
  assert.equal(calculateShippingFee(1, "FR"), 4);
});

test("Poids nul refusé avant tout calcul", () => {
  assert.throws(() => calculateShippingFee(0, "EU"), RangeError);
});

test("zone inconnue refusée avant tout calcul", () => {
  assert.throws(() => calculateShippingFee(1, "XX"), RangeError);
});

// Conserver le témoin tarifaire initial.
test("EU : supplément pour 3 kg", () => {
  assert.equal(calculateShippingFee(3, "EU"), 10);
});

test("poids invalides refusés", () => {
  for (const weight of [-1, NaN, Infinity, -Infinity, "1", null, undefined, true, 1n]) {
    assert.throws(() => calculateShippingFee(weight, "FR"), RangeError);
  }
});

test("zones invalides refusées sans conversion implicite", () => {
  for (const zone of ["XX", "toString", "__proto__", null, undefined, ["FR"], new String("EU")]) {
    assert.throws(() => calculateShippingFee(1, zone), RangeError);
  }
});

test("tarifs aux limites et kilogrammes commencés", () => {
  for (const [weight, supplement] of [[0.1, 0], [2, 0], [2.1, 2], [3, 2], [3.1, 4]]) {
    assert.equal(calculateShippingFee(weight, "FR"), 4 + supplement);
    assert.equal(calculateShippingFee(weight, "EU"), 8 + supplement);
  }
});
