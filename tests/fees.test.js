import test from "node:test";
import assert from "node:assert/strict";
import { calculateShippingFee } from "../src/fees.js";

test("FR : tarif de base pour 1 kg", () => {
  assert.equal(calculateShippingFee(1, "FR"), 4);
});

test("EU : supplément pour 3 kg", () => {
  assert.equal(calculateShippingFee(3, "EU"), 10);
});

test("CT-06 : un poids de 0 kg est refusé", () => {
  assert.throws(() => calculateShippingFee(0, "FR"), RangeError);
});

test("CT-06 : un poids infini est refusé", () => {
  assert.throws(() => calculateShippingFee(Infinity, "FR"), RangeError);
});

test("CT-06 : la zone XX est refusée", () => {
  assert.throws(() => calculateShippingFee(1, "XX"), RangeError);
});
