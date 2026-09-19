# AI Workflow Backend - Test Commands

## Prerequisites

1. Start the application first:

   ```bash
   npm run start:dev
   ```

   The server should start on `http://localhost:3000`

2. Ensure all environment variables are set:
   ```
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ENCRYPTION_SECRET=your_encryption_secret
   GEMINI_API_KEY=your_gemini_api_key
   N8N_URL=your_n8n_url
   N8N_API_KEY=your_n8n_api_key
   NODE_ENV=development
   ```

## Test 1: Health Check

Verify the API is running:

```bash
curl -X GET http://localhost:3000/health
```

## Test 2: User Registration (Test Password Validation)

Register a new user and verify password requirements (minimum 12 characters):

**FAIL - Password too short (should reject):**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "short123",
    "n8nUrl": "https://n8n.example.com",
    "n8nApiKey": "test_key_123"
  }'
```

**PASS - Valid password (12+ characters):**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "ValidPassword123",
    "n8nUrl": "https://n8n.example.com",
    "n8nApiKey": "test_key_123"
  }'
```

## Test 3: User Login

Login with registered credentials:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "ValidPassword123"
  }'
```

Save the `token` from the response for subsequent requests.

## Test 4: Authentication Rate Limiting

Test the stricter auth rate limiter (5 requests per 15 minutes):

Make 6 rapid login attempts with invalid credentials:

```bash
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "WrongPassword123"
    }' -w "\nRequest $i: %{http_code}\n"
  sleep 1
done
```

Expected: Requests 1-5 return 401 (Unauthorized), Request 6+ return 429 (Too Many Requests)

## Test 5: Authorization Check - Get User Profile

Get authenticated user profile with valid token:

```bash
curl -X GET http://localhost:3000/api/users/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Test 6: Authorization Check - Update User

Update user account (should prevent updating other users' accounts):

**Valid - Update own account:**

```bash
curl -X PUT http://localhost:3000/api/users/YOUR_USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "newemail@example.com",
    "n8nUrl": "https://n8n.new.example.com"
  }'
```

**Invalid - Try to update another user's account:**

```bash
curl -X PUT http://localhost:3000/api/users/ANOTHER_USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "hacked@example.com"
  }'
```

Expected: 403 Forbidden (only admin or user themselves can update)

## Test 7: Workflow Creation (Test n8n Credential Validation)

Create a new workflow with valid Gemini API integration:

```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Sample Workflow",
    "description": "When a user signs up, send a welcome email",
    "trigger": "webhook.received",
    "actions": [
      {
        "action": "gmail.send_email",
        "params": {
          "to": "user@example.com",
          "subject": "Welcome!",
          "message": "Thanks for signing up!"
        },
        "mode": "sequential"
      }
    ]
  }'
```

## Test 8: Gemini AI Integration - Generate Workflow

Test the new Gemini API SDK integration for workflow generation:

```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "description": "When I receive a new email, extract the sender and send them a reply saying thanks"
  }'
```

Expected response: **201 with a PENDING workflow**, not a finished one. Generation
runs in the background, so the Definition is not built yet when this returns.
Poll `GET /api/workflows/:id` until `status` becomes `ACTIVE` (or `FAILED`, with
the reason in `error`).

## Test 9: Get Workflows

List workflows for the authenticated user:

```bash
curl -X GET http://localhost:3000/api/workflows/user/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

List **every** user's workflows — admin only:

```bash
curl -X GET http://localhost:3000/api/workflows \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

Expected: 200 for an admin, 403 for a non-admin, 401 with no token.

## Test 10: Workflow Authorization Check

Test that users cannot access workflows they don't own:

1. Create a workflow as User A (save the workflow ID)
2. Login as User B
3. Try to get the workflow:

```bash
curl -X GET http://localhost:3000/api/workflows/WORKFLOW_ID \
  -H "Authorization: Bearer USER_B_TOKEN"
```

Expected: 403 Forbidden (only owner or admin can access)

## Test 11: Delete Workflow - Authorization Check

Test that users cannot delete workflows they don't own:

```bash
curl -X DELETE http://localhost:3000/api/workflows/WORKFLOW_ID \
  -H "Authorization: Bearer USER_B_TOKEN"
```

Expected: 403 Forbidden

## Test 12: Error Field in Workflow Model

Verify that workflow errors are properly stored:

1. Create a workflow with invalid n8n credentials
2. Check the workflow response includes the `error` field:

```bash
curl -X GET http://localhost:3000/api/workflows/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  | grep -i "error"
```

## Test 13: Input Validation

Test validation of invalid workflow inputs:

```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "",
    "description": "Invalid - empty name",
    "actions": []
  }'
```

Expected: 400 Bad Request with validation error

## Database Migration (Before First Run)

If this is your first run after schema changes, run the Prisma migration:

```bash
npx prisma migrate dev --name add_error_field_to_workflow
```

This adds the optional `error` field to the Workflow model.

## Troubleshooting

### Issue: "GEMINI_API_KEY is not set"

- Ensure your `.env` file includes: `GEMINI_API_KEY=your_actual_key`
- Get a free key from: https://aistudio.google.com/apikey

### Issue: "Cannot find module '@google/generative-ai'"

- Run: `npm install` in the backend directory
- Verify package.json includes: `"@google/generative-ai": "^0.5.0"`

### Issue: Database connection errors

- Ensure DATABASE_URL is set correctly
- Check Prisma is initialized: `npx prisma migrate deploy`

### Issue: JWT token errors

- Ensure JWT_SECRET is set in .env
- Token should be passed in Authorization header as: `Authorization: Bearer TOKEN`

## Expected Behavior Summary

**Security Fixes Applied:**

- Authorization checks prevent horizontal privilege escalation
- Stricter auth rate limiting (5/15min) prevents brute force
- Input validation on all endpoints
- Proper error handling with Promise chains

  **Gemini API Updated:**

- Now uses @google/generative-ai SDK (modern endpoint)
- Supports gemini-2.0-flash model
- Improved error handling with retry logic
- Returns proper JSON workflow structures

  **Password Policy:**

- Minimum 12 characters required (changed from 6)
- Case-sensitive
- Must include alphanumeric characters
