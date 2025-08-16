# 📝 Inngest + AgentKit Workflow (Quick Notes)

### 1. Inngest Function

- Triggered by events (`test/hello.world` in this case).
- Defines steps with `step.run` → retryable, checkpointed, idempotent.
- Returns structured output at the end (sandbox URL, files, summary).

---

### 2. Sandbox Setup

- `sandboxId` → created via `Sandbox.create("pixie")`, wrapped in `step.run`.
- `sandboxUrl` → resolved later with `getHost(3000)`, also via `step.run`.
- **Why `step.run` here?** External + side-effecty, must survive retries.

---

### 3. Agent (via AgentKit)

- Created with `createAgent`:
  - **System prompt** (`SYSTEM_PROMPT`)
  - **Model** (OpenAI GPT-4.1)
  - **Tools** (extend what agent can do)

---

### 4. Tools

- **Terminal** → runs commands, returns stdout/stderr.
- **CreateOrUpdateFiles** → writes files, mutates `network.state.data.files` (no return).
- **ReadFiles** → reads files, returns contents.

👉 Rule:

- **Return** → when agent needs immediate output for reasoning.
- **Update `network.state`** → when output is just background state (not needed immediately).

---

### 5. Network Orchestration

- `createNetwork` bundles agents into a loop with a router.
- `network.state.data` = persistent memory for the whole run.
- Router checks `summary` → if present, stop the loop.
- Otherwise, keep sending control back to `codeAgent`.

---

### 6. Lifecycle

- `onResponse` hook inspects agent replies.
- If `<task_summary>` found → saved into `network.state.data.summary`.

---

### 7. Final Output

- Sandbox URL → preview running project.
- Files → whatever agent wrote in sandbox.
- Summary → task summary extracted from LLM response.

---

### 8. Key Takeaways

- **`step.run`** → use for external calls / retryable steps. Sequential or parallel depends on `await` pattern.
- **Network state persists** across steps and iterations.
- **Return vs mutate state** → depends on whether agent reasoning needs the data immediately.
- **Agent + tools + network = reasoning loop** orchestrated by Inngest.
