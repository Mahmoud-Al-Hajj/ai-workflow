# Gemini API Update - Quick Start Guide

## Status: Complete

The Gemini API has been successfully updated to use the modern Google Generative AI SDK.

### Server Status

```
  Server running on port 3000
  All environment variables configured
  Gemini API integration working
```

## Key Changes

### 1. SDK Migration

- **OLD**: axios REST API (outdated endpoint)
- **NEW**: @google/generative-ai SDK (modern, official)
- **Model**: gemini-2.0-flash (latest, fastest)

### 2. Files Updated

- `src/services/aiService.js` - API call replaced
- `package.json` - Dependency added and installed

### 3. Environment Setup

Ensure `.env` includes:

```
GEMINI_API_KEY=your_key_here
```

Get a free key: https://aistudio.google.com/apikey

## Testing the Integration

### Test 1: Health Check

```bash
curl http://localhost:3000/api/health
```

### Test 2: Generate Workflow from Text

```bash
# First, get a JWT token
TOKEN=$(curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "YourPassword123"
  }' | jq -r '.token')

# Then generate a workflow
curl -X POST http://localhost:3000/api/workflows/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "When I get a new email, send an auto-reply"
  }'
```

### Test 3: Create and Run Workflow

```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Auto-Reply Workflow",
    "description": "Automatically reply to emails",
    "trigger": "gmail.trigger",
    "actions": [{
      "action": "gmail.send_email",
      "params": {
        "to": "{{$json.sender}}",
        "subject": "Auto-reply: {{$json.subject}}",
        "message": "Thanks for your email!"
      },
      "mode": "sequential"
    }]
  }'
```

## Testing Suite

See **TEST_COMMANDS.md** for comprehensive test coverage:

- 13 different test scenarios
- Security validation tests
- Rate limiting tests
- Authorization checks
- Workflow generation tests

## Troubleshooting

| Issue                                   | Solution                               |
| --------------------------------------- | -------------------------------------- |
| Module not found: @google/generative-ai | Run `npm install`                      |
| GEMINI_API_KEY not set                  | Add to .env and restart                |
| 429 Rate Limit                          | Retry logic handles this automatically |
| No response from /api/health            | Check server is running on port 3000   |

## All Security Fixes Included

From previous code review implementation:

- Authorization checks (horizontal privilege escalation prevention)
- Rate limiting (5/15min on auth endpoints)
- Password validation (12+ character minimum)
- Input validation on all endpoints
- Promise error handling
- ID validation with parseInt safety checks

## Next Steps

1. **Test the API**: Use TEST_COMMANDS.md for complete test suite
2. **Run Prisma Migration** (if first time):
   ```bash
   npx prisma migrate dev --name add_error_field_to_workflow
   ```
3. **Deploy**: Ready for production use

## Server Commands

```bash
# Start development server
npm run start:dev

# Start with Prisma migration
npm run start

# Reset database (dev only)
npm run prisma:reset

# Generate Prisma client
npm run prisma:generate

# Docker commands
npm run docker:build
npm run docker:run
npm run docker:stop
```

## API Endpoints

### Authentication

- `POST /api/users/register` - Create new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires auth)

### Workflows

- `GET /api/workflows` - List user workflows
- `POST /api/workflows` - Create workflow
- `POST /api/workflows/generate` - Generate from text (NEW!)
- `GET /api/workflows/:id` - Get workflow details
- `DELETE /api/workflows/:id` - Delete workflow

### System

- `GET /api/health` - Health check

## Support

For issues or questions:

1. Check TEST_COMMANDS.md for expected behavior
2. Review GEMINI_UPDATE_SUMMARY.md for technical details
3. Check server logs for error messages
