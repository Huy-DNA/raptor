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

```typescript
import { Raptor } from '@huy-dna/raptor';

const raptor = new Raptor();

let owner = {};
const ownee = new WeakRef({});

const owneeSymbol: Symbol = raptor.link(owner, ownee.deref()!); // declare a reachability relation from `owner` to `ownee`

/* ... */

/* Retrieve the ownee */
const ownee: WeakRef<unknown> | undefined = raptor.internBack(owneeSymbol);

/* Release the `owner`, sometimes later `ownee` will also be dropped */
owner = undefined;
```
