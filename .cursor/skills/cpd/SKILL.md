---
name: cpd
description: >-
  Commit, push, and deploy changed repos (guitars API and/or guitars-webapp).
  Use when the user says /cpd, cpd, commit push deploy, or asks to ship changes
  to production.
---

# Commit push deploy (`/cpd`)

Same workflow as the API repo skill. Full instructions:

**[`../guitars/.cursor/skills/cpd/SKILL.md`](../guitars/.cursor/skills/cpd/SKILL.md)**

Deploy config lives in the **guitars** repo:

```
../guitars/.agents/config/cpd.env
```

(example: `../guitars/.agents/config/cpd.env.example`)

When `/cpd` is used from this webapp workspace, commit/push/deploy **guitars-webapp** here; use the sibling **guitars** repo for API commits/deploys and for loading `cpd.env`.
