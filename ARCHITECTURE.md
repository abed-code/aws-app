# Architecture

Clean architecture, organized by feature. Dependencies point **inward only**:

```
presentation ─┐
              ├──► application ──► domain
infrastructure┘
```

```
src/
├── app/                      Next.js routes. Thin: compose features, nothing else.
├── features/
│   ├── notes/
│   │   ├── domain/           Note entity + rules (createNoteDraft, isNoteId). Pure TS.
│   │   ├── application/      NotesRepository port + use cases (list/create/delete).
│   │   ├── infrastructure/   Adapters: Drizzle/Aurora repository, cache wrapper, table.
│   │   ├── presentation/     React components + server actions.
│   │   ├── notes.module.ts   Composition root: wires adapters into use cases.
│   │   └── index.ts          Public API (what pages may import).
│   └── auth/                 Same shape: User, session, Cognito sign-in flow, UI.
└── shared/
    ├── application/          Cross-feature ports (Cache).
    ├── infrastructure/       Aurora pool + IAM auth, Valkey client + IAM tokens.
    └── presentation/         Cross-feature UI (AwsLoginNotice).
```

## What each layer may import

| Layer | May import | Must not import |
|---|---|---|
| `domain` | itself | everything else |
| `application` | `domain`, `shared/application` | frameworks, Drizzle, AWS, Valkey, infrastructure, presentation |
| `infrastructure` | anything inward + drivers | presentation |
| `presentation` | the feature's module, domain, other features' `index.ts` | another feature's internals |

The `domain` and `application` rules are enforced by ESLint (`pnpm lint`).

## Adding a feature

1. `domain/`: entity type and rules.
2. `application/`: a repository port and one use case per action (`makeX(repo)`).
3. `infrastructure/`: table + repository adapter; export the table from
   `src/shared/infrastructure/db/schema.ts`, then `pnpm db:generate && pnpm db:migrate`.
4. `<feature>.module.ts`: wire adapters into use cases.
5. `presentation/` + `index.ts`, then use it from a page in `src/app`.
6. Unit-test domain and use cases with an in-memory repository (`pnpm test`).
