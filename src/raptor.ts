import type { PrimitiveType } from './types';

export class Raptor {
  #pool: Set<Exclude<unknown, PrimitiveType>>;
  #finalizationRegistry: FinalizationRegistry<unknown>;

  constructor() {
    this.#pool = new Set();
    this.#finalizationRegistry = new FinalizationRegistry((heldValue) => {
      this.#pool.delete(heldValue);
    });
  }
}
