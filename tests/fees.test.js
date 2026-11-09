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
