# AGENTS.md

This file contains essential information for agentic coding assistants working with this Next.js codebase.

## Project Overview

This is a Next.js 15+ project using:
- TypeScript for type safety
- Tailwind CSS for styling
- React Server Components
- App Router architecture
- Radix UI components with custom styling
- class-variance-authority for component variants

## Build, Lint, and Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint for code linting
npm run lint

# Database migrations
npm run db:migrate

# Database studio
npm run db:studio

# Inngest development server
npm run inngest
```

## Testing

This project currently does not have a configured testing framework. If you need to add tests, consider:

1. Adding Jest or Vitest for unit testing
2. Adding React Testing Library for component testing
3. Adding Playwright or Cypress for end-to-end testing

Example of how to add testing setup:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Add to package.json:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## Code Style Guidelines

### Imports
- Use absolute imports with `@/*` alias for src directory
- Import React as a namespace: `import * as React from "react"`
- Group imports in this order:
  1. External dependencies
  2. React and related libraries
  3. Internal utilities and components
  4. Relative imports
- Separate groups with a blank line

### Formatting
- Use Prettier defaults (configured via ESLint)
- Line width: 100 characters
- Indentation: 2 spaces
- No semicolons (recommended)
- Single quotes for strings
- Trailing commas in multi-line objects/arrays

### TypeScript
- Strict mode enabled (`"strict": true`)
- Use explicit typing where beneficial
- Prefer interfaces over types for object shapes
- Use `type` for union/intersection types
- Always define component props interfaces
- Use `React.ComponentProps` for extending native element props

### Component Structure
- Use functional components with TypeScript interfaces
- Define props interface above the component
- Use Radix UI primitives when possible for accessibility
- Use `class-variance-authority` (cva) for component variants
- Use `cn` utility from `@/lib/utils` for conditional class names
- Destructure props in function parameters when appropriate

### Naming Conventions
- PascalCase for components and interfaces
- camelCase for variables, functions, and props
- UPPER_SNAKE_CASE for constants
- Use descriptive names that convey purpose
- Boolean props should start with `is`, `has`, or `can` (e.g., `isLoading`, `hasError`)

### Error Handling
- Use try/catch blocks for async operations
- Provide meaningful error messages
- Handle errors gracefully with user feedback
- Use error boundaries for catching component errors
- Log errors appropriately for debugging

### Performance
- Use React Server Components where appropriate
- Implement code splitting for large components
- Use `React.memo()` for expensive components
- Optimize images with Next.js Image component
- Use Suspense for loading states

## File Structure
- `src/app`: Application routes and layouts
- `src/components`: Reusable UI components
- `src/lib`: Utility functions and shared logic
- `src/hooks`: Custom React hooks
- `src/types`: TypeScript types and interfaces

## Component Example

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
```

## Tailwind CSS Guidelines
- Use Tailwind utility classes directly in JSX
- Use `cn()` utility for conditional classes
- Prefer semantic class names over arbitrary values
- Use Tailwind configuration for consistent design tokens
- Leverage Tailwind's responsive prefixes for mobile-first design

## Git Workflow
1. Create feature branches from main
2. Write clear, concise commit messages
3. Follow conventional commit format when possible
4. Keep commits focused on single changes
5. Pull request descriptions should explain the "why" not just the "what"

## Dependencies
- Add new dependencies only when necessary
- Prefer lightweight, well-maintained libraries
- Check for existing dependencies before adding new ones
- Keep dependencies up to date with security patches

This guide should help agents understand the codebase structure and contribute effectively while maintaining consistency.