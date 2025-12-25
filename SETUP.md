# Setup Instructions

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Sayam2122/Chatbot_Builder.git
cd Chatbot_Builder
```

### 2. Configure API Keys

#### Option A: Using config.js
1. Copy the template file:
   ```bash
   copy config.example.js config.js
   ```
2. Open `config.js` and add your API keys
3. Save the file (it won't be pushed to git)

#### Option B: Using .env
1. Copy the template file:
   ```bash
   copy .env.example .env
   ```
2. Open `.env` and add your API keys
3. Save the file (it won't be pushed to git)

### 3. Add Training PDFs (Optional)
1. Place your PDF files in the `books/` folder
2. Open `app.js` and find line ~161
3. Update the `pdfFiles` array with your PDF filenames:
   ```javascript
   const pdfFiles = [
     'textbook.pdf',
     'reference.pdf',
   ];
   ```

### 4. Open the Application
1. Open `index.html` in your web browser
2. Click "AI Bot" to start
3. Bot will auto-load PDFs and show welcome message

## Important Security Notes

⚠️ **Never commit these files to git:**
- `.env` - Contains API keys
- `config.js` - Contains API keys

✅ **These files are safe to commit:**
- `.env.example` - Template only
- `config.example.js` - Template only
- All other project files

The `.gitignore` file is configured to automatically exclude `.env` and `config.js` from git tracking.

## API Key Options

### BookEinstein API (Recommended)
- Default option
- Easy to set up
- Good for educational purposes

### OpenAI API
- More powerful
- Requires OpenAI account
- Pay-per-use

### Gemini API
- Google's AI
- Requires Google Cloud account
- Free tier available

## Need Help?

See documentation:
- `QUICK_START.md` - Quick start guide
- `AI_BOT_FEATURES.md` - Detailed feature documentation
- `books/README.md` - How to add PDFs
