# E2B Docker & Shell Script Notes

## Overview

E2B creates cloud-based development sandboxes. This setup creates a Next.js environment with shadcn/ui components that's instantly ready for AI code generation.

## Dockerfile Analysis

### Base Setup

```dockerfile
FROM node:21-slim
RUN apt-get update && apt-get install -y curl && apt-get clean
```

- Uses lightweight Node.js 21 image
- Installs curl for HTTP requests
- Cleans package cache to minimize image size

### Project Creation

```dockerfile
WORKDIR /home/user/nextjs-app
RUN npx --yes create-next-app@15.3.3 . --yes
RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force
RUN npx --yes shadcn@2.6.3 add --all --yes
```

- Creates Next.js 15.3.3 project with all defaults
- Initializes shadcn/ui with neutral theme
- Installs ALL shadcn/ui components at once

### Directory Restructuring

```dockerfile
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app
```

**Why this approach?**

- E2B AI agents work in `/home/user` directory
- `create-next-app` needs empty directory
- `/home/user` might have hidden files
- Solution: Create in subdirectory, then move to target

## compile_page.sh Script

### Purpose

Ensures Next.js dev server starts AND pre-compiles the home page during template creation.

### Script Breakdown

```bash
ping_server &                    # Background process
cd /home/user && npx next dev    # Foreground process
```

### The ping_server Function

```bash
function ping_server() {
    # Continuously polls localhost:3000
    # Waits for HTTP 200 response
    # Provides progress feedback every 20 attempts
}
```

### Execution Timeline

1. **Time 0s**: `ping_server` starts in background (fails, keeps retrying)
2. **Time 0s**: `npx next dev` starts in foreground
3. **Time 2s**: Next.js server becomes ready on `:3000`
4. **Time 2s**: Background ping succeeds → triggers home page compilation
5. **Time 3s**: Home page compiled and cached

## Next.js Lazy Compilation

### Development Mode Behavior

- **Traditional build**: All pages compiled upfront
- **Next.js dev mode**: Pages compiled only when first requested

### The Problem

```
User visits page → Next.js compiles (2-3 seconds) → Page loads
```

### The Solution

```
compile_page.sh → Pre-compiles home page → Instant loading for users
```

## Complete E2B Flow

### Template Creation

```
1. Dockerfile runs → Complete Next.js + shadcn project
2. compile_page.sh → Dev server + pre-compiled home page
3. Template saved → Ready for deployment
```

### User Experience

```
User creates sandbox → Everything ready instantly
├── ✅ Project exists (Dockerfile)
├── ✅ Dependencies installed (Dockerfile)
├── ✅ Server starts immediately (compile_page.sh)
└── ✅ Home page loads instantly (pre-compiled)
```

## Key Benefits

- **Instant startup**: No waiting for project creation or compilation
- **Rich component library**: All shadcn/ui components pre-installed
- **AI-optimized**: Directory structure perfect for AI code generation
- **Performance**: Turbopack bundler for faster builds

---

**After templates creation we need to build and push to e2b. Making it public will be easier during development process**

### Build the template

```bash
e2b template build --name <template_name> --cmd "/compile_page.sh"
```

### Publish the template (Make it public)

```bash
e2b template -t <team_id>
```
