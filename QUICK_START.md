# Quick Start Guide

## Starting the Application

### 1. Start Backend Server

**Option A: Using the startup script**
```bash
cd /Users/saitejachakravarthula/Desktop/Desktop/Test_1.0/TEST
./start_backend.sh
```

**Option B: Manual start**
```bash
cd /Users/saitejachakravarthula/Desktop/Desktop/Test_1.0/TEST/backend
source venv/bin/activate
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Start Frontend Server (in a new terminal)

```bash
cd /Users/saitejachakravarthula/Desktop/Desktop/Test_1.0/TEST/frontend
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Verify Everything is Working

1. **Check Backend Health**:
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Check NIFTY 50 Data**:
   ```bash
   curl "http://localhost:8000/api/v1/stocks/%5ENSEI"
   ```
   Should return NIFTY 50 stock data

3. **Open Analysis Page**:
   - Go to http://localhost:3000/dashboard/analysis
   - You should see NIFTY 50 data loading automatically

## Troubleshooting

### Backend won't start
- Check if port 8000 is already in use: `lsof -ti:8000`
- Check backend logs for errors
- Make sure virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`

### Frontend shows "Company not found"
- Make sure backend is running on port 8000
- Check browser console (F12) for errors
- Verify backend health endpoint works
- Check Network tab for failed API requests

### No data in Analysis section
- Backend must be running
- Check browser console for `[Analysis]` and `[API]` logs
- Verify symbol is `^NSEI` for NIFTY 50
- Try refreshing the page
