# 🧪 How to Test the New Pipeline Display

## Steps to See Chunk and Embedding Examples:

1. **Open the App**
   - Open `index.html` in your browser
   - Press `Ctrl + F5` to force refresh (clear cache)

2. **Open Training Modal**
   - Click "☰ Menu" button
   - Click "📚 Train from Book/Text"

3. **Add Some Text**
   - Either paste text in the textarea, OR
   - Upload a .txt or .pdf file
   - Example text you can paste:
   ```
   The quick brown fox jumps over the lazy dog. This is a test of the chunking system.
   
   Artificial intelligence is the simulation of human intelligence. It helps computers learn and make decisions.
   
   Machine learning is a subset of AI. It allows systems to learn from data without being explicitly programmed.
   ```

4. **Train the Bot**
   - Make sure "Use BookEinstein API" is selected (default)
   - Click "Save & Train" button
   - Watch the processing steps light up

5. **Look at Step 2 & 3**
   - After training completes, scroll in the right panel
   - **Step 2 (Text Chunking)** should now show:
     - Green box with "📝 Example Chunks:"
     - First 4-5 chunks from your text
     - Example: "Chunk 1: The quick brown fox jumps..."
   
   - **Step 3 (Converting to AI Language)** should show:
     - Blue box with "🔢 Example Embeddings:"
     - First 4-5 vector representations
     - Example: "Vector 1: [quick:1.00, brown:1.00, fox:1.00... 8 words]"

## 🔍 What You Should See:

### Before Training:
```
2. Text Chunking
Split text into smaller paragraphs...
Chunks: 0
```

### After Training:
```
2. Text Chunking
Split text into smaller paragraphs...
Chunks: 58

📝 Example Chunks:
┌─ Chunk 1: "The quick brown fox jumps over the lazy dog. This is a test..."
├─ Chunk 2: "Artificial intelligence is the simulation of human intelligence..."
└─ Chunk 3: "Machine learning is a subset of AI. It allows systems to learn..."
```

## 💡 Tips:

- **Use Ctrl + F5** to hard refresh if you don't see changes
- **Check browser console** for "✅ Showing X chunk examples" messages
- **Try longer text** for more interesting chunks
- **Scroll down** in the pipeline panel to see all examples

## 🐛 If Examples Don't Show:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for any errors
4. You should see: "✅ Showing 5 chunk examples" and "✅ Showing 5 embedding examples"
5. If not, refresh the page with Ctrl + F5

---

**The examples will appear as scrollable boxes with borders in Step 2 and Step 3!** 📊
