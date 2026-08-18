---
paths:
  - "sources/server/**/Module.php"
---

# Server Module Architecture

The following instructions apply to all PHP code in the `sources/server/` directory that implements Inpsyde Modularity patterns.

## Module Organization

### Package Structure

Each package (module) in `sources/server/` follows this structure:

```
sources/server/
└── PackageName/
    ├── Module.php          # Entry point (Inpsyde Modularity module)
    └── FeatureClass.php    # Feature implementation(s)
```

**Guidelines:**
- One module per feature domain (e.g., `BlockStyles`, `Theme`, `CustomPostTypes`)
- Each module contains one `Module.php` entry point
- Feature logic is separated into dedicated classes

## Module Entry Point Pattern

### ExecutableModule (Default)

**Use `ExecutableModule` by default** for modules that execute actions or initialize features.

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Tosuto\PackageName;

use Inpsyde\Modularity\Module\ExecutableModule;
use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Psr\Container\ContainerInterface;

class Module implements ExecutableModule
{
    use ModuleClassNameIdTrait;

    public static function new(): Module
    {
        return new self();
    }

    final private function __construct()
    {
    }

    public function run(ContainerInterface $container): bool
    {
        // Initialize feature classes here
        FeatureClass::new()->init();

        return true;
    }
}
```

**Key characteristics:**
- Static `new()` factory method
- Private constructor (prevents direct instantiation)
- `ModuleClassNameIdTrait` for automatic module ID generation
- `run()` method instantiates and initializes feature classes
- Returns `true` on success

### ServiceModule (Only When Explicitly Requested)

**Do NOT use `ServiceModule` unless explicitly requested by the user.**

`ServiceModule` is used when you need to register reusable services in the PSR-11 container. Only implement it when:
- Creating shared services that need dependency injection
- Defining singleton instances to be consumed by other modules
- Building reusable components that require container registration

```php
// Only create this pattern when explicitly requested
class Module implements ServiceModule
{
    use ModuleClassNameIdTrait;

    public function services(): array
    {
        return [
            'my-service' => fn($container) => new MyService(),
            'other' => fn($container) => new Other($container->get('my-service')),
        ];
    }
}
```

## Feature Class Pattern

Feature classes encapsulate specific functionality and implement the business logic for your modules. While they share common structural patterns, their internal implementation should be tailored to their specific purpose.

### Core Structural Requirements

All feature classes must follow these patterns:

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Tosuto\PackageName;

final readonly class FeatureClass
{
    public static function new(mixed ...$args): self
    {
        return new self(...$args);
    }

    private function __construct(
        // Dependencies or configuration as needed
    ) {
    }

    public function init(): void
    {
        // Register WordPress hooks here
    }
}
```

**Required patterns:**
- `final readonly` class declaration
- Static `new()` factory method
- Private constructor
- Public `init()` method for WordPress hook registration
- Use first-class callable syntax: `$this->method(...)` for hook callbacks

**Flexible implementation:**
- Constants (use only when needed for handles, identifiers, or repeated values)
- Private methods (define based on your specific WordPress API needs)
- Constructor parameters (pass only what the class actually needs)
- PHPStan type annotations (use for complex array structures when applicable)

### Guidelines for Feature Classes

**Do:**
- Follow the required structural patterns (readonly, factory, init)
- Keep WordPress hook registration in `init()`
- Use private methods for WordPress API calls
- Add constants when you need reusable identifiers or handles
- Add PHPStan annotations for complex array structures
- Pass configuration/dependencies through the constructor

**Don't:**
- Add constants "just in case" - only when actually needed
- Register hooks in the constructor
- Make methods public unless they're meant to be called from outside
- Add configuration parameters that aren't used
- Force a specific pattern when a simpler approach works

**Adapt based on your needs:**
- Asset enqueueing? Add constants for handles
- Complex data structures? Add PHPStan type annotations
- Multiple operations? Add multiple private methods
- Simple modification? Keep it minimal like `ThemeJson`

## WordPress Integration Patterns

### Hook Registration

**Always register hooks in the `init()` method, never in the constructor.**

```php
public function init(): void
{
    // Use first-class callable syntax
    add_action('init', $this->register_post_type(...));
    add_filter('the_content', $this->modify_content(...), 10, 1);
    add_action('wp_enqueue_scripts', $this->enqueue_assets(...), PHP_INT_MAX);
}
```

**Guidelines:**
- Use `$this->method(...)` syntax (first-class callables)
- Specify priority when order matters
- Use `PHP_INT_MAX` for late execution, `PHP_INT_MIN` for early execution
- Keep hook callbacks as private methods

### WordPress API Calls

Private methods handle actual WordPress API interactions:

```php
private function register_post_type(): void
{
    register_post_type('my_cpt', [
        'public' => true,
        'label' => __('My CPT', 'text-domain'),
    ]);
}

private function enqueue_assets(): void
{
    wp_enqueue_style(
        self::STYLE_HANDLE,
        get_theme_file_uri('dist/styles/feature.css'),
        [],
        wp_get_theme()->get('Version')
    );
}
```

## Type Safety

Use PHPStan type annotations for complex array structures:

```php
/**
 * @phpstan-type BlockStyle array{
 *   name: string,
 *   label: string,
 *   inline_style?: string
 * }
 */
final readonly class BlockStyles
{
    /**
     * @param list<BlockStyle> $styles
     */
    private function __construct(
        private array $styles,
    ) {
    }
}
```

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Package namespace** | `SpaghettiDojo\ProjectName\FeatureName` | `SpaghettiDojo\ProjectName\BlockStyles` |
| **Module class** | `Module` | `BlockStyles\Module` |
| **Feature class** | Descriptive noun | `Button`, `ThemeJson`, `CustomPostType` |
| **Factory method** | `new()` | `public static function new()` |
| **Hook registration** | `init()` | `public function init(): void` |
| **Constants** | `SCREAMING_SNAKE_CASE` | `BLOCK_STYLES_HANDLE` |

## Key Principles

1. **ExecutableModule by default** - Only use ServiceModule when explicitly requested
2. **Immutable feature classes** - Use `final readonly` for encapsulation
3. **Factory pattern** - Static `new()` + private constructor
4. **Hook registration in init()** - Never in constructor
5. **First-class callables** - Use `$this->method(...)` for hook callbacks
6. **Type safety** - Use PHPStan annotations for complex structures
7. **Single responsibility** - Each feature class handles one concern
8. **No external dependencies** - Feature classes are self-contained (unless using ServiceModule pattern)
9. **Adapt to needs** - Don't add unnecessary constants, parameters, or methods
