/* eslint @typescript-eslint/no-wrapper-object-types: 0 */
import type { NonPrimitiveType } from './types';

export class Raptor {
  #interner: WeakMap<NonPrimitiveType, symbol>;
  #backInterner: Map<symbol, NonPrimitiveType>;
  #finalizationRegistry: FinalizationRegistry<NonPrimitiveType>;

  constructor () {
    this.#interner = new WeakMap();
    this.#backInterner = new Map();
    this.#finalizationRegistry = new FinalizationRegistry((heldValue) => {
      const unwrappedValue = heldValue;
      const symbol = unwrappedValue && this.#interner.get(unwrappedValue);
      if (symbol) {
        this.#interner.delete(heldValue);
        this.#backInterner.delete(symbol);
      }
      this.#finalizationRegistry.unregister(heldValue);
    });
  }

  link (owner: NonPrimitiveType, ownee: NonPrimitiveType): symbol {
    this.#finalizationRegistry.register(owner, ownee, ownee);
    if (this.#interner.has(ownee)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.#interner.get(ownee)!;
    }

    const symbol = Symbol('id');
    this.#interner.set(ownee, symbol);
    this.#backInterner.set(symbol, ownee);
    return symbol;
  }

  intern (obj: NonPrimitiveType): symbol {
    const symbol = this.#interner.get(obj) || Symbol('id');
    if (!this.#interner.has(obj)) {
      this.#interner.set(obj, symbol);
      this.#backInterner.set(symbol, obj);
    }
    return symbol;
  }

  internBack (symbol: symbol): WeakRef<NonPrimitiveType> | undefined {
    const obj = this.#backInterner.get(symbol);
    return obj && new WeakRef(obj);
  }
}
