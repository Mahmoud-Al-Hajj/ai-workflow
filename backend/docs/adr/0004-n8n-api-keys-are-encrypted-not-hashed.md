# n8n API keys are encrypted, not hashed

A User's n8n API key is stored reversibly, encrypted with AES-256-GCM under a key derived from `ENCRYPTION_SECRET`, and decrypted on every Deployment. This sits beside a password column that is bcrypt-hashed, which looks inconsistent enough that someone will eventually try to "fix" it.

The two secrets are not the same kind of secret. A password is only ever compared against, so it can be hashed. An n8n API key must be *replayed* to the User's n8n Instance on every deploy, which means we have to be able to read it back. Hashing it would make Deployment impossible. GCM was chosen over plain CBC so that tampering with stored ciphertext fails loudly rather than decrypting to garbage.

## Consequences

`ENCRYPTION_SECRET` is now load-bearing: lose it and every stored n8n key is unrecoverable, and every User must re-enter their credentials. Rotating it requires decrypting and re-encrypting every row under the old secret first — there is no versioning in the stored format (`iv:ciphertext:authTag`) to support two keys at once, so rotation is a migration, not a config change.
