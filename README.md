# raptor

A lightweight library for managing GC-dependent objects.

## Installation

```bash
npm install @huy-dna/raptor
yarn add @huy-dna/raptor
pnpm add @huy-dna/raptor
```

## Rationale

This package allows declaring dependencies between 2 objects that otherwise are unrelated: `owner` and `ownee` - `ownee` will be deemed as unreachable when `owner` is GC-ed.

Terminology: Suppose we have two objects `A` and `B`. If whenever `B` is unused, `A` is also unused and safe to be garbage collect, we say that `B` is the `owner` and `A` is the `ownee`.

What problem does this package solve?
 * JS runtime's mark-and-sweep can only safely collect an object if it's unreachable from the root objects. 
 * With this package, we can hint that all accesses via `ownee` shall be made through `owner` only (even though it's still reachable from some root object). Effectively, `ownee` is unreachable if `owner` is reachable.

Disclaimer:
  * Garbage collection is complex and undeterministic on most runtime. Therefore, don't expect hinted unused objects to cleared immediately.
  * Avoid deep chains of owners, for example: `Object <- Owner 1 <- Owner 2 <- Owner 3 <- Owner 4`.
    Due to the limitation of this implementation, the following happens:
    1. `Owner 4` becomes unreachable from roots.
    2. After some time, `Owner 4` is garbage collected. Only then does the `Owner 3` become unreachable from roots.
    3. After some time, `Owner 3` is garbage collected, and so on.
    We can see that `owner` and `ownee` can not garbage collected in one scan. Therefore, deep chains of owners will take very long to clean up completely.

## Usage

### `Raptor.constructor()`

Create a new reachability-relation manager.

```typescript
const raptor = new Raptor();
```

### `Raptor.link(owner, ownee)`

Declare a reachability relation from `owner` to `ownee` - When `owner` is GC-ed, `ownee` will be internally dropped by Raptor *some time later*.

This method returns the internal symbol of `ownee`.

The internal symbol can be used as a non-owning proxy/handle to `ownee`.

```typescript
let owner = {};
const ownee = new WeakRef({});
const owneeSymbol = raptor.link(owner, ownee);
owner = undefined; // `ownee` will be dropped some time later
```

### `Raptor.intern(ownee)`

Return the internal symbol of `ownee`.

### `Raptor.internBack(symbol)`

Return the object that `symbol` is mapped to.


### Example

```typescript
import { Raptor } from '@huy-dna/raptor';

const raptor = new Raptor();

let owner = {};
const ownee = new WeakRef({});

const owneeSymbol: symbol = raptor.link(owner, ownee.deref()!); // declare a reachability relation from `owner` to `ownee`

/* ... */

/* Retrieve the ownee */
const ownee: WeakRef<unknown> | undefined = raptor.internBack(owneeSymbol);

/* Release the `owner`, some time later `ownee` will also be dropped */
owner = undefined;
```
