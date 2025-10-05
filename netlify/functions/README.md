# Netlify Functions Configuration
# This file configures how Netlify handles your API routes

# For Next.js API routes, you have two options:
# 1. Convert them to Netlify Functions (recommended for better performance)
# 2. Use them as-is with Next.js static export (simpler but less optimal)

# Option 1: Convert to Netlify Functions
# Move your API routes from src/app/api/ to netlify/functions/
# Each route should be a separate function file

# Option 2: Keep as Next.js API routes
# Your current API routes will work with static export, but they'll be client-side only
# For server-side functionality, you'll need to deploy your backend separately

# Recommended approach:
# 1. Deploy your FastAPI backend separately (e.g., on Railway, Heroku, or AWS)
# 2. Update your frontend to use the deployed backend URL
# 3. Keep the frontend as a static site on Netlify

# Example Netlify Function structure:
# netlify/functions/
#   ├── auth.js
#   ├── chat.js
#   ├── market-quote.js
#   └── news.js
