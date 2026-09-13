import type { EquityDecision, EquityScaleSpot, EquityStreet } from './types';

export function clampOuts(outs: number): number {
  if (!Number.isFinite(outs)) return 0;
  return Math.min(20, Math.max(0, Math.round(outs)));
}

export function requiredEquity(potBeforeCall: number, priceToCall: number): number {
  if (potBeforeCall < 0 || priceToCall <= 0) {
    throw new RangeError('Pot must be non-negative and price to call must be positive');
  }
  return priceToCall / (potBeforeCall + priceToCall);
}

export function hitChance(outs: number, street: EquityStreet): number {
  const safeOuts = clampOuts(outs);
  if (street === 'turn') {
    return safeOuts / 46;
  }
  const missFlop = (47 - safeOuts) / 47;
  const missTurn = (46 - safeOuts) / 46;
  return 1 - missFlop * missTurn;
}

export function callEv(input: {
  outs: number;
  street: EquityStreet;
  potBeforeCall: number;
  priceToCall: number;
}): number {
  const chance = hitChance(input.outs, input.street);
  return chance * input.potBeforeCall - (1 - chance) * input.priceToCall;
}

export function equityDecision(input: {
  outs: number;
  street: EquityStreet;
  potBeforeCall: number;
  priceToCall: number;
}): EquityDecision {
  return callEv(input) >= 0 ? 'call' : 'fold';
}

export function validateEquitySpot(spot: EquityScaleSpot): void {
  if (spot.board.length !== (spot.street === 'flop' ? 3 : 4)) {
    throw new Error(`${spot.id}: board does not match ${spot.street}`);
  }
  if (spot.correctOuts < 0 || spot.correctOuts > 20) {
    throw new Error(`${spot.id}: correctOuts must be between 0 and 20`);
  }
  const computed = equityDecision({
    outs: spot.correctOuts,
    street: spot.street,
    potBeforeCall: spot.potBeforeCall,
    priceToCall: spot.priceToCall,
  });
  if (computed !== spot.correctDecision) {
    throw new Error(`${spot.id}: authored ${spot.correctDecision} conflicts with ${computed} EV`);
  }
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
