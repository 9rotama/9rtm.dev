---
name: create-worktree
description: Create and validate a sibling Git worktree for this project from a natural-language feature, fix, documentation, refactoring, or maintenance request. Use when asked to create, cut, prepare, or set up a new worktree for upcoming development work.
---

# Create Worktree

1. Translate the requested work into a concise English kebab-case name containing only lowercase letters, numbers, and hyphens. Preserve the request's meaning; do not include the branch type in the name.
2. Select a branch type. Use `fix` for bug fixes, `docs` for documentation, `refactor` for refactoring, and `chore` for maintenance. Use `feat` for features and whenever the type is ambiguous.
3. Run the repository script from the main branch in the main worktree without asking for confirmation:

   ```sh
   ./scripts/create-worktree --type TYPE WORKTREE_NAME
   ```

4. Let the script ask whether to copy `.env.local` and `.dev.vars`. Never bypass or answer this secret-copy confirmation on the user's behalf.
5. Report success or the failure reason. On success, include the branch and worktree path printed by the script.

The repository script owns all deterministic validation, creation, environment-file copying, dependency installation, and static checking. Do not duplicate those operations in this skill or manually reuse an existing branch or worktree after the script rejects it.
