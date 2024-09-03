import type { NonPrimitiveType } from './types';

export class Raptor {
  #interner: Map<NonPrimitiveType, Symbol>;
  #backInterner: Map<Symbol, NonPrimitiveType>;
  #finalizationRegistry: FinalizationRegistry<NonPrimitiveType>;

  constructor () {
    this.#interner = new Map();
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

  link (owner: NonPrimitiveType, ownee: NonPrimitiveType): Symbol | undefined {
    if (this.#interner.has(ownee)) {
      return undefined;
    }

    const symbol = Symbol('id');
    this.#interner.set(ownee, symbol);
    this.#backInterner.set(symbol, ownee);
    this.#finalizationRegistry.register(owner, ownee, ownee);
    return symbol;
  }

  intern (obj: NonPrimitiveType): Symbol | undefined {
    return this.#interner.get(obj);
  }

  internBack (symbol: Symbol): WeakRef<NonPrimitiveType> | undefined {
    const obj = this.#backInterner.get(symbol);
    return obj && new WeakRef(obj);
  }
}
