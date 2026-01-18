# 🤖 Bot Flow Builder - Setup Guide

Welcome to Bot Flow Builder! A visual tool for children to build their own chatbots with AI-powered answers.

## 🌐 Live Demo

**Try it now:** [https://whack-a-mole-quiz.vercel.app/](https://whack-a-mole-quiz.vercel.app/)

## ✨ Features

- **Visual Flow Builder**: Drag and drop nodes to create conversation flows
- **AI-Powered Answers**: Train your bot from books, PDFs, or text documents
- **Easy to Use**: Choose between BookEinstein's free API or use your own
- **Knowledge Base**: Upload PDF/text files and the bot learns from them
- **Test Panel**: Test your bot in real-time as you build it

## 🚀 Quick Start

1. **Open the application**
   - Simply open `index.html` in your web browser
   - No installation or server required!

2. **Build your conversation flow**
   - Drag nodes around to organize your bot
   - Click on nodes to edit questions and responses
   - Use the + buttons to add new conversation paths

3. **Train your bot (Optional)**
   - Click "📚 Train from Book/Text" in the menu
   - Choose "Use BookEinstein API" (recommended - no setup needed!)
   - Upload a PDF or text file, or paste text content
   - Click "Save & Train" and watch the AI process it

4. **Test your bot**
   - Click "🧪 Test Bot" button
   - Start chatting with your bot!

## 🔑 API Options

### Option 1: BookEinstein API (Recommended)

✅ **No setup required!** Just select "Use BookEinstein API" in the training modal and you're ready to go.

This option uses a shared Google Gemini API key provided by BookEinstein, so you don't need to create your own.

### Option 2: Use Your Own API Key

If you want to use your own API key, follow these steps:

#### Getting a FREE Google Gemini API Key:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" button
4. Copy the generated API key
5. In the Bot Builder:
   - Open "📚 Train from Book/Text"
   - Select "Use Your Own API Key" from the dropdown
   - Choose "Google Gemini (FREE)" as provider
   - Paste your API key
   - Start training!

#### Getting an OpenAI API Key (Requires Billing):

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Add billing information (required)
4. Create a new API key
5. Copy and paste it in the Bot Builder settings

## 📂 Project Structure

```
Build_Chatbot/
├── index.html      # Main UI
├── styles.css      # Styling
├── app.js          # Main application logic
├── rag.js          # AI/RAG system
├── config.js       # BookEinstein API configuration
└── README.md       # This file
```

## 💡 Tips

- **Start Simple**: Begin with basic question-answer flows before adding AI
- **Train with Quality Content**: The better your training content, the smarter your bot
- **Use Fallback Nodes**: Always have fallback responses for unexpected inputs
- **Save Your Work**: Use "💾 Save Tree" in the menu to download your bot configuration
- **Load Previous Bots**: Use "📂 Load Tree" to continue working on saved bots

## 🎯 Node Types

- **🏠 Start**: The entry point of your conversation
- **❓ User Input**: Expected user questions or keywords
- **💬 Bot Response**: Your bot's replies
- **💬 AI Assist**: Let AI answer using trained knowledge
- **ELSE Fallback**: Default response when input doesn't match

## 🛠️ Troubleshooting

### Bot not answering questions?
- Make sure you've trained it with content (📚 Train from Book/Text)
- Check that "Use BookEinstein API" or your own API key is selected
- Verify the training process completed (all 7 steps should be ✅)

### Can't load PDF files?
- Make sure the PDF contains actual text (not scanned images)
- Try copying the text and pasting it instead

### API key not working?
- Double-check you copied the entire key (no extra spaces)
- For Gemini: Make sure you created the key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- For OpenAI: Ensure your account has billing enabled

## 🔒 Privacy & Security

- **Local Storage**: All your bot data and knowledge base are stored locally in your browser
- **No Server**: This app runs entirely in your browser - no data is sent to external servers except API calls
- **API Keys**: Your API keys are stored only in your browser's local storage

## 📚 Training Process

When you train your bot, here's what happens:

1. **Text Input**: Upload or paste your content
2. **Text Chunking**: Content is split into manageable pieces
3. **Create Embeddings**: Text is converted to numerical representations
4. **Store Knowledge**: Saved in your browser for quick retrieval
5. **Semantic Search**: Finds relevant content when users ask questions
6. **Context Building**: Gathers the most relevant information
7. **LLM Generation**: AI creates natural, context-aware responses

## 🌟 Have Fun Building!

This tool is designed to be easy and fun for children to learn about chatbots and AI. Experiment, be creative, and enjoy building your own smart bots!

---

**Made with ❤️ for young builders and learners**
