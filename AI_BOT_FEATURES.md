# AI Bot Full-Screen Update - Educational Features

## Overview
The AI Bot now has a full-screen interface with enhanced educational features:
- Auto-loads PDFs from books folder for initial training
- Tracks student questions
- Offers personalized training after 3 questions
- Restricts to one PDF upload per student

## Features Added

### 1. Full-Screen AI Bot
- **Changed**: AI bot section now takes full screen width
- **CSS Modified**: `.ai-bot-section` and `.bot-panel` styles updated
- **Result**: Immersive chat experience without sidebars

### 2. Auto-Load Initial PDFs
- **Location**: `books/` folder
- **Function**: `loadInitialPDFs()` in `app.js`
- **How it works**:
  1. Add PDF files to `books/` folder
  2. Update `pdfFiles` array in `app.js` (line ~161)
  3. PDFs automatically load when entering AI Bot mode
  4. Bot displays list of trained documents in welcome message

### 3. Question Tracking
- **Variable**: `aiQuestionCount` tracks questions asked
- **Purpose**: Monitor student engagement
- **Increments**: Each time student asks a question

### 4. Training Offer After 3 Questions
- **Trigger**: After student asks 3rd question
- **Message**: "💡 You can also train me on your own data! Would you like to upload your own PDF document? (Type 'yes' to proceed)"
- **Response**: Typing "yes" opens training modal
- **One-time**: Offer shown only once per session

### 5. Single PDF Upload Restriction
- **Limitation**: Students can only upload ONE PDF
- **Enforcement**: `userHasTrained` flag prevents multiple uploads
- **File Type**: Only PDF files allowed (no .txt in AI mode after training offer)
- **Message**: "⚠️ You have already trained me with your document! You can only upload one PDF at a time."

## Setup Instructions

### Step 1: Add Initial Training PDFs
1. Place your PDF files in the `books/` folder
2. Open `app.js`
3. Find the `loadInitialPDFs()` function (around line 161)
4. Update the `pdfFiles` array:

```javascript
const pdfFiles = [
  'mathematics.pdf',
  'science.pdf',
  'history.pdf',
];
```

### Step 2: Configure API Keys
1. Open the Knowledge Base modal
2. Select API provider (BookEinstein or your own OpenAI/Gemini key)
3. Enter API key
4. Save settings

### Step 3: Test the Flow
1. Click "AI Bot" mode
2. Wait for PDFs to load (loading message appears)
3. Welcome message shows list of trained documents
4. Ask 3 questions
5. After 3rd question, training offer appears
6. Type "yes" to open training modal
7. Upload ONE PDF
8. Ask questions about both initial and uploaded PDFs

## User Experience Flow

```
1. Student clicks "AI Bot"
   ↓
2. Bot loads PDFs from books/ folder
   "📚 Loading initial training documents, please wait..."
   ↓
3. Welcome message displays:
   "Welcome to AI Bot! 🤖
   
   I am initially trained on the following documents:
   1. mathematics.pdf
   2. science.pdf
   3. history.pdf
   
   You can ask me any questions about these topics!"
   ↓
4. Student asks Question 1
   → Bot answers
   ↓
5. Student asks Question 2
   → Bot answers
   ↓
6. Student asks Question 3
   → Bot answers
   → Bot shows: "💡 You can also train me on your own data!..."
   ↓
7. Student types "yes"
   → Training modal opens
   ↓
8. Student uploads their own PDF
   → Bot trains on new PDF
   → userHasTrained = true
   ↓
9. Student asks more questions
   → Bot answers using BOTH initial PDFs and student's PDF
   ↓
10. If student tries to upload again
    → Error: "⚠️ You have already trained me with your document!"
```

## Technical Details

### Variables Added
```javascript
let aiQuestionCount = 0;        // Track questions in AI mode
let aiTrainingOffered = false;   // Track if training offer shown
let userHasTrained = false;      // Track if user uploaded their PDF
let initialPDFs = [];            // Store names of initially loaded PDFs
```

### Functions Modified
1. **`startConversationAI()`**
   - Resets question count and training state
   - Displays list of initially trained PDFs
   - Shows fallback message if no PDFs loaded

2. **`sendMessageAI()`**
   - Detects "yes" response to training offer
   - Increments question counter
   - Shows training offer after 3rd question
   - Opens training modal on "yes"

3. **`saveKnowledge` event handler**
   - Checks if user already trained (prevents multiple uploads)
   - Validates PDF file type in AI mode
   - Sets `userHasTrained = true` after successful training

4. **`switchToAIMode()`**
   - Calls `loadInitialPDFs()` before showing welcome
   - Waits for PDFs to load before displaying message

5. **`loadInitialPDFs()` (NEW)**
   - Reads PDF files from books/ folder
   - Extracts text using PDF.js
   - Trains RAG system with extracted text
   - Populates `initialPDFs` array with loaded filenames

### CSS Changes
```css
/* Full-screen AI bot section */
.ai-bot-section {
  display: flex;
  flex-direction: row;  /* Changed from column */
  width: 100%;          /* NEW */
  height: 100%;         /* NEW */
}

/* Full-width chat panel */
.bot-panel {
  width: 100%;          /* Changed from 400px */
  flex: 1;              /* NEW */
}
```

## Files Modified
1. **app.js** - Added question tracking, training offer logic, PDF auto-loading
2. **styles.css** - Changed layout to full-screen
3. **books/README.md** - Instructions for adding PDFs

## Testing Checklist
- [ ] AI bot displays full screen
- [ ] PDFs auto-load from books folder
- [ ] Welcome message shows list of trained documents
- [ ] Question counter increments correctly
- [ ] Training offer appears after 3rd question
- [ ] Typing "yes" opens training modal
- [ ] Only PDF files accepted in training modal
- [ ] Second upload attempt blocked with error message
- [ ] Bot answers questions from both initial and student PDFs

## Notes
- Students can reset chat with 🔄 Reset button to start over
- Initial PDF list must be manually updated in `app.js`
- For server deployment, consider implementing automatic directory listing
- BookEinstein API is default, but users can configure their own keys
