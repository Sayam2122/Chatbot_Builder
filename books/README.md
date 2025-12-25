# Books Folder - Initial Training PDFs

## How to Use

1. **Add your PDF files** to this folder that you want the AI bot to be initially trained on.

2. **Update the PDF list** in `app.js`:
   - Open `app.js`
   - Find the `loadInitialPDFs()` function (around line 161)
   - Add your PDF filenames to the `pdfFiles` array:
   
   ```javascript
   const pdfFiles = [
     'textbook.pdf',
     'reference.pdf',
     'study-guide.pdf',
   ];
   ```

3. **Refresh the page** and click "AI Bot" mode - the bot will automatically load and train on these PDFs.

## Example Usage

If you add:
- `mathematics.pdf`
- `physics.pdf`
- `chemistry.pdf`

Update the array:
```javascript
const pdfFiles = [
  'mathematics.pdf',
  'physics.pdf',
  'chemistry.pdf',
];
```

The AI bot will show on startup:
```
Welcome to AI Bot! 🤖

I am initially trained on the following documents:
1. mathematics.pdf
2. physics.pdf
3. chemistry.pdf

You can ask me any questions about these topics!
```

## Notes

- Only PDF files are supported for initial training
- All PDFs in the list will be loaded when entering AI Bot mode
- Students can ask questions about these pre-loaded documents
- After 3 questions, students will be offered to upload their own single PDF
- Students can only upload ONE additional PDF for personalized training
