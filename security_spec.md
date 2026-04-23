# Security Specification: User Registration

## Data Invariants
- A user document must have a valid username (2-50 chars).
- A user document must have a valid @gmail.com email.
- The createdAt timestamp must be the exact server time of creation.
- verified must be true upon creation (since authentication happens before DB write).

## The Dirty Dozen (Attack Payloads)
1. **Shadow Field**: `{ username: "hacker", email: "h@gmail.com", createdAt: now, verified: true, isAdmin: true }` -> Rejected by key size check.
2. **Identity Spoofing**: Attempting to set `userId` to a specific string -> Handled by `addDoc` (Firestore generates ID), rules check Document ID if we used `setDoc`.
3. **Invalid Email**: `{ email: "hacker@evil.com" }` -> Rejected by regex.
4. **Time Spoofing**: `{ createdAt: timestamp_from_1990 }` -> Rejected by `request.time` check.
5. **Verified Falsehood**: `{ verified: false }` -> Rejected by `verified == true` check.
6. **Large Payload**: Username of 1MB -> Rejected by `.size()` check.
7. **Malformed ID**: document ID with emojis -> `isValidId` check (if applied to path).
8. **Missing Fields**: `{ username: "hacker" }` -> Rejected by `hasAll` check.
9. **Update Hijack**: Trying to update an existing user -> Rejected (no `allow update`).
10. **Delete Attack**: Trying to delete a user -> Rejected (no `allow delete`).
11. **Read Scrape**: Trying to list all users -> Rejected (no `allow list`).
12. **Get Probe**: Trying to get a specific user -> Rejected (no `allow get`).
