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

What problem does this package solve?
 * JS runtime's mark-and-sweep can only safely collect an object if it's unreachable from the root objects.
 * With this package, you can make the `owner` a root object and declare a "reachability relation" from `owner` to `ownee`.

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

const owneeSymbol: Symbol = raptor.link(owner, ownee.deref()!); // declare a reachability relation from `owner` to `ownee`

/* ... */

/* Retrieve the ownee */
const ownee: WeakRef<unknown> | undefined = raptor.internBack(owneeSymbol);

/* Release the `owner`, some time later `ownee` will also be dropped */
owner = undefined;
```
