---
paths:
  - "sources/client/**/*.ts"
  - "sources/client/**/*.tsx"
---

# TypeScript Instructions

## Module-Level Functions

Declare every module-level function with the `function` keyword. Do not assign
an arrow function to a module-level `const`.

A function declaration is hoisted. Put the exported functions first, and put
the internal helpers below them. A reader then sees the public API of the
module before its details.

```ts
// Good
export function computeSeatReport( logins: string[] ): SeatReport {
	return summarize( normalize( logins ) );
}

function normalize( logins: string[] ): string[] {
	return logins.map( ( login ) => login.trim().toLowerCase() );
}

// Bad
const normalize = ( logins: string[] ): string[] =>
	logins.map( ( login ) => login.trim().toLowerCase() );

export const computeSeatReport = ( logins: string[] ): SeatReport =>
	summarize( normalize( logins ) );
```

The rule does not apply to:

- callbacks and inline functions, for example `map( ( login ) => … )`, or a
  `run` property of an object;
- class methods;
- constants that are not functions. Keep them at the top of the module,
  because they are not hoisted.

## Module Exporting

One module has one export. If a module needs to export two or more values,
split it into atomic files, one file for each export. Name the file after its
export, in kebab case: `computeSeatReport` goes in `compute-seat-report.ts`.

Keep the internal helpers in the file of the export that uses them. If two
exports use the same helper, move the helper to its own module and export it
from there.

```ts
// Good: src/seats/compute-seat-report.ts
export function computeSeatReport( logins: string[] ): SeatReport {
	return summarize( normalize( logins ) );
}

function normalize( logins: string[] ): string[] {
	return logins.map( ( login ) => login.trim().toLowerCase() );
}

// Good: src/seats/find-new-logins.ts
export function findNewLogins( configured: string[] ): string[] {
	// …
}

// Bad: src/seats/seat-report.ts
export function computeSeatReport( logins: string[] ): SeatReport {
	// …
}

export function findNewLogins( configured: string[] ): string[] {
	// …
}
```

The rule does not apply to:

- a barrel file (`index.ts`) that only re-exports other modules, for example
  `export * from './compute-seat-report';`;
- a type or an interface that is part of the signature of the export. It can
  stay in the same file. A type that more than one module uses goes in its
  own module.

## Getters

**Do not use `get` prefix for method names.** This is a JavaScript/TypeScript convention that should be avoided in this project.

❌ **Bad:**
```typescript
function getBlockEntries(): Entries {
    // ...
}

class Block {
    getTitle(): string {
        return this.title;
    }
}
```

✅ **Good:**
```typescript
function blockEntries(): Entries {
    // ...
}

class Block {
    title(): string {
        return this.title;
    }
}
```

### Exceptions

The only acceptable use of `get` is in actual TypeScript/JavaScript getter properties:

```typescript
class Block {
    private _title: string;

    get title(): string {
        return this._title;
    }
}
```
