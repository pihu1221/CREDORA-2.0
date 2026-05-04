# Security Specification - Credora

## 1. Data Invariants
- **User Ownership**: All data under `/users/{userId}/**` must strictly belong to the user with `request.auth.uid == userId`.
- **Relational Integrity**: Sub-collections (tasks, projects, etc.) must only exist if the parent user document exists (checked via `exists()` or implicit ownership).
- **Immutable Fields**: `uid`, `email`, and `createdAt` must never change after creation.
- **Verification**: Sensitive recruiter status (`verified`) must not be user-writable.
- **Type Safety**: All scores must be integers, all IDs must match `isValidId()`.

## 2. The "Dirty Dozen" Payloads
These payloads attempt to bypass security and must be rejected.

1. **Identity Spoofing**: Attempt to update `/users/attackerId` with `uid: "victimId"`.
2. **Privilege Escalation**: Attempt to update `/users/myId` with `isPremium: true`.
3. **Cross-User Write**: Attempt to create `/users/victimId/tasks/task1` as `attackerId`.
4. **Invalid ID Poisoning**: Create a document with ID `../../secrets/config` or a 2KB string.
5. **Timestamp Fraud**: Set `createdAt` to a date in the past instead of `request.time`.
6. **Recruiter Bypass**: Attempt to set `verified: true` on a recruiter profile by the recruiter themselves.
7. **Job Spoofing**: Create a Job listing with a `companyId` that doesn't belong to the recruiter.
8. **Resource Exhaustion**: Send a `message` field in `coachChat` that is 2MB.
9. **Terminal State Violation**: Modify a completed `Assessment` score.
10. **Orphaned Writes**: Create a `Certificate` for a `userId` that doesn't exist in the system.
11. **Shadow Fields**: Add `role: "admin"` to a User document.
12. **Unverified Auth**: Perform writes with an email that hasn't been verified (if mandatory).

## 3. Test Runner Concept (firestore.rules.test.ts)
Tests will verify that:
- `auth == null` results in `PERMISSION_DENIED` for private data.
- `auth.uid != userId` results in `PERMISSION_DENIED` for user data.
- Writes without `isValid[Entity]` results in `PERMISSION_DENIED`.
- Updates to immutable fields results in `PERMISSION_DENIED`.
