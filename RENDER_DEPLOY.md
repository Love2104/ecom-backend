# ShopEase Backend - Render Deployment

## Quick Deploy to Render

### Build Command
```
npm install && npm run build
```

### Start Command
```
npm start
```

### Environment Variables Required
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- EMAIL_USER
- EMAIL_PASS
- FRONTEND_URL
- NODE_ENV=production

### Health Check Endpoint
`/health`

### Port
Application runs on PORT environment variable (Render provides this automatically)
