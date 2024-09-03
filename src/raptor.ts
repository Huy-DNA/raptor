import type { NonPrimitiveType } from './types';

export class Raptor {
  #interner: WeakMap<NonPrimitiveType, symbol>;
  #backInterner: Map<symbol, NonPrimitiveType>;
  #finalizationRegistry: FinalizationRegistry<NonPrimitiveType>;

  constructor () {
    this.#interner = new WeakMap();
    this.#backInterner = new Map();
    this.#finalizationRegistry = new FinalizationRegistry((heldValue) => {
      const symbol = this.#interner.get(heldValue);
      if (symbol) {
        this.#interner.delete(heldValue);
        this.#backInterner.delete(symbol);
      }
    });
  }

  link (owner: NonPrimitiveType, ownee: NonPrimitiveType): symbol | undefined {
    if (this.#interner.has(ownee)) {
      return undefined;
    }

    const symbol = Symbol('id');
    this.#interner.set(ownee, symbol);
    this.#backInterner.set(symbol, ownee);
    this.#finalizationRegistry.register(owner, ownee);
    return symbol;
  }
}
