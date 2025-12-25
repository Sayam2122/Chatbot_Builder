// RAG (Retrieval Augmented Generation) Module
// Handles knowledge base management, semantic search, and LLM integration

class RAGSystem {
  constructor() {
    this.knowledgeBase = '';
    this.chunks = [];
    this.embeddings = [];
    this.conversationHistory = [];
    this.apiKey = '';
    this.enabled = false;
    this.provider = 'gemini'; // default to free option
  }

  // Smart chunking with overlap for better context
  createSmartChunks(text) {
    const chunks = [];
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    for (const para of paragraphs) {
      const sentences = para.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
      
      // Group sentences into chunks of 3-5 sentences with overlap
      if (sentences.length <= 3) {
        const chunk = sentences.join('. ').trim();
        if (chunk.length > 30) chunks.push(chunk + '.');
      } else {
        for (let i = 0; i < sentences.length; i += 3) {
          const chunk = sentences.slice(i, i + 5).join('. ').trim();
          if (chunk.length > 30) {
            chunks.push(chunk + '.');
          }
        }
      }
    }
    
    // If no paragraphs, fallback to sentence-based chunking
    if (chunks.length === 0) {
      const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
      for (let i = 0; i < sentences.length; i += 3) {
        const chunk = sentences.slice(i, i + 5).join('. ').trim();
        if (chunk.length > 30) {
          chunks.push(chunk + '.');
        }
      }
    }
    
    return chunks.length > 0 ? chunks : [text];
  }

  // Create embedding with TF-IDF-like weighting
  createEmbedding(text) {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const wordFreq = {};
    
    // Common stop words to reduce noise
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'a', 'an', 'as', 'by', 'from', 'that', 'this', 'it', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can']);
    
    words.forEach(w => {
      if (!stopWords.has(w) && w.length > 2) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    });
    
    return wordFreq;
  }

  // Calculate cosine similarity between embeddings
  cosineSimilarity(emb1, emb2) {
    const words = new Set([...Object.keys(emb1), ...Object.keys(emb2)]);
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    words.forEach(word => {
      const v1 = emb1[word] || 0;
      const v2 = emb2[word] || 0;
      dotProduct += v1 * v2;
      mag1 += v1 * v1;
      mag2 += v2 * v2;
    });
    
    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  // Search knowledge base with semantic ranking
  searchKnowledgeBase(query) {
    if (!this.knowledgeBase || this.chunks.length === 0) {
      return null;
    }
    
    const queryLower = query.toLowerCase().trim();
    const queryEmb = this.createEmbedding(query);
    const keywords = Object.keys(queryEmb);
    
    // Score each chunk with multiple ranking signals
    const scoredChunks = this.chunks.map((chunk, idx) => {
      const chunkLower = chunk.toLowerCase();
      const chunkEmb = this.embeddings[idx] || {};
      let score = 0;
      
      // 1. Exact phrase match (highest priority)
      if (chunkLower.includes(queryLower)) {
        score += 50;
      }
      
      // 2. Cosine similarity (semantic relevance)
      const similarity = this.cosineSimilarity(queryEmb, chunkEmb);
      score += similarity * 30;
      
      // 3. Keyword density matching
      let keywordMatches = 0;
      keywords.forEach(keyword => {
        if (chunkLower.includes(keyword)) {
          keywordMatches++;
          score += 5;
        }
      });
      
      // 4. Boost if multiple keywords present
      if (keywordMatches > 1) {
        score += keywordMatches * 3;
      }
      
      // 5. Penalize very short chunks
      if (chunk.length < 50) {
        score *= 0.7;
      }
      
      // 6. Boost chunks with question-like patterns
      if (query.includes('?') || /^(what|how|why|when|where|who|which)/i.test(query)) {
        if (/\b(is|are|means|refers|called|known)\b/i.test(chunkLower)) {
          score += 5;
        }
      }
      
      return { chunk, score, index: idx, similarity };
    });
    
    // Sort by score and get top 5
    scoredChunks.sort((a, b) => b.score - a.score);
    const topMatches = scoredChunks.filter(s => s.score > 2).slice(0, 5);
    
    if (topMatches.length > 0) {
      return {
        context: topMatches.map(s => s.chunk.trim()).join('\n\n'),
        matches: topMatches.length,
        avgScore: (topMatches.reduce((sum, m) => sum + m.score, 0) / topMatches.length).toFixed(1)
      };
    }
    
    return null;
  }

  // Add message to conversation history
  addToHistory(role, content) {
    this.conversationHistory.push({ role, content });
    
    // Keep only last 10 messages to manage context size
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Ask LLM with RAG context and conversation history
  async askLLM(question) {
    if (!this.apiKey) {
      throw new Error('API key not provided. Please enter your OpenAI API key.');
    }
    
    if (!this.knowledgeBase) {
      throw new Error('No knowledge base trained. Please upload and train data first.');
    }
    
    // Search knowledge base for relevant context
    const searchResult = this.searchKnowledgeBase(question);
    
    if (!searchResult) {
      throw new Error('NO_RELEVANT_INFO: I don\'t have enough information in my current knowledge base to answer this question.');
    }
    
    // Check if we should use fallback mode (no API calls)
    const useFallback = localStorage.getItem('use-fallback-mode') === 'true';
    if (useFallback) {
      // Return context directly with basic formatting
      return `Based on the knowledge base:\n\n${searchResult.context.substring(0, 500)}...\n\n(Note: Using fallback mode - Enable API mode for AI-generated answers)`;
    }
    
    // Build conversation with history for follow-up questions
    const messages = [];
    
    // System message with context
    const systemMessage = `You are a knowledgeable assistant trained on specific documents. Answer questions based ONLY on the context provided below and the conversation history.

Rules:
1. Use the context to provide accurate, detailed answers
2. For follow-up questions, refer to previous conversation
3. If the context contains the answer, explain it clearly and concisely
4. If the context doesn't contain enough information, say "I don't have enough information about that in my knowledge base"
5. Don't make up information - only use what's in the context
6. Be conversational and helpful

CONTEXT FROM KNOWLEDGE BASE:
${searchResult.context}`;

    messages.push({ role: 'system', content: systemMessage });
    
    // Add conversation history (last 6 messages for context)
    const recentHistory = this.conversationHistory.slice(-6);
    messages.push(...recentHistory);
    
    // Add current question
    messages.push({ role: 'user', content: question });
    
    // Call appropriate API based on provider
    let answer;
    
    if (this.provider === 'gemini') {
      // Google Gemini API - try to get available model first
      let modelName = 'gemini-1.5-flash-latest';
      
      // Try to list models and use the first available one
      try {
        const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${this.apiKey}`;
        const listResponse = await fetch(listUrl);
        if (listResponse.ok) {
          const modelsList = await listResponse.json();
          // Find first model that supports generateContent
          const availableModel = modelsList.models?.find(m => 
            m.supportedGenerationMethods?.includes('generateContent') && 
            m.name.includes('gemini')
          );
          if (availableModel) {
            // Extract just the model name (e.g., "models/gemini-pro" -> "gemini-pro")
            modelName = availableModel.name.replace('models/', '');
            console.log('Using available Gemini model:', modelName);
          }
        }
      } catch (e) {
        console.log('Could not list models, using default:', modelName);
      }
      
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${this.apiKey}`;
      
      // Combine all messages into one conversation-style prompt
      let fullPrompt = '';
      
      for (const msg of messages) {
        if (msg.role === 'system') {
          fullPrompt += msg.content + '\n\n';
        } else if (msg.role === 'user') {
          fullPrompt += 'User: ' + msg.content + '\n\n';
        } else if (msg.role === 'assistant') {
          fullPrompt += 'Assistant: ' + msg.content + '\n\n';
        }
      }
      
      fullPrompt += 'Assistant:';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || JSON.stringify(errorData);
        throw new Error(`Gemini API Error (${response.status}): ${errorMsg}\n\nURL: ${url.split('?')[0]}`);
      }
      
      const data = await response.json();
      answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!answer) {
        throw new Error('Gemini returned empty response. Response: ' + JSON.stringify(data));
      }
      
    } else {
      // OpenAI API
      const url = 'https://api.openai.com/v1/chat/completions';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMsg = error.error?.message || `API Error: ${response.status} - ${response.statusText}`;
        
        if (errorMsg.includes('quota') || errorMsg.includes('billing')) {
          throw new Error(`OpenAI API Error: ${errorMsg}\n\n💡 Switch to Google Gemini (FREE) in the provider dropdown!`);
        }
        
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      answer = data.choices?.[0]?.message?.content;
    }
    
    if (!answer) {
      throw new Error('No response from AI');
    }
    
    // Add to conversation history
    this.addToHistory('user', question);
    this.addToHistory('assistant', answer);
    
    return answer.trim();
  }

  // Train the knowledge base (APPENDS new data to existing)
  async train(text, append = true) {
    console.log('🔧 Train called - append:', append);
    console.log('📊 Current knowledge base size:', this.knowledgeBase ? this.knowledgeBase.length : 0);
    console.log('📝 New text size:', text.length);
    
    if (append && this.knowledgeBase && this.knowledgeBase.trim().length > 0) {
      // Append new text to existing knowledge base
      this.knowledgeBase += '\n\n=== NEW DOCUMENT ===\n\n' + text;
      console.log('✅ Appended new data. Total size:', this.knowledgeBase.length);
    } else {
      // Replace knowledge base (used for initial load or explicit reset)
      this.knowledgeBase = text;
      console.log('🔄 Replaced knowledge base. Total size:', this.knowledgeBase.length);
    }
    
    // Re-chunk and re-embed the ENTIRE knowledge base
    this.chunks = this.createSmartChunks(this.knowledgeBase);
    this.embeddings = this.chunks.map(chunk => this.createEmbedding(chunk));
    
    // Save to localStorage
    localStorage.setItem('bot-knowledge-base', this.knowledgeBase);
    localStorage.setItem('bot-knowledge-chunks', JSON.stringify(this.chunks));
    
    console.log('💾 Saved to localStorage. Chunks:', this.chunks.length);
    
    return {
      chunks: this.chunks.length,
      embeddings: this.embeddings.length,
      vocabulary: new Set(this.embeddings.flatMap(e => Object.keys(e))).size,
      sizeKB: (this.knowledgeBase.length / 1024).toFixed(2)
    };
  }

  // Load from localStorage
  load() {
    const savedKnowledge = localStorage.getItem('bot-knowledge-base');
    const savedChunks = localStorage.getItem('bot-knowledge-chunks');
    
    if (savedKnowledge) {
      this.knowledgeBase = savedKnowledge;
      if (savedChunks) {
        this.chunks = JSON.parse(savedChunks);
        this.embeddings = this.chunks.map(chunk => this.createEmbedding(chunk));
      }
      return true;
    }
    return false;
  }

  // Clear knowledge base
  clear() {
    this.knowledgeBase = '';
    this.chunks = [];
    this.embeddings = [];
    this.conversationHistory = [];
    localStorage.removeItem('bot-knowledge-base');
    localStorage.removeItem('bot-knowledge-chunks');
  }

  // Configure API settings
  configure(apiKey, enabled, provider) {
    this.apiKey = apiKey;
    this.enabled = enabled;
    if (provider) this.provider = provider;
    
    if (apiKey) {
      localStorage.setItem('llm-api-key', apiKey);
    }
    if (provider) {
      localStorage.setItem('llm-provider', provider);
    }
    localStorage.setItem('use-llm-mode', enabled);
  }

  // Load settings
  loadSettings() {
    const savedKey = localStorage.getItem('llm-api-key');
    const savedMode = localStorage.getItem('use-llm-mode');
    const savedProvider = localStorage.getItem('llm-provider');
    
    if (savedKey) {
      this.apiKey = savedKey;
    }
    if (savedMode === 'true') {
      this.enabled = true;
    }
    if (savedProvider) {
      this.provider = savedProvider;
    }
    
    return { apiKey: this.apiKey, enabled: this.enabled, provider: this.provider };
  }
}

// Create global instance
const ragSystem = new RAGSystem();
