# VERY IMPORTANT

docker-compose up -d
docker-compose exec backend npx prisma db push

# 3. Test it works

curl http://localhost:3000/health

# Should return: {"status":"healthy"...}

# 4. Open n8n in browser

# Go to: http://localhost:5678

sign up in n8n, get your api key then register in my app.
then take the token for jwt and do:
POST http://localhost:3000/api/workflows
and in body put
{
"description": "Send email when every monday at 9PM, Tuesday at 9AM"
}

```bash
# Register a new user (replace with your details)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "n8nUrl": "http://n8n:5678",
    "n8nApiKey": "your_api_key_here"
  }'

# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Create a workflow (use the token from login response)
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \

  -d '{
    "description": "Send email when every monday at 9PM, Tuesday at 9AM"
  }'
```

### 6. Verify in n8n

- Go back to http://localhost:5678
- Check **Workflows** tab
- You should see a new "AI Generated Workflow"
- Click on it to view the auto-generated workflow nodes
