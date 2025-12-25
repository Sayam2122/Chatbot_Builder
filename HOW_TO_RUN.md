# How to Run Chatbot Builder

## 🚨 IMPORTANT: You MUST use a local web server!

### Why?
Opening `index.html` directly in your browser (file:// protocol) causes CORS errors that prevent PDFs from loading. You need to run a local web server.

---

## ✅ Quick Start (Easy Method)

### For Windows:
**Double-click** `START_SERVER.bat`

Then open your browser and go to:
```
http://localhost:8000
```

### For Mac/Linux:
Open Terminal in this folder and run:
```bash
python3 -m http.server 8000
```

Then open your browser and go to:
```
http://localhost:8000
```

---

## Alternative Methods

### Using Node.js (if installed):
```bash
npx http-server -p 8000
```

### Using PHP (if installed):
```bash
php -S localhost:8000
```

### Using VS Code:
1. Install "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

---

## 🎯 After Server Starts

1. Open browser to `http://localhost:8000`
2. Click **"AI Bot"** button
3. Wait for PDFs to load (check browser console F12)
4. Start chatting!

---

## 📝 Adding Your Own PDFs

1. Place PDF files in the `books/` folder
2. Edit `app.js` around line 167
3. Update the array:
   ```javascript
   const pdfFiles = [
     'textbook1.pdf',
     'textbook2.pdf',
     'thebook.pdf',
   ];
   ```
4. Refresh browser
5. PDFs will auto-load when you click "AI Bot"

---

## 🛑 To Stop Server

Press `Ctrl + C` in the terminal/command prompt window

---

## ⚠️ Troubleshooting

**Port 8000 already in use?**
- Try a different port: `python -m http.server 8080`
- Access at: `http://localhost:8080`

**Python not found?**
- Install Python from: https://www.python.org/downloads/
- Make sure to check "Add to PATH" during installation

**PDF still not loading?**
1. Check browser console (F12)
2. Verify PDF exists in `books/` folder
3. Verify API key in `config.js`
4. Make sure you're accessing via `http://localhost` not `file://`

---

## 🔒 Security Note

This server is only accessible from your local computer. It's safe for development and testing.
