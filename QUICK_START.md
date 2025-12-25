# Quick Start Guide - AI Bot Educational Features

## What's New?
✅ **Full-screen AI bot** - Immersive chat experience
✅ **Auto-load PDFs** - Pre-train bot with textbooks from books/ folder
✅ **Question tracking** - Monitors student engagement
✅ **Smart training offer** - After 3 questions, students can add their own PDF
✅ **One PDF limit** - Students can only upload ONE additional document

## Quick Setup (3 Steps)

### 1️⃣ Add Your PDFs to books/ Folder
```
Build_Chatbot/
  └── books/
      ├── mathematics.pdf
      ├── science.pdf
      └── history.pdf
```

### 2️⃣ Update app.js (Line ~161)
```javascript
const pdfFiles = [
  'mathematics.pdf',
  'science.pdf',
  'history.pdf',
];
```

### 3️⃣ Open in Browser
1. Open `index.html`
2. Click "AI Bot"
3. Bot auto-loads PDFs and shows welcome message!

## Example Welcome Message

```
Welcome to AI Bot! 🤖

I am initially trained on the following documents:
1. mathematics.pdf
2. science.pdf
3. history.pdf

You can ask me any questions about these topics!
```

## Student Flow

| Step | Action | Result |
|------|--------|--------|
| 1 | Click "AI Bot" | PDFs load automatically |
| 2 | Ask Question 1 | Bot answers from trained PDFs |
| 3 | Ask Question 2 | Bot answers from trained PDFs |
| 4 | Ask Question 3 | Bot answers + shows training offer |
| 5 | Type "yes" | Training modal opens |
| 6 | Upload own PDF | Bot trains on new document |
| 7 | Ask more questions | Bot uses BOTH initial + student PDF |
| 8 | Try upload again | ❌ Error: "Already trained!" |

## Important Notes

⚠️ **API Key Required**: Configure BookEinstein API or your own OpenAI/Gemini key in the training modal

⚠️ **Manual PDF List**: Currently, you must manually add PDF filenames to `app.js`. See `books/README.md` for details.

⚠️ **One PDF Rule**: Students can only upload ONE additional PDF. This encourages focused learning.

⚠️ **PDF.js Dependency**: Make sure PDF.js library is loaded (already included in index.html)

## Troubleshooting

**PDFs not loading?**
- Check PDF filenames match exactly in `app.js`
- Check PDFs are in `books/` folder
- Check browser console for errors

**Training offer not appearing?**
- Ask at least 3 questions first
- Check `aiQuestionCount` is incrementing
- Offer only appears once per session

**Can't upload PDF?**
- Check if you already uploaded one (only 1 allowed)
- Check file is .pdf format
- Check API key is configured

**Bot not answering?**
- Configure API key in training modal
- Check knowledge base is trained
- Check browser console for API errors

## Need Help?

See detailed documentation in:
- `AI_BOT_FEATURES.md` - Full feature documentation
- `books/README.md` - How to add PDFs
- Browser console - Check for error messages
