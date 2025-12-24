# Bot Builder - Mode Switcher Update

## 🎯 Changes Made

### 1. **Mode Switcher UI** ✅
- Added center screen with two mode buttons:
  - **🎯 Casual Bot**: Node-based conversational flow builder
  - **🤖 AI Bot**: Document training with RAG system
- Beautiful card-style buttons with hover animations
- Mode selection shown on startup

### 2. **Casual Bot Features** ✅
- **Predefined Educational Nodes**: 5 example questions with answers:
  1. "What is an embedding?" → Explains embeddings
  2. "What is chunking?" → Explains text chunking
  3. "What is a vector?" → Explains vectors
  4. "How does AI learn?" → Explains AI learning
  5. "Customize" → Triggers customize mode
  
- **Customize Mode**: 
  - Type "customize" in chat to enter customize mode
  - Clears example nodes and gives blank canvas
  - Enables node editing, dragging, and adding children
  - Starts with just Start and Fallback nodes

- **Protection in Example Mode**:
  - Cannot edit nodes (shows helpful message)
  - Cannot drag nodes (locked in place)
  - Cannot add child nodes (+ button hidden)
  - Must enter customize mode to build

### 3. **AI Bot Features** ✅
- Shows training interface directly
- "Start Training" button opens knowledge modal
- Full RAG training pipeline with chunking and embeddings
- Maintains all existing AI functionality

### 4. **Removed Features** ✅
- ❌ Save Tree button (removed from menu)
- ❌ Load Tree button (removed from menu)
- ❌ Reset Tree button (removed from menu)
- ❌ All related event handlers and file upload logic

### 5. **Updated Menu** ✅
- Now only contains:
  - 📚 Train from Book/Text (works in both modes)

## 🎨 Visual Changes

### Mode Switcher
- Centered layout with gradient background
- Large mode cards with icons and descriptions
- Smooth hover animations (lift effect)
- Color-coded borders on hover (cyan for Casual, green for AI)

### Example Nodes
- Special styling with opacity for visual distinction
- Non-interactive in example mode
- Informative content about AI concepts

### Customize Mode
- Full interactivity enabled
- Clean canvas to start building
- All node editing features active

## 🚀 How to Use

### For Children (Casual Bot):
1. Click "🎯 Casual Bot" on startup
2. Click "🧪 Test Bot" to try example conversations
3. Ask about embeddings, chunking, vectors, or AI learning
4. Type "customize" to start building your own bot
5. In customize mode:
   - Double-click nodes to edit
   - Use + button to add children
   - Drag nodes to reposition

### For AI Bot:
1. Click "🤖 AI Bot" on startup
2. Click "📚 Start Training" 
3. Upload PDF/text documents
4. Train the AI with your content
5. Test with "🧪 Test Bot"

## 📋 Files Modified

1. **index.html**
   - Added mode switcher section
   - Removed save/load/reset tree buttons
   - Restructured layout for mode sections

2. **app.js**
   - Added predefined educational nodes
   - Implemented mode switching logic
   - Added customize mode functionality
   - Removed save/load/reset tree functions
   - Protected example nodes from editing/dragging
   - Added customize trigger in conversation flow

3. **styles.css**
   - Added mode switcher styles
   - Added bot section layouts
   - Added example node styling
   - Updated responsive design

## ✨ Key Features

- ✅ Educational example nodes teach kids about AI
- ✅ Protected example mode prevents accidental changes
- ✅ Smooth transition to customize mode
- ✅ Separate AI training interface
- ✅ Cleaner menu without save/load options
- ✅ Child-friendly UI and messaging
- ✅ Maintains all existing functionality

## 🧪 Testing Checklist

- [ ] Mode switcher appears on startup
- [ ] Casual mode shows example nodes
- [ ] Example nodes are not editable/draggable
- [ ] Asking example questions works
- [ ] "Customize" command triggers customize mode
- [ ] Customize mode allows full editing
- [ ] AI mode shows training interface
- [ ] Training modal opens correctly
- [ ] Test bot works in both modes
- [ ] No console errors

---

**Made with ❤️ for young bot builders!**
