// Flow Builder with draggable nodes and bot panel
const nodesLayer = document.getElementById('nodesLayer');
const connectionsSvg = document.getElementById('connectionsSvg');
const chatLog = document.getElementById('chatLog');
const userMessage = document.getElementById('userMessage');
const sendBtn = document.getElementById('sendBtn');

// AI mode elements
const chatLogAI = document.getElementById('chatLogAI');
const userMessageAI = document.getElementById('userMessageAI');
const sendBtnAI = document.getElementById('sendBtnAI');

// Mode elements
const modeSwitcher = document.getElementById('modeSwitcher');
const casualBotSection = document.getElementById('casualBotSection');
const aiBotSection = document.getElementById('aiBotSection');
const casualModeBtn = document.getElementById('casualModeBtn');
const aiModeBtn = document.getElementById('aiModeBtn');
const openTrainingBtn = document.getElementById('openTrainingBtn');

// Header toggle elements
const modeToggle = document.getElementById('modeToggle');
const toggleCasual = document.getElementById('toggleCasual');
const toggleAI = document.getElementById('toggleAI');

// Current mode: 'casual' or 'ai' or null (initial)
let currentMode = null;
let isCustomizeMode = false; // Track if user is in customize mode
let questionCount = 0; // Track number of questions asked
let customizeOffered = false; // Track if customize option has been offered
let customNodesAdded = 0; // Track number of custom nodes created
const MAX_CUSTOM_NODES = 4; // Maximum custom nodes allowed

// AI mode tracking
let aiQuestionCount = 0; // Track questions in AI mode
let aiTrainingOffered = false; // Track if training offer shown
let userHasTrained = false; // Track if user uploaded their own PDF
let initialPDFs = []; // Store names of initially loaded PDFs

// Load trained books from localStorage on startup
const savedBooks = localStorage.getItem('trainedBooks');
if(savedBooks) {
  try {
    initialPDFs = JSON.parse(savedBooks);
    console.log(`📚 Loaded ${initialPDFs.length} trained books from storage`);
  } catch(e) {
    console.error('Error loading saved books:', e);
  }
}

// Modal elements
const editModal = document.getElementById('editModal');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const nodeType = document.getElementById('nodeType');
const nodeMessage = document.getElementById('nodeMessage');
const nodeQuestion = document.getElementById('nodeQuestion');
const questionLabel = document.getElementById('questionLabel');
const messageLabel = document.getElementById('messageLabel');
const saveNodeBtn = document.getElementById('saveNode');
const deleteNodeBtn = document.getElementById('deleteNode');

// Knowledge base elements
const knowledgeModal = document.getElementById('knowledgeModal');
const closeKnowledgeModal = document.getElementById('closeKnowledgeModal');
const knowledgeFileInput = document.getElementById('knowledgeFileInput');
const knowledgeText = document.getElementById('knowledgeText');
const saveKnowledge = document.getElementById('saveKnowledge');
const clearKnowledge = document.getElementById('clearKnowledge');

// Knowledge base storage (kept for backward compatibility with visual feedback)
let knowledgeBase = '';
let knowledgeChunks = [];
let knowledgeEmbeddings = [];

// RAG system is now loaded from rag.js and handles all LLM operations
ragSystem.loadSettings();
ragSystem.load();

// Node data
let nodeIdCounter = 100;

// Track path history for back button
let pathHistory = []; // Array to store node IDs in order of traversal
let activeConnections = []; // Track active connections to persist them after redraw

// Predefined nodes for Casual Bot mode (educational examples)
const predefinedNodes = [
  { id: 'start', label: 'Start point', icon: '🏠', class: 'node-start', x: 80, y: 300, type: 'start', message: 'Welcome to BookEinstein! 👋\n\nHow can I help you today?\n\n💡 You can ask me about:\n• What is Machine Learning?\n• Types of Machine Learning\n• Contact Us', canAddChild: false },
  
  // Level 1 - Main Menu (3 options)
  { id: 'q1', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 320, y: 100, type: 'response', question: 'what is machine learning', message: '', canAddChild: true },
  { id: 'q2', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 320, y: 300, type: 'response', question: 'types of machine learning', message: '', canAddChild: true },
  { id: 'q3', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 320, y: 500, type: 'response', question: 'contact us', message: '', canAddChild: true },
  
  // Contact Us Response
  { id: 'a_contact', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 560, y: 500, type: 'response', question: '', message: '📞 Contact Us:\n\n📱 Phone: +91 97694 31043\n📧 Email: smita@bookeinstein.com\n\n👤 Contact Person: Smita\n\nFeel free to reach out anytime!', canAddChild: false },
  
  // What is Machine Learning - Answer + Follow-up questions
  { id: 'a1', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 560, y: 100, type: 'response', question: '', message: '🤖 Machine Learning is a type of AI where computers learn from data without being explicitly programmed. They find patterns and make decisions based on examples!\n\nWant to learn more?', canAddChild: true },
  
  { id: 'q1_1', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 800, y: 20, type: 'response', question: 'how does a machine learn', message: '', canAddChild: true },
  { id: 'q1_2', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 800, y: 100, type: 'response', question: 'how does machine learning improve', message: '', canAddChild: true },
  { id: 'q1_3', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 800, y: 180, type: 'response', question: 'does machine learning need data', message: '', canAddChild: true },
  
  { id: 'a1_1', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 1040, y: 20, type: 'response', question: '', message: '🎓 A machine learns by analyzing lots of examples! It looks for patterns in data - like recognizing cats in photos after seeing thousands of cat pictures. The more examples it sees, the better it gets!', canAddChild: true },
  { id: 'a1_2', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 1040, y: 100, type: 'response', question: '', message: '📈 Machine Learning improves through:\n1. More training data\n2. Better algorithms\n3. Fine-tuning parameters\n4. Feedback from results\n\nIt\'s like practicing - the more you practice with good feedback, the better you become!', canAddChild: false },
  { id: 'a1_3', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 1040, y: 180, type: 'response', question: '', message: '📊 Yes! Data is essential for Machine Learning. Without data, ML can\'t learn patterns or make predictions. Quality and quantity of data directly impact how well the model performs!', canAddChild: false },
  
  // After "How does a machine learn" - Show technical concepts (Fixed positions - no negative values)
  { id: 'q1_1_1', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 1280, y: 0, type: 'response', question: 'what is an embedding', message: '', canAddChild: true },
  { id: 'q1_1_2', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 1280, y: 60, type: 'response', question: 'what is chunking', message: '', canAddChild: true },
  { id: 'q1_1_3', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 1280, y: 120, type: 'response', question: 'what is a vector', message: '', canAddChild: true },
  
  { id: 'a1_1_1', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 1520, y: 0, type: 'response', question: '', message: '🧮 An embedding is a way to convert text into numbers (vectors) that AI can understand. It\'s like translating words into a language computers can process!', canAddChild: false },
  { id: 'a1_1_2', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 1520, y: 60, type: 'response', question: '', message: '✂️ Chunking is breaking large text into smaller pieces. Like cutting a big document into paragraphs so AI can process it better!', canAddChild: false },
  { id: 'a1_1_3', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 1520, y: 120, type: 'response', question: '', message: '📊 A vector is a list of numbers that represents something in AI. It\'s like coordinates on a map - but for words and concepts!', canAddChild: false },
  
  // Types of Machine Learning - Answer + 3 types
  { id: 'a2', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 560, y: 300, type: 'response', question: '', message: '📚 There are three main types of Machine Learning. Each type learns differently!\n\nWhich one would you like to learn about?', canAddChild: true },
  
  { id: 'q2_1', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 800, y: 240, type: 'response', question: 'what is supervised learning', message: '', canAddChild: true },
  { id: 'q2_2', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 800, y: 320, type: 'response', question: 'what is unsupervised learning', message: '', canAddChild: true },
  { id: 'q2_3', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 800, y: 400, type: 'response', question: 'what is reinforcement learning', message: '', canAddChild: true },
  
  { id: 'a2_1', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 1040, y: 240, type: 'response', question: '', message: '👨‍🏫 Supervised Learning is like learning with a teacher! The machine is given labeled examples (input + correct answer) and learns to predict answers for new data. Example: Email spam detection!', canAddChild: false },
  { id: 'a2_2', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 1040, y: 320, type: 'response', question: '', message: '🔍 Unsupervised Learning is like exploring on your own! The machine finds hidden patterns in data without labeled answers. Example: Customer grouping in marketing!', canAddChild: false },
  { id: 'a2_3', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 1040, y: 400, type: 'response', question: '', message: '🎮 Reinforcement Learning is like training a pet! The machine learns by trial and error, getting rewards for good actions and penalties for bad ones. Example: Self-driving cars and game AI!', canAddChild: false },
  
  { id: 'fallback', label: 'Default Fallback', icon: 'ELSE', class: 'node-fallback node-example', x: 320, y: 700, type: 'fallback', message: 'I don\'t have an answer for that yet. Try asking about Machine Learning topics or contact us for more info!', canAddChild: true }
];

// Predefined connections for Casual Bot
const predefinedConnections = [
  // From Start to 3 main options
  { from: 'start', to: 'q1' },  // What is ML
  { from: 'start', to: 'q2' },  // Types of ML
  { from: 'start', to: 'q3' },  // Contact Us
  { from: 'start', to: 'fallback' },
  
  // Main questions to their answers
  { from: 'q1', to: 'a1' },  // What is ML -> Answer
  { from: 'q2', to: 'a2' },  // Types -> Answer
  { from: 'q3', to: 'a_contact' },  // Contact Us -> Contact Info
  
  // From "What is ML" answer to 3 follow-ups
  { from: 'a1', to: 'q1_1' },  // How does machine learn
  { from: 'a1', to: 'q1_2' },  // How does ML improve
  { from: 'a1', to: 'q1_3' },  // Does ML need data
  
  { from: 'q1_1', to: 'a1_1' },
  { from: 'q1_2', to: 'a1_2' },
  { from: 'q1_3', to: 'a1_3' },
  
  // From "How does machine learn" to technical concepts
  { from: 'a1_1', to: 'q1_1_1' },  // What is embedding
  { from: 'a1_1', to: 'q1_1_2' },  // What is chunking
  { from: 'a1_1', to: 'q1_1_3' },  // What is vector
  
  { from: 'q1_1_1', to: 'a1_1_1' },
  { from: 'q1_1_2', to: 'a1_1_2' },
  { from: 'q1_1_3', to: 'a1_1_3' },
  
  // From "Types of ML" answer to 3 types
  { from: 'a2', to: 'q2_1' },  // Supervised
  { from: 'a2', to: 'q2_2' },  // Unsupervised
  { from: 'a2', to: 'q2_3' },  // Reinforcement
  
  { from: 'q2_1', to: 'a2_1' },
  { from: 'q2_2', to: 'a2_2' },
  { from: 'q2_3', to: 'a2_3' }
];

const nodes = [];
const connections = [];

let draggedNode = null;
let offsetX = 0, offsetY = 0;
let currentEditingNodeId = null;

// Mode switching functions
function switchToCasualMode() {
  currentMode = 'casual';
  modeSwitcher.style.display = 'none';
  casualBotSection.style.display = 'flex';
  aiBotSection.style.display = 'none';
  
  // Show header toggle
  if(modeToggle) modeToggle.style.display = 'flex';
  
  // Update toggle buttons
  if(toggleCasual) toggleCasual.classList.add('active');
  if(toggleAI) toggleAI.classList.remove('active');
  
  // Load predefined nodes
  nodes.length = 0;
  nodes.push(...predefinedNodes);
  connections.length = 0;
  connections.push(...predefinedConnections);
  
  initNodes();
  isCustomizeMode = false;
  questionCount = 0;
  customizeOffered = false;
  
  // Hide canvas initially, show only chat
  const flowCanvas = document.getElementById('flowCanvas');
  const botPanel = document.getElementById('botPanel');
  if(flowCanvas) flowCanvas.style.display = 'none';
  if(botPanel) botPanel.style.width = '100%';
  
  // Initialize resize functionality after mode switch
  setTimeout(() => {
    initializeResizeHandlers();
  }, 100);
  
  // Start conversation automatically
  startConversation();
}

// Auto-load PDFs from books folder for initial training
async function loadInitialPDFs() {
  try {
    // Ensure API is configured before loading PDFs
    if(typeof updateAPIConfig === 'function') {
      updateAPIConfig();
    }
    
    // Note: This requires a file listing endpoint or manual array of PDF names
    // For now, we'll use a hardcoded list that user can update
    const pdfFiles = [
      'machine_learning.pdf',
    ];
    
    if(pdfFiles.length === 0) {
      console.log('ℹ️ No initial PDFs configured in books folder');
      return;
    }
    
    console.log('📚 Starting to load initial PDFs...');
    
    // Show loading message
    if(chatLogAI) {
      appendMessageAI('bot', '📚 Loading initial training documents, please wait...');
    }
    
    initialPDFs = [];
    let allText = ''; // Combine all PDF text
    
    for(const pdfFile of pdfFiles) {
      try {
        console.log(`📄 Loading PDF: ${pdfFile}`);
        const pdfUrl = `./books/${pdfFile}`;
        
        // Load PDF using PDF.js
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        console.log(`📖 PDF loaded: ${pdf.numPages} pages`);
        
        let fullText = '';
        
        // Extract text from all pages
        for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        console.log(`✅ Extracted ${fullText.length} characters from ${pdfFile}`);
        
        // Add to combined text
        if(fullText.trim()) {
          allText += fullText + '\n\n';
          initialPDFs.push(pdfFile);
          console.log(`✅ Added ${pdfFile} to training data`);
        }
        
      } catch(error) {
        console.error(`❌ Error loading ${pdfFile}:`, error);
        alert(`⚠️ Could not load ${pdfFile}. Please check:\n1. File exists in books/ folder\n2. File is a valid PDF\n3. Check browser console for details`);
      }
    }
    
    // Train the RAG system with all combined text
    if(allText.trim() && initialPDFs.length > 0) {
      console.log('🧠 Training RAG system with combined PDF data...');
      // Use append=false for initial load to replace any existing data
      await ragSystem.train(allText, false);
      console.log(`✅ Successfully trained on ${initialPDFs.length} PDF(s)`);
    }
    
    // Clear loading message
    if(chatLogAI) {
      chatLogAI.innerHTML = '';
    }
    
    // Update sidebar with trained books
    updateTrainedBooksList();
    
    // Save the list of trained books to localStorage
    localStorage.setItem('trainedBooks', JSON.stringify(initialPDFs));
    
  } catch(error) {
    console.error('❌ Error in loadInitialPDFs:', error);
    if(chatLogAI) {
      chatLogAI.innerHTML = '';
    }
  }
}

// Update the trained books list display in sidebar
function updateTrainedBooksList() {
  const booksList = document.getElementById('trainedBooksList');
  if(!booksList) return;
  
  // Load from localStorage if initialPDFs is empty
  if(initialPDFs.length === 0) {
    const savedBooks = localStorage.getItem('trainedBooks');
    if(savedBooks) {
      try {
        initialPDFs = JSON.parse(savedBooks);
      } catch(e) {
        console.error('Error loading saved books:', e);
      }
    }
  }
  
  const allBooks = [...initialPDFs]; // Books loaded from books folder
  
  if(allBooks.length === 0) {
    booksList.innerHTML = '<p style="margin:0;opacity:0.6;font-size:12px">No books loaded yet</p>';
  } else {
    booksList.innerHTML = allBooks.map(book => {
      const bookName = book.replace('.pdf', '').replace(/_/g, ' ');
      // Capitalize first letter of each word
      const displayName = bookName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      return `<div style="padding:8px 10px;background:#e8f4f8;border-left:3px solid #667eea;border-radius:4px;margin-bottom:8px;font-size:12px">
        📖 ${displayName}
      </div>`;
    }).join('');
  }
}

function switchToAIMode() {
  currentMode = 'ai';
  modeSwitcher.style.display = 'none';
  casualBotSection.style.display = 'none';
  aiBotSection.style.display = 'flex';
  
  // Show header toggle
  if(modeToggle) modeToggle.style.display = 'flex';
  
  // Update toggle buttons
  if(toggleCasual) toggleCasual.classList.remove('active');
  if(toggleAI) toggleAI.classList.add('active');
  
  // Update the trained books sidebar on switch
  updateTrainedBooksList();
  
  // Load initial PDFs only if not already loaded
  if(initialPDFs.length === 0) {
    loadInitialPDFs().then(() => {
      startConversationAI();
    }).catch((error) => {
      console.error('Error loading initial PDFs:', error);
      startConversationAI(); // Show welcome message even if PDF loading fails
    });
  } else {
    // Books already loaded, just start conversation
    startConversationAI();
  }
}

function showCanvasView() {
  // Show the node canvas alongside chat
  const flowCanvas = document.getElementById('flowCanvas');
  const botPanel = document.getElementById('botPanel');
  if(flowCanvas) {
    flowCanvas.style.display = 'block';
    // Force immediate scroll to show start node
    flowCanvas.scrollLeft = 200;
    flowCanvas.scrollTop = 250;
    
    // Additional scrolls with delays to ensure it sticks
    setTimeout(() => {
      flowCanvas.scrollLeft = 0;
      flowCanvas.scrollTop = 250;
      console.log('Canvas scrolled to:', flowCanvas.scrollLeft, flowCanvas.scrollTop);
    }, 50);
    
    setTimeout(() => {
      flowCanvas.scrollLeft = 0;
      flowCanvas.scrollTop = 250;
    }, 200);
    
    setTimeout(() => {
      flowCanvas.scrollLeft = 0;
      flowCanvas.scrollTop = 250;
    }, 500);
    
    // Initialize resize handlers when canvas is shown
    initializeResizeHandlers();
  }
  if(botPanel) botPanel.style.width = '400px';
}

function enterCustomizeMode() {
  if(!confirm('Ready to customize your node tree? This will clear the example nodes and let you build from scratch!')) return;
  
  isCustomizeMode = true;
  
  // Clear to blank canvas with just Start and Fallback
  nodes.length = 0;
  nodes.push(
    { id: 'start', label: 'Start point', icon: '🏠', class: 'node-start', x: 80, y: 180, type: 'start', message: 'Welcome! Let\'s start building.', canAddChild: false },
    { id: 'fallback', label: 'Default Fallback', icon: 'ELSE', class: 'node-fallback', x: 320, y: 280, type: 'fallback', message: 'Sorry, I didn\'t understand that.', canAddChild: true }
  );
  
  connections.length = 0;
  connections.push({ from: 'start', to: 'fallback' });
  
  nodeIdCounter = 10;
  
  // Show the canvas view when entering customize mode
  showCanvasView();
  
  initNodes();
  
  alert('🎨 Customize Mode Activated!\n\nYou can now:\n• Edit any node by double-clicking\n• Add child nodes using the + button\n• Drag nodes to reposition them\n\nHave fun building your bot!');
}

// Initialize nodes
function initNodes() {
  nodesLayer.innerHTML = '';
  nodes.forEach(node => {
    const div = document.createElement('div');
    div.className = `node ${node.class}`;
    div.id = `node-${node.id}`;
    div.style.left = `${node.x}px`;
    div.style.top = `${node.y}px`;
    
    // Check if this node is a leaf node (no children)
    const hasChildren = connections.some(conn => conn.from === node.id);
    const isLeafNode = !hasChildren;
    const canAddMoreNodes = customNodesAdded < MAX_CUSTOM_NODES;
    
    div.innerHTML = `
      <span class="node-icon">${node.icon}</span>
      <span class="node-label">${node.label}</span>
      ${node.badge ? `<span class="node-badge">${node.badge}</span>` : ''}
      ${isCustomizeMode && isLeafNode && node.type === 'response' && canAddMoreNodes ? '<button class="add-node-btn" onclick="showNodeTypeModal(\'' + node.id + '\')">+</button>' : ''}
    `;
    
    div.addEventListener('mousedown', startDrag);
    // Always allow double-click to edit in customize mode
    div.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      openEditModal(node.id);
    });
    
    nodesLayer.appendChild(div);
  });
  
  drawConnections();
  
  // Scroll to show start node after nodes are rendered
  setTimeout(() => {
    const flowCanvas = document.getElementById('flowCanvas');
    if(flowCanvas && flowCanvas.style.display === 'block') {
      flowCanvas.scrollLeft = 0;
      flowCanvas.scrollTop = 200;
    }
  }, 100);
}

// Track current node during test conversation
let currentNodeId = null;
let previousNodeId = null; // Track previous node for connection highlighting

function setActiveNode(nodeId){
  // Store previous for connection highlighting BEFORE updating current
  previousNodeId = currentNodeId;
  currentNodeId = nodeId;
  
  // Add to path history
  if(nodeId) {
    pathHistory.push(nodeId);
    
    // Show back button if we have more than one node in history
    const backBtn = document.getElementById('backBtn');
    if(backBtn && pathHistory.length > 1) {
      backBtn.style.display = 'inline-block';
    }
    
    // Show main menu button if we're not at start
    const mainMenuBtn = document.getElementById('mainMenuBtn');
    if(mainMenuBtn && nodeId !== 'start') {
      mainMenuBtn.style.display = 'inline-block';
    }
  }
  
  // remove previous active node styling
  document.querySelectorAll('.node.active').forEach(el=>el.classList.remove('active'));
  const el = document.getElementById('node-' + nodeId);
  if(el) el.classList.add('active');
  
  // Highlight the connection from previous to current
  if(previousNodeId && nodeId && previousNodeId !== nodeId) {
    highlightConnection(previousNodeId, nodeId);
  }
  
  // Update the current position pointer - pass previousNodeId for path animation
  updateCurrentPointer(nodeId, previousNodeId);
  
  // Update quick question buttons based on current node
  updateQuickButtons(nodeId);
}

// Update quick question buttons based on current node
function updateQuickButtons(nodeId) {
  const quickQuestions = document.getElementById('quickQuestions');
  if(!quickQuestions) return;
  
  // Get children of current node
  const childrenConns = connections.filter(c => c.from === nodeId);
  const questionChildren = childrenConns
    .map(c => nodes.find(n => n.id === c.to))
    .filter(n => n && n.question);
  
  // Build buttons HTML
  let buttonsHTML = '<p style="margin:0 0 10px 0;font-size:13px;color:#666;font-weight:600;">💡 Quick Questions:</p>';
  
  // Add question buttons
  questionChildren.forEach(child => {
    const icon = child.question.toLowerCase().includes('machine learning') ? '🤖' : 
                 child.question.toLowerCase().includes('types') ? '📚' :
                 child.question.toLowerCase().includes('contact') ? '📞' :
                 child.question.toLowerCase().includes('supervised') ? '👨‍🏫' :
                 child.question.toLowerCase().includes('unsupervised') ? '🔍' :
                 child.question.toLowerCase().includes('reinforcement') ? '🎮' :
                 child.question.toLowerCase().includes('how does') ? '🎓' :
                 child.question.toLowerCase().includes('improve') ? '📈' :
                 child.question.toLowerCase().includes('data') ? '📊' :
                 child.question.toLowerCase().includes('embedding') ? '🧮' :
                 child.question.toLowerCase().includes('chunking') ? '✂️' :
                 child.question.toLowerCase().includes('vector') ? '📊' : '❓';
    
    const displayQuestion = child.question.charAt(0).toUpperCase() + child.question.slice(1);
    buttonsHTML += `<button class="quick-btn" data-question="${child.question}">${icon} ${displayQuestion}?</button>`;
  });
  
  // Add Back button if we have enough history to go back 2 steps (to reach previous bot response)
  if(nodeId !== 'start' && pathHistory.length > 2) {
    buttonsHTML += '<button class="quick-btn" data-action="back" style="background:#6c757d">⬅️ Back</button>';
  }
  
  // Always add Main Menu button if not at start
  if(nodeId !== 'start') {
    buttonsHTML += '<button class="quick-btn main-menu-quick" data-action="mainmenu">🏠 Main Menu</button>';
  }
  
  quickQuestions.innerHTML = buttonsHTML;
}

function startConversation(){
  // clear chat log and show start message
  chatLog.innerHTML = '';
  pathHistory = ['start']; // Reset path history with start
  activeConnections = []; // Reset active connections - CLEAR ALL BLUE LINES
  currentNodeId = 'start';
  previousNodeId = null;
  
  // Remove pointer completely
  const existingPointer = document.getElementById('currentPointer');
  if(existingPointer) existingPointer.remove();
  
  // Scroll canvas to show start node properly
  const canvas = document.getElementById('flowCanvas');
  if(canvas && canvas.style.display === 'block') {
    // Scroll to show start node (y=300 with 500px offset = scrollTop 250)
    setTimeout(() => {
      canvas.scrollLeft = 0;
      canvas.scrollTop = 250;
    }, 100);
  }
  
  // Redraw connections to clear blue lines
  drawConnections();
  
  const startNode = nodes.find(n=>n.id==='start');
  if(startNode && startNode.message) appendMessage('bot', startNode.message);
  setActiveNode(currentNodeId);
}

function startConversationAI(){
  // Reset AI question count and training state
  aiQuestionCount = 0;
  aiTrainingOffered = false;
  
  // clear AI chat log and show welcome message
  if(chatLogAI) {
    chatLogAI.innerHTML = '';
    
    let welcomeMsg = 'Welcome, Student! 🎓\n\n';
    
    // Check if we have trained knowledge base (either from initial PDFs or user training)
    if(ragSystem.knowledgeBase && ragSystem.knowledgeBase.trim().length > 0) {
      const totalKB = (ragSystem.knowledgeBase.length / 1024).toFixed(2);
      
      if(initialPDFs.length > 0) {
        welcomeMsg += 'I am your AI Learning Assistant, trained on:\n\n';
        initialPDFs.forEach((pdf, idx) => {
          welcomeMsg += `📚 ${idx + 1}. ${pdf}\n`;
        });
        
        if(userHasTrained) {
          welcomeMsg += `\n✨ Plus your custom training data!\n`;
        }
        
        welcomeMsg += `\n📊 Total knowledge: ${totalKB}KB\n\nFeel free to ask me any questions! You can also train me on more documents anytime. 😊`;
      } else {
        welcomeMsg += `I am your AI Learning Assistant! 📖\n\n📊 Knowledge base: ${totalKB}KB\n\nI have been trained on your documents. Ask me anything about your study materials!`;
      }
    } else {
      welcomeMsg += 'I am your AI Learning Assistant! 📖\n\nTo get started, click "Start Training" button above to upload your study materials (PDFs), and I\'ll help you learn from them!';
    }
    
    appendMessageAI('bot', welcomeMsg);
  }
}

// Drag handlers
function startDrag(e) {
  // Don't allow dragging in example mode
  if(!isCustomizeMode && currentMode === 'casual'){
    return;
  }
  
  draggedNode = e.currentTarget;
  const rect = draggedNode.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  draggedNode.classList.add('selected');
  
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
  if (!draggedNode) return;
  const canvasRect = nodesLayer.getBoundingClientRect();
  let x = e.clientX - canvasRect.left - offsetX;
  let y = e.clientY - canvasRect.top - offsetY;
  
  // Keep within bounds
  x = Math.max(0, Math.min(x, canvasRect.width - draggedNode.offsetWidth));
  y = Math.max(0, Math.min(y, canvasRect.height - draggedNode.offsetHeight));
  
  draggedNode.style.left = `${x}px`;
  draggedNode.style.top = `${y}px`;
  
  // Update node position in data
  const nodeId = draggedNode.id.replace('node-', '');
  const node = nodes.find(n => n.id === nodeId);
  if (node) {
    node.x = x;
    node.y = y;
  }
  
  drawConnections();
}

function stopDrag() {
  if (draggedNode) {
    draggedNode.classList.remove('selected');
    draggedNode = null;
  }
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
}

// Draw connections between nodes
// Draw connection lines between nodes
function drawConnections() {
  // Clear existing connections
  connectionsSvg.innerHTML = '';
  
  // Draw each connection
  connections.forEach(conn => {
    // Find the node objects
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return;
    
    // Get the DOM elements
    const fromEl = document.getElementById(`node-${conn.from}`);
    const toEl = document.getElementById(`node-${conn.to}`);
    if (!fromEl || !toEl) return;
    
    // Calculate center points using node data (x, y) plus half of rendered dimensions
    // Node height is approximately 48px (padding 12px top+bottom + content ~24px)
    const nodeHeight = 48;
    const centerX1 = fromNode.x + (fromEl.clientWidth / 2);
    const centerY1 = fromNode.y + (nodeHeight / 2); // Fixed: 24px from top
    const centerX2 = toNode.x + (toEl.clientWidth / 2);
    const centerY2 = toNode.y + (nodeHeight / 2); // Fixed: 24px from top
    
    // Create curved path between centers
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Calculate curve control points
    const deltaX = centerX2 - centerX1;
    const curveOffset = Math.abs(deltaX) * 0.5;
    
    // SVG path: Move to start, Curve to end
    const pathData = `M ${centerX1} ${centerY1} C ${centerX1 + curveOffset} ${centerY1}, ${centerX2 - curveOffset} ${centerY2}, ${centerX2} ${centerY2}`;
    
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'connection');
    path.setAttribute('data-from', conn.from);
    path.setAttribute('data-to', conn.to);
    
    // Check if this connection should be highlighted (blue)
    const isActive = activeConnections.some(ac => ac.from === conn.from && ac.to === conn.to);
    if (isActive) {
      path.classList.add('active');
    }
    
    // Add path to SVG
    connectionsSvg.appendChild(path);
  });
  
  // Restore the current pointer on top of connections
  if (currentNodeId) {
    updateCurrentPointer(currentNodeId);
  }
}

// Highlight the connection between two nodes
function highlightConnection(fromId, toId) {
  // Add to active connections array to persist across redraws
  const alreadyActive = activeConnections.some(ac => ac.from === fromId && ac.to === toId);
  if(!alreadyActive) {
    activeConnections.push({ from: fromId, to: toId });
  }
  
  // Find and highlight the specific connection
  const connections = document.querySelectorAll('.connection');
  connections.forEach(conn => {
    if(conn.getAttribute('data-from') === fromId && conn.getAttribute('data-to') === toId) {
      conn.classList.add('active');
      
      // Keep the blue line permanently to show traversed path
      // Don't remove the active class
    }
  });
}

// Remove highlight from a specific connection
function removeConnectionHighlight(fromId, toId) {
  // Remove from active connections array
  activeConnections = activeConnections.filter(ac => !(ac.from === fromId && ac.to === toId));
  
  const connections = document.querySelectorAll('.connection');
  connections.forEach(conn => {
    if(conn.getAttribute('data-from') === fromId && conn.getAttribute('data-to') === toId) {
      conn.classList.remove('active');
    }
  });
}

// Update the current position pointer (blinking blue dot) - animates along the path
function updateCurrentPointer(nodeId, fromNodeId = null) {
  // Get existing pointer for animation
  const existingPointer = document.getElementById('currentPointer');
  
  if(!nodeId) {
    if(existingPointer) existingPointer.remove();
    return;
  }
  
  // Get node element and position
  const node = nodes.find(n => n.id === nodeId);
  const nodeEl = document.getElementById(`node-${nodeId}`);
  
  if(!node || !nodeEl) {
    // If node element not ready, try again after a short delay
    setTimeout(() => updateCurrentPointer(nodeId, fromNodeId), 50);
    return;
  }
  
  // Calculate final position based on node type
  let targetX, targetY;
  const nodeHeight = 48; // Fixed node height
  
  if(nodeId === 'start') {
    // For Start node, position at the END (right side) because traversal goes FROM start
    targetX = node.x + nodeEl.clientWidth + 15; // 15px after the node
    targetY = node.y + (nodeHeight / 2); // 24px from top (vertical center)
  } else {
    // For other nodes, position BEFORE (left side) at the end of incoming blue line
    targetX = node.x - 15; // 15px before the node
    targetY = node.y + (nodeHeight / 2); // 24px from top (vertical center)
  }
  
  if(existingPointer && fromNodeId && fromNodeId !== nodeId) {
    // Animate along the path from previous node to current node
    animatePointerAlongPath(existingPointer, fromNodeId, nodeId, targetX, targetY);
  } else if(existingPointer) {
    // Just move to position without path animation
    existingPointer.style.transition = 'cx 0.3s ease-in-out, cy 0.3s ease-in-out';
    existingPointer.setAttribute('cx', targetX);
    existingPointer.setAttribute('cy', targetY);
  } else {
    // Create new blinking blue circle pointer
    const pointer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pointer.setAttribute('id', 'currentPointer');
    pointer.setAttribute('class', 'current-pointer');
    pointer.setAttribute('cx', targetX);
    pointer.setAttribute('cy', targetY);
    pointer.setAttribute('r', '10');
    pointer.style.zIndex = '1000';
    
    connectionsSvg.appendChild(pointer);
  }
}

// Animate pointer along the curved path between nodes
function animatePointerAlongPath(pointer, fromNodeId, toNodeId, targetX, targetY) {
  // Find the connection path between these nodes (forward or reverse)
  let connection = connections.find(c => c.from === fromNodeId && c.to === toNodeId);
  let isReversePath = false;
  
  if(!connection) {
    // Check if we're going backwards (reverse direction)
    connection = connections.find(c => c.from === toNodeId && c.to === fromNodeId);
    isReversePath = true;
  }
  
  if(!connection) {
    // No path found in either direction, just move directly
    pointer.style.transition = 'cx 1.2s ease-in-out, cy 1.2s ease-in-out';
    pointer.setAttribute('cx', targetX);
    pointer.setAttribute('cy', targetY);
    return;
  }
  
  // Get the actual path definition nodes (the connection always goes one direction)
  const pathDefFrom = isReversePath ? toNodeId : fromNodeId;
  const pathDefTo = isReversePath ? fromNodeId : toNodeId;
  
  const pathFromNode = nodes.find(n => n.id === pathDefFrom);
  const pathToNode = nodes.find(n => n.id === pathDefTo);
  const pathFromEl = document.getElementById(`node-${pathDefFrom}`);
  const pathToEl = document.getElementById(`node-${pathDefTo}`);
  
  if(!pathFromNode || !pathToNode || !pathFromEl || !pathToEl) {
    pointer.style.transition = 'cx 1.2s ease-in-out, cy 1.2s ease-in-out';
    pointer.setAttribute('cx', targetX);
    pointer.setAttribute('cy', targetY);
    return;
  }
  
  // Calculate node centers - these define the bezier curve (matching drawConnections EXACTLY)
  const centerX1 = pathFromNode.x + pathFromEl.offsetWidth / 2;
  const centerY1 = pathFromNode.y + pathFromEl.offsetHeight / 2;
  const centerX2 = pathToNode.x + pathToEl.offsetWidth / 2;
  const centerY2 = pathToNode.y + pathToEl.offsetHeight / 2;
  
  // Calculate control offset (EXACTLY as in drawConnections)
  const dx = centerX2 - centerX1;
  const controlOffset = Math.abs(dx) * 0.5;
  
  // Control points for bezier curve (EXACTLY as in drawConnections)
  const cp1x = centerX1 + controlOffset;
  const cp1y = centerY1;
  const cp2x = centerX2 - controlOffset;
  const cp2y = centerY2;
  
  // Calculate START position (where pointer currently is at the END of previous node's line)
  let startX, startY;
  if(pathDefFrom === 'start') {
    startX = pathFromNode.x + pathFromEl.offsetWidth + 15; // Right side of start
    startY = pathFromNode.y + (pathFromEl.offsetHeight / 2);
  } else {
    startX = pathFromNode.x - 15; // Left side of other nodes
    startY = pathFromNode.y + (pathFromEl.offsetHeight / 2);
  }
  
  // The bezier curve goes from centers, but we'll start from the actual pointer position
  // and end at targetX, targetY
  
  // Animate along the bezier curve
  const duration = 1200; // 1.2 seconds
  const startTime = Date.now();
  
  // Remove CSS transition temporarily for manual animation
  pointer.style.transition = 'none';
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-in-out function
    const easeProgress = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Don't reverse - always go forward from t=0 to t=1
    const t = easeProgress;
    const invT = 1 - t;
    
    // Cubic Bezier formula: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
    // Use center points for the bezier curve calculation
    const cx = invT * invT * invT * centerX1 + 
               3 * invT * invT * t * cp1x + 
               3 * invT * t * t * cp2x + 
               t * t * t * centerX2;
               
    const cy = invT * invT * invT * centerY1 + 
               3 * invT * invT * t * cp1y + 
               3 * invT * t * t * cp2y + 
               t * t * t * centerY2;
    
    pointer.setAttribute('cx', cx);
    pointer.setAttribute('cy', cy);
    
    if(progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Restore CSS transition for future moves
      pointer.style.transition = 'cx 1.2s ease-in-out, cy 1.2s ease-in-out';
      // Ensure final position is exactly at target
      pointer.setAttribute('cx', targetX);
      pointer.setAttribute('cy', targetY);
    }
  }
  
  animate();
}

// Dynamic node creation after each answer
function createNewQuestionNodes(fromAnswerId) {
  const newQuestions = [
    'Tell me more about this',
    'Can you explain in detail?',
    'What are the benefits?',
    'How does it work?'
  ];
  
  // Find the parent answer node to position new nodes relative to it
  const parentNode = nodes.find(n => n.id === fromAnswerId);
  if (!parentNode) return;
  
  const startX = parentNode.x + 240;
  const startY = parentNode.y - 150;
  const spacing = 100;
  
  // Create 4 new question-answer pairs
  newQuestions.forEach((question, index) => {
    const qId = `q${nodeIdCounter}`;
    const aId = `a${nodeIdCounter}`;
    
    // Create question node
    nodes.push({
      id: qId,
      label: 'User Input',
      icon: '❓',
      class: 'node-response',
      type: 'response',
      x: startX,
      y: startY + (index * spacing),
      question: question,
      canAddChild: true
    });
    
    // Create answer node
    nodes.push({
      id: aId,
      label: 'Bot Response',
      icon: '💬',
      class: 'node-response',
      type: 'response',
      x: startX + 240,
      y: startY + (index * spacing),
      message: `This is a deeper explanation about ${question.toLowerCase()}.`,
      canAddChild: false
    });
    
    // Create connections
    connections.push({ from: fromAnswerId, to: qId });
    connections.push({ from: qId, to: aId });
    
    nodeIdCounter++;
  });
  
  // Redraw everything
  initNodes();
}

// Reset chat button (Casual mode)
const resetChatBtn = document.getElementById('resetChat');
if(resetChatBtn){
  resetChatBtn.addEventListener('click', ()=>{
    // Complete reset - clear conversation history and customization
    ragSystem.clearHistory();
    
    // Reset all customize mode variables
    isCustomizeMode = false;
    customizeOffered = false;
    customNodesAdded = 0;
    questionCount = 0;
    
    // Hide customize button
    const customizeBtn = document.getElementById('customizeNodesBtn');
    if(customizeBtn) {
      customizeBtn.style.display = 'none';
    }
    
    // Reload predefined nodes (remove any custom nodes)
    nodes.length = 0;
    nodes.push(...predefinedNodes);
    connections.length = 0;
    connections.push(...predefinedConnections);
    
    // Reinitialize and start fresh
    initNodes();
    startConversation();
  });
}
// Main Menu button (Casual mode) - Now handled in quick buttons with data-action="mainmenu"
const mainMenuBtn = document.getElementById('mainMenuBtn');
if(mainMenuBtn){
  mainMenuBtn.addEventListener('click', ()=>{
    // Go back to start node
    currentNodeId = 'start';
    previousNodeId = null;
    pathHistory = ['start'];
    // Don't clear blue lines - keep them visible: activeConnections = [];
    
    // Update active node styling (blue border on start)
    document.querySelectorAll('.node.active').forEach(el=>el.classList.remove('active'));
    const el = document.getElementById('node-start');
    if(el) el.classList.add('active');
    
    // REMOVE pointer completely when going back to start
    const existingPointer = document.getElementById('currentPointer');
    if(existingPointer) existingPointer.remove();
    
    // Redraw connections (will keep blue lines from activeConnections)
    drawConnections();
    
    // Update quick buttons for start menu
    updateQuickButtons('start');
    
    // Hide back and main menu buttons
    const backBtn = document.getElementById('backBtn');
    if(backBtn) backBtn.style.display = 'none';
    mainMenuBtn.style.display = 'none';
    
    // Show start message
    const startNode = nodes.find(n => n.id === 'start');
    if(startNode && startNode.message) {
      appendMessage('bot', '🏠 Back to Main Menu!\n\n' + startNode.message);
    }
  });
}

// Reset chat button (AI mode)
const resetChatBtnAI = document.getElementById('resetChatAI');
if(resetChatBtnAI){
  resetChatBtnAI.addEventListener('click', ()=>{
    // Clear conversation history in RAG system
    ragSystem.clearHistory();
    startConversationAI();
  });
}

// Clear Knowledge button in AI mode
const clearKnowledgeBtn = document.getElementById('clearKnowledgeBtn');
if(clearKnowledgeBtn){
  clearKnowledgeBtn.addEventListener('click', ()=>{
    if(confirm('⚠️ Are you sure you want to clear all trained knowledge?\n\nThis will remove:\n• All trained books and data\n• Conversation history\n\nThis action cannot be undone!')){
      // Clear RAG system
      ragSystem.clear();
      ragSystem.clearHistory();
      
      // Clear backward compatibility variables
      knowledgeBase = '';
      knowledgeChunks = [];
      knowledgeEmbeddings = [];
      
      // Clear trained books list
      initialPDFs = [];
      localStorage.removeItem('trainedBooks');
      updateTrainedBooksList();
      
      // Clear chat
      if(chatLogAI) chatLogAI.innerHTML = '';
      
      // Show success message
      appendMessageAI('bot', '✅ All knowledge cleared successfully!\n\nYou can now train me on new documents by clicking "📚 Start Training".');
    }
  });
}

// Customize Nodes button
const customizeNodesBtn = document.getElementById('customizeNodesBtn');
if(customizeNodesBtn){
  customizeNodesBtn.addEventListener('click', ()=>{
    if(customNodesAdded >= MAX_CUSTOM_NODES){
      appendMessage('bot', `⚠️ You've already added ${MAX_CUSTOM_NODES} custom nodes. That's the limit to keep things simple!`);
      return;
    }
    
    // Enter customize mode - show + buttons on nodes
    isCustomizeMode = true;
    appendMessage('bot', `🎨 Customize Mode Activated!\n\nYou can add up to ${MAX_CUSTOM_NODES - customNodesAdded} more custom node(s).\n\n✨ What you can do:\n• Click [+] buttons on end nodes to add new nodes\n• Double-click any node to edit its question/answer\n\nStart customizing your bot!`);
    
    // Show + buttons on nodes that can have children
    showAddNodeButtons();
  });
}

// Show + buttons on nodes in customize mode
function showAddNodeButtons() {
  // Refresh nodes to show + buttons
  initNodes();
}

// Show modal to select node type (User Input or Bot Response)
window.showNodeTypeModal = function(parentId) {
  if(customNodesAdded >= MAX_CUSTOM_NODES) {
    appendMessage('bot', `⚠️ You've reached the limit of ${MAX_CUSTOM_NODES} custom nodes!`);
    return;
  }
  
  const nodeType = prompt('Select node type:\n\n1. Type "input" for User Input node\n2. Type "response" for Bot Response node');
  
  if(!nodeType) return;
  
  const normalizedType = nodeType.toLowerCase().trim();
  
  if(normalizedType === 'input' || normalizedType === '1') {
    // Create user input node
    const question = prompt('Enter the question/input text:');
    if(!question) return;
    
    addCustomNode(parentId, 'input', question, '');
  } else if(normalizedType === 'response' || normalizedType === '2') {
    // Create bot response node
    const message = prompt('Enter the bot response message:');
    if(!message) return;
    
    addCustomNode(parentId, 'response', '', message);
  } else {
    alert('Invalid selection. Please type "input" or "response"');
  }
};

// Add custom node to the canvas
function addCustomNode(parentId, nodeType, question, message) {
  const parentNode = nodes.find(n => n.id === parentId);
  if(!parentNode) return;
  
  nodeIdCounter++;
  const newId = `custom_${nodeIdCounter}`;
  
  // Calculate position (to the right and slightly below parent)
  const newX = parentNode.x + 240;
  const newY = parentNode.y + (customNodesAdded * 80);
  
  const newNode = {
    id: newId,
    label: nodeType === 'input' ? 'User Input' : 'Bot Response',
    icon: nodeType === 'input' ? '❓' : '💬',
    class: 'node-response',
    x: newX,
    y: newY,
    type: 'response',
    question: question,
    message: message,
    canAddChild: true
  };
  
  nodes.push(newNode);
  connections.push({ from: parentId, to: newId });
  
  customNodesAdded++;
  
  // Refresh the canvas
  initNodes();
  
  appendMessage('bot', `✅ Custom node added! (${customNodesAdded}/${MAX_CUSTOM_NODES})\n\n${customNodesAdded < MAX_CUSTOM_NODES ? 'You can add ' + (MAX_CUSTOM_NODES - customNodesAdded) + ' more node(s).' : 'You\'ve reached the maximum! But you can still double-click any node to edit it.'}`);
  
  if(customNodesAdded >= MAX_CUSTOM_NODES) {
    // Don't exit customize mode, just hide + buttons
    // User can still double-click to edit
    initNodes(); // Refresh to hide + buttons (they won't show because isLeafNode check will fail or we're at max)
    appendMessage('bot', '💡 Tip: You can continue editing nodes by double-clicking them!');
  }
}

// Chat functionality
function appendMessage(from, text) {
  const div = document.createElement('div');
  div.className = from === 'user' ? 'user-message' : 'bot-message';
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Chat functionality for AI mode
function appendMessageAI(from, text) {
  if(!chatLogAI) return;
  const div = document.createElement('div');
  div.className = from === 'user' ? 'user-message' : 'bot-message';
  div.textContent = text;
  chatLogAI.appendChild(div);
  chatLogAI.scrollTop = chatLogAI.scrollHeight;
}

// AI-powered answer search from knowledge base with improved semantic matching
async function searchKnowledgeBase(query) {
  if(!knowledgeBase || knowledgeChunks.length === 0) return null;
  
  // Step 5: Query Processing (visual feedback)
  const lastQueryEl = document.getElementById('lastQuery');
  if(lastQueryEl) {
    lastQueryEl.textContent = `Query: "${query.substring(0, 40)}..."`;
  }
  
  const queryLower = query.toLowerCase().trim();
  const queryEmb = createSimpleEmbedding(query);
  const keywords = Object.keys(queryEmb);
  
  // Step 6: Semantic Search (visual feedback)
  const searchResultsEl = document.getElementById('searchResults');
  
  // Score each chunk with multiple ranking signals
  const scoredChunks = knowledgeChunks.map((chunk, idx) => {
    const chunkLower = chunk.toLowerCase();
    const chunkEmb = knowledgeEmbeddings[idx] || {};
    let score = 0;
    
    // 1. Exact phrase match (highest priority)
    if(chunkLower.includes(queryLower)) {
      score += 50;
    }
    
    // 2. Cosine similarity (semantic relevance)
    const similarity = cosineSimilarity(queryEmb, chunkEmb);
    score += similarity * 30;
    
    // 3. Keyword density matching
    let keywordMatches = 0;
    keywords.forEach(keyword => {
      if(chunkLower.includes(keyword)) {
        keywordMatches++;
        score += 5;
      }
    });
    
    // 4. Boost if multiple keywords present
    if(keywordMatches > 1) {
      score += keywordMatches * 3;
    }
    
    // 5. Penalize very short chunks
    if(chunk.length < 50) {
      score *= 0.7;
    }
    
    // 6. Boost chunks with question-like patterns if query is a question
    if(query.includes('?') || query.toLowerCase().startsWith('what') || 
       query.toLowerCase().startsWith('how') || query.toLowerCase().startsWith('why') ||
       query.toLowerCase().startsWith('when') || query.toLowerCase().startsWith('where')) {
      if(chunkLower.includes('is') || chunkLower.includes('are') || 
         chunkLower.includes('means') || chunkLower.includes('refers')) {
        score += 5;
      }
    }
    
    return { chunk, score, index: idx, similarity };
  });
  
  // Sort by score
  scoredChunks.sort((a, b) => b.score - a.score);
  
  // Get top 5 chunks with minimum score threshold
  const topMatches = scoredChunks.filter(s => s.score > 2).slice(0, 5);
  
  if(searchResultsEl) {
    searchResultsEl.textContent = `Results: ${topMatches.length} relevant chunks`;
  }
  
  if(topMatches.length > 0){
    // Step 7: Generate Answer (visual feedback)
    const answerEl = document.getElementById('answerGenerated');
    if(answerEl) {
      const avgScore = (topMatches.reduce((sum, m) => sum + m.score, 0) / topMatches.length).toFixed(1);
      answerEl.textContent = `Answer: ${topMatches.length} chunks (avg relevance: ${avgScore})`;
    }
    
    // Combine top chunks with better formatting
    return topMatches.map(s => s.chunk.trim()).join(' ');
  }
  
  return null;
}

// Note: LLM functionality is now handled by the RAG system in rag.js
// The ragSystem.askLLM() method handles OpenAI API calls with conversation history

async function findAnswer(message) {
  const m = message.trim().toLowerCase();
  
  // If knowledge base exists but LLM is not enabled, suggest enabling it
  if(ragSystem.knowledgeBase && !ragSystem.enabled){
    return "💡 I found information in my knowledge base, but I need LLM mode enabled to give you a proper answer. Please enable 'Use LLM (AI)' in Menu → Train from Book/Text and add your OpenAI API key.";
  }
  
  // Built-in handlers
  if (/\b(date|today(?:'s)? date|what(?:'s| is) the date)\b/.test(m)) {
    const d = new Date();
    return `Today's date is ${d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}.`;
  }
  
  if (/\b(day|weekday|what(?:'s| is) the day|which day)\b/.test(m)) {
    const d = new Date();
    return `Today is ${d.toLocaleDateString(undefined, { weekday: 'long' })}.`;
  }
  
  if (/\b(hobby|my hobby|what(?:'s| is) my hobby)\b/.test(m)) {
    return "Your hobby is coding and building bots! That's awesome! 🎨";
  }
  
  if (/\b(hello|hi|hey)\b/.test(m)) {
    return "Hello! I can tell you today's date, the day of the week, and tell you about your hobby. How can I help you?";
  }
  
  // Check custom response nodes
  for (const node of nodes) {
    if (node.message && node.question) {
      const qLower = node.question.toLowerCase();
      if (m.includes(qLower) || qLower.includes(m)) {
        return node.message;
      }
    }
  }
  
  // Return first response node message or fallback
  const responseNode = nodes.find(n => n.type === 'response' && n.message);
  if (responseNode && /\b(hello|hi|hey|start)\b/.test(m)) {
    return responseNode.message;
  }
  
  const fallbackNode = nodes.find(n => n.type === 'fallback');
  return fallbackNode?.message || "I'm not sure about that yet. You can teach me more by adding nodes in the flow builder or training from a book!";
}

async function sendMessage() {
  const text = userMessage.value.trim();
  if (!text) return;
  
  appendMessage('user', text);
  userMessage.value = '';
  
  // Increment question count for casual mode
  if(currentMode === 'casual' && !isCustomizeMode) {
    questionCount++;
  }

  // Conversation traversal based on currentNodeId
  setTimeout(async () => {
    // Handle custom node creation in customize mode
    if(isCustomizeMode && customNodesAdded < MAX_CUSTOM_NODES) {
      // Parse user input for custom nodes
      const questionMatch = text.match(/question:\s*(.+?)(?:\s+answer:|\s*$)/i);
      const answerMatch = text.match(/answer:\s*(.+?)$/i);
      
      if(questionMatch && answerMatch) {
        const customQuestion = questionMatch[1].trim();
        const customAnswer = answerMatch[1].trim();
        
        // Create custom Q&A pair from current node
        const parentNode = nodes.find(n => n.id === currentNodeId);
        if(parentNode) {
          const qId = `custom_q${nodeIdCounter}`;
          const aId = `custom_a${nodeIdCounter}`;
          
          const startX = parentNode.x + 240;
          const startY = parentNode.y;
          
          // Create question node
          nodes.push({
            id: qId,
            label: 'Custom Input',
            icon: '❓',
            class: 'node-response',
            type: 'response',
            x: startX,
            y: startY,
            question: customQuestion,
            canAddChild: true
          });
          
          // Create answer node
          nodes.push({
            id: aId,
            label: 'Custom Response',
            icon: '💬',
            class: 'node-response',
            type: 'response',
            x: startX + 240,
            y: startY,
            message: customAnswer,
            canAddChild: false
          });
          
          // Create connections
          connections.push({ from: currentNodeId, to: qId });
          connections.push({ from: qId, to: aId });
          
          nodeIdCounter++;
          customNodesAdded++;
          
          // Redraw
          initNodes();
          
          appendMessage('bot', `✅ Custom node added! (${customNodesAdded}/${MAX_CUSTOM_NODES})\n\n${customNodesAdded < MAX_CUSTOM_NODES ? 'You can add ' + (MAX_CUSTOM_NODES - customNodesAdded) + ' more.' : 'You\'ve reached the maximum custom nodes!'}`);
          
          if(customNodesAdded >= MAX_CUSTOM_NODES) {
            isCustomizeMode = false;
          }
          return;
        }
      } else {
        appendMessage('bot', '⚠️ Please format your input as:\n\nQuestion: [your question]\nAnswer: [your answer]');
        return;
      }
    }
    
    // Check if user wants to see canvas after customize offer
    if(customizeOffered && !isCustomizeMode && /^(yes|yeah|sure|ok|okay|show me|i want to)$/i.test(text.trim())) {
      appendMessage('bot', '🎉 Awesome! Let me show you the node canvas...\n\nYou can see how all the conversations are connected with colorful nodes and arrows. Each node represents a question or answer!');
      setTimeout(() => {
        showCanvasView();
        appendMessage('bot', '👈 Check out the left side! Those are the conversation nodes.\n\nYou can still ask questions here, or type "customize" when you\'re ready to edit them yourself!');
      }, 2000);
      return;
    }
    
    // Get children of current node
    const childrenConns = connections.filter(c => c.from === currentNodeId);
    let matched = null;
    
    // Look for a child node with a matching question (User Input node)
    for(const conn of childrenConns){
      const child = nodes.find(n => n.id === conn.to);
      if(child && child.question){
        // Normalize both texts: remove punctuation, lowercase, trim
        const q = child.question.toLowerCase().trim().replace(/[?!.,]/g, '');
        const userText = text.toLowerCase().trim().replace(/[?!.,]/g, '');
        
        // Split into words for better matching
        const qWords = q.split(/\s+/);
        const userWords = userText.split(/\s+/);
        
        // Check for match with flexible matching
        // 1. Exact match
        // 2. User text contains all words from question
        // 3. Question contains all words from user text
        // 4. Significant word overlap (70% or more)
        
        const overlap = qWords.filter(word => userWords.includes(word)).length;
        const overlapPercent = overlap / Math.max(qWords.length, userWords.length);
        
        if(userText === q || 
           userText.includes(q) || 
           q.includes(userText) ||
           overlapPercent >= 0.7){
          matched = child;
          break;
        }
      }
    }

    if(matched){
      // Found matching user input node, now look for its Bot Response child
      setActiveNode(matched.id);
      
      // Find Bot Response child of this matched node
      const responseConns = connections.filter(c => c.from === matched.id);
      const botResponseChild = responseConns
        .map(c => nodes.find(n => n.id === c.to))
        .find(n => n && n.type === 'response' && n.message);
      
      if(botResponseChild){
        appendMessage('bot', botResponseChild.message);
        setActiveNode(botResponseChild.id);
        
        // Show canvas after first answer to see nodes and blue path
        if(questionCount === 1) {
          setTimeout(() => {
            showCanvasView();
          }, 500);
        }
        
        // Don't create new nodes - removed this feature
        // if(botResponseChild.id.startsWith('a') && !botResponseChild.special) {
        //   setTimeout(() => {
        //     createNewQuestionNodes(botResponseChild.id);
        //   }, 1300);
        // }
        
        // Check if this is the customize trigger node
        if(botResponseChild.special === 'customize' && !isCustomizeMode) {
          setTimeout(() => {
            enterCustomizeMode();
          }, 1000);
        }
        
        // Show customize button and message after 5-6 questions
        if(currentMode === 'casual' && questionCount >= 5 && !customizeOffered) {
          customizeOffered = true;
          const customizeBtn = document.getElementById('customizeNodesBtn');
          if(customizeBtn) {
            customizeBtn.style.display = 'inline-block';
          }
          // Show customize offer message
          setTimeout(() => {
            appendMessage('bot', '🎨 Great questions! Did you know you can customize this bot by adding your own nodes?\n\nClick the "🎨 Customize Nodes" button at the top right to add up to 4 custom question-answer pairs!');
          }, 500);
        }
        
        return;
      }
      
      // If matched node itself has a message, use it
      if(matched.message){
        appendMessage('bot', matched.message);
        return;
      }
      
      // If no bot response child, check for AI node or fallback from this matched node
      const matchedChildrenConns = connections.filter(c => c.from === matched.id);
      
      // Check for AI node
      const aiConnFromMatched = matchedChildrenConns.find(c => {
        const child = nodes.find(n => n.id === c.to);
        return child && child.type === 'ai';
      });
      
      if (aiConnFromMatched && ragSystem.knowledgeBase && ragSystem.enabled && ragSystem.apiKey) {
        const aiNode = nodes.find(n => n.id === aiConnFromMatched.to);
        setActiveNode(aiNode.id);
        
        appendMessage('bot', '🤔 Searching knowledge base and generating answer...');
        
        try {
          const llmAnswer = await ragSystem.askLLM(text);
          const lastMsg = chatLog.lastElementChild;
          if (lastMsg && lastMsg.classList.contains('bot-message')) {
            lastMsg.textContent = llmAnswer;
          }
          return;
        } catch (error) {
          console.error('LLM Error:', error);
          const lastMsg = chatLog.lastElementChild;
          if (lastMsg && lastMsg.classList.contains('bot-message')) {
            lastMsg.textContent = '❌ ' + error.message;
          }
          return;
        }
      }
      
      // Check for fallback from matched node
      const fallbackFromMatched = matchedChildrenConns.find(c => {
        const child = nodes.find(n => n.id === c.to);
        return child && child.type === 'fallback';
      });
      
      if(fallbackFromMatched){
        const fb = nodes.find(n => n.id === fallbackFromMatched.to);
        appendMessage('bot', fb.message || "I didn't understand that.");
        setActiveNode(fb.id);
        return;
      }
      
  // If matched node has no children, do NOT reset to start here.
  // Previously this forced the conversation back to Start which broke
  // the intended linear flow (start -> question -> answer -> new children).
  // We'll fall through to check Start's AI/Fallback options below WITHOUT
  // changing the current node so the conversation remains on the current branch.
    }

    // No match found, check if Start has AI or Fallback nodes
    // Re-get children connections from Start (in case we reset currentNodeId above or no match was found)
    const startConns = connections.filter(c => c.from === 'start');
    
    // Check if AI Assist node is available from Start
    const aiConn = startConns.find(c => {
      const child = nodes.find(n => n.id === c.to);
      return child && child.type === 'ai';
    });

    // Use AI if there's an AI node AND we have knowledge base (regardless of whether input matched)
    if (aiConn && ragSystem.knowledgeBase && ragSystem.enabled && ragSystem.apiKey) {
      const aiNode = nodes.find(n => n.id === aiConn.to);
      setActiveNode(aiNode.id);
      
      appendMessage('bot', '🤔 Searching knowledge base and generating answer...');
      
      try {
        // Use RAG system to get answer with conversation history
        const llmAnswer = await ragSystem.askLLM(text);
        
        // Replace the "Thinking..." message with actual answer
        const lastMsg = chatLog.lastElementChild;
        if (lastMsg && lastMsg.classList.contains('bot-message')) {
          lastMsg.textContent = llmAnswer;
        }
        return;
      } catch (error) {
        console.error('LLM Error:', error);
        const lastMsg = chatLog.lastElementChild;
        if (lastMsg && lastMsg.classList.contains('bot-message')) {
          lastMsg.textContent = '❌ ' + error.message;
        }
        return;
      }
    }

    // No AI or AI failed -> go to fallback child from Start
    const fallbackConn = startConns.find(c => {
      const child = nodes.find(n => n.id === c.to);
      return child && child.type === 'fallback';
    });
    
    if(fallbackConn){
      const fb = nodes.find(n => n.id === fallbackConn.to);
      appendMessage('bot', fb.message || "I didn't understand that.");
      setActiveNode(fb.id);
      return;
    }

    // No children found - use generic fallback
    const answer = await findAnswer(text);
    appendMessage('bot', answer);
  }, 300);
}

sendBtn.addEventListener('click', sendMessage);
userMessage.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Quick question buttons handler
const quickQuestions = document.getElementById('quickQuestions');
if(quickQuestions) {
  quickQuestions.addEventListener('click', (e) => {
    if(e.target.classList.contains('quick-btn')) {
      // Check if it's an action button
      const action = e.target.getAttribute('data-action');
      
      if(action === 'mainmenu') {
        // Go back to start
        pathHistory = ['start'];
        activeConnections = [];
        currentNodeId = 'start';
        previousNodeId = null;
        
        // Clear all connection highlights
        document.querySelectorAll('.connection-line').forEach(line => {
          line.classList.remove('active');
        });
        
        // Update active node styling
        document.querySelectorAll('.node.active').forEach(el=>el.classList.remove('active'));
        const el = document.getElementById('node-start');
        if(el) el.classList.add('active');
        
        // Update pointer
        updateCurrentPointer('start', null);
        
        // Update quick buttons
        updateQuickButtons('start');
        
        // Add message to chat
        const startNode = nodes.find(n => n.id === 'start');
        if(startNode && startNode.message) {
          appendMessage('bot', '🏠 Back to Main Menu\n\n' + startNode.message);
        }
        return;
      }
      
      if(action === 'back') {
        // Go back TWO steps in path history to skip user input and reach bot response
        if(pathHistory.length > 2) {
          // Remove current node from history
          pathHistory.pop();
          
          // Remove the user input node too (go back 2 steps)
          pathHistory.pop();
          
          // Get the previous bot response node
          const previousNode = pathHistory[pathHistory.length - 1];
          
          // Remove blue lines for both steps
          if(pathHistory.length >= 1) {
            // Remove connection to current node
            const toNode = currentNodeId;
            removeConnectionHighlight(previousNode, toNode);
          }
          
          // Update current node without adding to history again
          currentNodeId = previousNode;
          previousNodeId = pathHistory.length >= 2 ? pathHistory[pathHistory.length - 2] : null;
          
          // Update active node styling (blue border)
          document.querySelectorAll('.node.active').forEach(el=>el.classList.remove('active'));
          const el = document.getElementById('node-' + currentNodeId);
          if(el) el.classList.add('active');
          
          // Update pointer position
          updateCurrentPointer(currentNodeId, null);
          
          // Update quick buttons for the node we're going back to
          updateQuickButtons(currentNodeId);
          
          // Add message to chat
          const node = nodes.find(n => n.id === currentNodeId);
          if(node && node.message) {
            appendMessage('bot', '⬅️ Going back...\n\n' + node.message);
          }
        }
        return;
      }
      
      // Regular question button
      const question = e.target.getAttribute('data-question');
      if(question) {
        // Set the question in input and send it
        userMessage.value = question;
        sendMessage();
      }
    }
  });
}

// AI Mode chat functionality
async function sendMessageAI() {
  if(!userMessageAI) return;
  const text = userMessageAI.value.trim();
  if (!text) return;
  
  appendMessageAI('user', text);
  userMessageAI.value = '';
  
  // Check if user responding "yes" to training offer
  if(aiTrainingOffered && (text.toLowerCase() === 'yes' || text.toLowerCase().includes('yes'))) {
    appendMessageAI('bot', '📚 Great! Opening the training panel where you can upload your PDF...');
    setTimeout(() => {
      if(knowledgeModal) knowledgeModal.style.display = 'flex';
    }, 1000);
    return;
  }

  // Use AI to answer if knowledge base is trained
  if (ragSystem.knowledgeBase && ragSystem.knowledgeBase.trim().length > 0 && ragSystem.apiKey) {
    // Increment question count
    aiQuestionCount++;
    
    appendMessageAI('bot', '🤔 Searching knowledge base and generating answer...');
    
    try {
      const llmAnswer = await ragSystem.askLLM(text);
      const lastMsg = chatLogAI.lastElementChild;
      if (lastMsg && lastMsg.classList.contains('bot-message')) {
        lastMsg.textContent = llmAnswer;
      }
      
      // Check if LLM response indicates lack of information
      const lackOfInfoPhrases = [
        'don\'t have enough information',
        'don\'t have information',
        'not enough information',
        'no information',
        'knowledge base does not contain',
        'cannot find information'
      ];
      
      const hasLackOfInfo = lackOfInfoPhrases.some(phrase => 
        llmAnswer.toLowerCase().includes(phrase)
      );
      
      if (hasLackOfInfo) {
        // Offer to train on new data
        setTimeout(() => {
          appendMessageAI('bot', '💡 Would you like to train me on additional data to answer this question?\n\nType "yes" to upload more training materials!');
          aiTrainingOffered = true; // Allow user to train again
        }, 1500);
      } else if(aiQuestionCount === 3 && !aiTrainingOffered && !userHasTrained) {
        // After 3 questions, offer training option (original logic)
        aiTrainingOffered = true;
        setTimeout(() => {
          appendMessageAI('bot', '💡 You can also train me on your own data!\n\nWould you like to upload your own PDF document? (Type "yes" to proceed)');
        }, 1500);
      }
      
    } catch (error) {
      console.error('LLM Error:', error);
      console.error('Error message includes NO_RELEVANT_INFO:', error.message && error.message.includes('NO_RELEVANT_INFO'));
      
      const lastMsg = chatLogAI.lastElementChild;
      if (lastMsg && lastMsg.classList.contains('bot-message')) {
        // Check if it's the NO_RELEVANT_INFO error
        if (error.message && error.message.includes('NO_RELEVANT_INFO')) {
          // Show the custom message without the prefix
          lastMsg.textContent = error.message.replace('NO_RELEVANT_INFO: ', '');
        } else {
          lastMsg.textContent = '❌ ' + error.message;
        }
      }
      
      // If error is about no relevant information, offer to train on new data
      if (error.message && error.message.includes('NO_RELEVANT_INFO')) {
        setTimeout(() => {
          appendMessageAI('bot', '💡 Would you like to train me on additional data to answer this question?\n\nType "yes" to upload more training materials!');
          aiTrainingOffered = true; // Allow user to train again
        }, 1500);
      }
    }
  } else {
    // Provide specific error message based on what's missing
    if (!ragSystem.knowledgeBase || ragSystem.knowledgeBase.trim().length === 0) {
      appendMessageAI('bot', '⚠️ Please train the AI first by clicking "Start Training" and uploading a PDF document.');
    } else if (!ragSystem.apiKey) {
      appendMessageAI('bot', '⚠️ API key not configured. Please check your API settings in the training panel.');
    }
  }
}

if(sendBtnAI) {
  sendBtnAI.addEventListener('click', sendMessageAI);
}
if(userMessageAI) {
  userMessageAI.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessageAI();
  });
}

// Modal functions
function openEditModal(nodeId) {
  // Don't allow editing in example mode (only in customize mode)
  if(!isCustomizeMode && currentMode === 'casual'){
    alert('💡 These are example nodes to help you learn!\n\nType "customize" in the chat to enter Customize Mode and build your own nodes.');
    return;
  }
  
  currentEditingNodeId = nodeId;
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return;
  
  modalTitle.textContent = `Edit Node`;
  
  // If AI node, show explanation and disable editing
  if(node.type === 'ai'){
    nodeType.value = 'response';
    nodeType.disabled = true;
    nodeMessage.value = "AI Assist: routes conversation and can run special logic or integrations.";
    nodeQuestion.value = '';
    nodeMessage.disabled = true;
    nodeQuestion.disabled = true;
    questionLabel.style.display = 'none';
    messageLabel.style.display = 'block';
    deleteNodeBtn.style.display = 'none';
    saveNodeBtn.style.display = 'none';
  } else if(node.type === 'start'){
    // Start node - allow editing message only
    nodeType.value = 'response';
    nodeType.disabled = true;
    nodeMessage.value = node.message || '';
    nodeQuestion.value = '';
    nodeMessage.disabled = false;
    nodeQuestion.disabled = true;
    questionLabel.style.display = 'none';
    messageLabel.style.display = 'block';
    deleteNodeBtn.style.display = 'none';
    saveNodeBtn.style.display = '';
  } else {
    // Editable node
    nodeType.disabled = false;
    nodeMessage.disabled = false;
    nodeQuestion.disabled = false;
    deleteNodeBtn.style.display = '';
    saveNodeBtn.style.display = '';
    
    // Set type dropdown
    if(node.type === 'fallback') nodeType.value = 'fallback';
    else if(node.question && !node.message) nodeType.value = 'user-input';
    else nodeType.value = 'response';
    
    nodeMessage.value = node.message || '';
    nodeQuestion.value = node.question || '';
    
    updateModalFields();
  }
  
  editModal.classList.add('open');
}

// Update modal fields based on node type selection
function updateModalFields(){
  const type = nodeType.value;
  if(type === 'user-input'){
    questionLabel.style.display = 'block';
    messageLabel.style.display = 'none';
  } else if(type === 'response' || type === 'fallback'){
    questionLabel.style.display = 'none';
    messageLabel.style.display = 'block';
  }
}

nodeType.addEventListener('change', updateModalFields);

closeModal.addEventListener('click', () => {
  editModal.classList.remove('open');
  currentEditingNodeId = null;
});

saveNodeBtn.addEventListener('click', () => {
  if (!currentEditingNodeId) return;
  
  const node = nodes.find(n => n.id === currentEditingNodeId);
  if (node) {
    // Special handling for start node
    if(node.type === 'start'){
      node.message = nodeMessage.value || '';
      initNodes();
      editModal.classList.remove('open');
      currentEditingNodeId = null;
      return;
    }
    
    const type = nodeType.value;
    
    // Update node based on type
    if(type === 'user-input'){
      node.question = nodeQuestion.value || '';
      node.message = '';
      node.label = 'User Input';
      node.type = 'response'; // keep as response internally but with question only
      node.icon = '❓';
      node.class = 'node-response';
    } else if(type === 'response'){
      node.message = nodeMessage.value || '';
      node.question = ''; // Clear question for pure response
      node.label = 'Bot Response';
      node.type = 'response';
      node.icon = '💬';
      node.class = 'node-response';
    } else if(type === 'fallback'){
      node.message = nodeMessage.value || '';
      node.question = '';
      node.label = 'Default Fallback';
      node.type = 'fallback';
      node.icon = 'ELSE';
      node.class = 'node-fallback';
    }
    
    initNodes();
  }
  
  editModal.classList.remove('open');
  currentEditingNodeId = null;
});

deleteNodeBtn.addEventListener('click', () => {
  if (!currentEditingNodeId) return;
  
  // Remove node
  const nodeIndex = nodes.findIndex(n => n.id === currentEditingNodeId);
  if (nodeIndex > -1 && nodes[nodeIndex].type !== 'start') {
    nodes.splice(nodeIndex, 1);
    
    // Remove connections
    for (let i = connections.length - 1; i >= 0; i--) {
      if (connections[i].from === currentEditingNodeId || connections[i].to === currentEditingNodeId) {
        connections.splice(i, 1);
      }
    }
    
    initNodes();
  }
  
  editModal.classList.remove('open');
  currentEditingNodeId = null;
});

// Add child node
function addChildNode(event, parentId) {
  event.stopPropagation();
  
  const parent = nodes.find(n => n.id === parentId);
  if (!parent) return;
  
  const newId = 'node' + (nodeIdCounter++);
  
  // Create user input node by default (they can change it in modal)
  const newNode = {
    id: newId,
    label: 'User Input',
    icon: '❓',
    class: 'node-response',
    x: parent.x + 150,
    y: parent.y + 80,
    type: 'response',
    question: '',
    message: '',
    canAddChild: false
  };
  
  nodes.push(newNode);
  connections.push({ from: parentId, to: newId });
  
  initNodes();
  
  // Auto-open edit modal
  setTimeout(() => openEditModal(newId), 100);
}

// Make addChildNode global
window.addChildNode = addChildNode;

// Mode switching event listeners
casualModeBtn.addEventListener('click', () => {
  switchToCasualMode();
});

aiModeBtn.addEventListener('click', () => {
  switchToAIMode();
});

// Header toggle button event listeners
if(toggleCasual) {
  toggleCasual.addEventListener('click', () => {
    if(currentMode !== 'casual') {
      switchToCasualMode();
    }
  });
}

if(toggleAI) {
  toggleAI.addEventListener('click', () => {
    if(currentMode !== 'ai') {
      switchToAIMode();
    }
  });
}

// Don't initialize nodes on load - wait for mode selection
// initNodes();

// Redraw connections on window resize
window.addEventListener('resize', drawConnections);

// Close modal on outside click
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) {
    editModal.classList.remove('open');
    currentEditingNodeId = null;
  }
});

// Open training modal button (in AI bot section)
if(openTrainingBtn){
  openTrainingBtn.addEventListener('click', () => {
    console.log('🔧 Start Training button clicked');
    console.log('📋 knowledgeModal element:', knowledgeModal);
    if(knowledgeModal) {
      knowledgeModal.style.display = 'flex';
      showWizardStep(0); // Always show upload screen when opening
      console.log('✅ Modal should be visible now');
    } else {
      console.error('❌ knowledgeModal element not found!');
    }
  });
} else {
  console.error('❌ openTrainingBtn element not found!');
}

closeKnowledgeModal.addEventListener('click', () => {
  console.log('🔧 Close button clicked');
  if(knowledgeModal) {
    knowledgeModal.style.display = 'none';
    showWizardStep(0); // Reset to first step
  }
});

// Extract text from PDF
async function extractTextFromPDF(file) {
  const uploadStatus = document.getElementById('uploadStatus');
  uploadStatus.style.display = 'block';
  uploadStatus.textContent = '📄 Loading PDF...';
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF.js
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    uploadStatus.textContent = `📄 Extracting text from ${pdf.numPages} pages...`;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
      
      uploadStatus.textContent = `📄 Processing page ${i}/${pdf.numPages}...`;
    }
    
    uploadStatus.textContent = `✅ PDF extracted successfully! (${pdf.numPages} pages)`;
    setTimeout(() => { uploadStatus.style.display = 'none'; }, 3000);
    
    return fullText;
  } catch (error) {
    uploadStatus.textContent = `❌ Error reading PDF: ${error.message}`;
    uploadStatus.style.color = '#f44336';
    console.error('PDF extraction error:', error);
    return null;
  }
}

// Handle file upload for knowledge base
knowledgeFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  
  const uploadStatus = document.getElementById('uploadStatus');
  uploadStatus.style.display = 'block';
  
  if (file.name.toLowerCase().endsWith('.pdf')) {
    // Handle PDF file
    const text = await extractTextFromPDF(file);
    if(text) {
      knowledgeText.value = text;
    }
  } else {
    // Handle text file
    uploadStatus.textContent = '📄 Loading text file...';
    const reader = new FileReader();
    reader.onload = (event) => {
      knowledgeText.value = event.target.result;
      uploadStatus.textContent = '✅ Text file loaded successfully!';
      setTimeout(() => { uploadStatus.style.display = 'none'; }, 2000);
    };
    reader.onerror = () => {
      uploadStatus.textContent = '❌ Error reading file';
      uploadStatus.style.color = '#f44336';
    };
    reader.readAsText(file);
  }
});

// Animate processing step
function animateStep(stepNumber, duration = 800) {
  return new Promise(resolve => {
    const step = document.querySelector(`.step[data-step="${stepNumber}"]`);
    if(step) {
      step.classList.add('active');
      setTimeout(() => {
        step.classList.remove('active');
        step.classList.add('completed');
        resolve();
      }, duration);
    } else {
      resolve();
    }
  });
}

// Smart chunking with overlap for better context
function createSmartChunks(text) {
  const chunks = [];
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  for (const para of paragraphs) {
    const sentences = para.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    
    // Group sentences into chunks of 3-5 sentences with overlap
    if (sentences.length <= 3) {
      chunks.push(sentences.join('. ') + '.');
    } else {
      for (let i = 0; i < sentences.length; i += 3) {
        const chunk = sentences.slice(i, i + 5).join('. ') + '.';
        if (chunk.length > 30) {
          chunks.push(chunk);
        }
      }
    }
  }
  
  // If no paragraphs, fallback to sentence-based chunking
  if (chunks.length === 0) {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    for (let i = 0; i < sentences.length; i += 3) {
      const chunk = sentences.slice(i, i + 5).join('. ') + '.';
      if (chunk.length > 30) {
        chunks.push(chunk);
      }
    }
  }
  
  return chunks.length > 0 ? chunks : [text];
}

// Improved embedding with TF-IDF-like weighting
function createSimpleEmbedding(text) {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const wordFreq = {};
  
  // Common stop words to reduce noise
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'a', 'an', 'as', 'by', 'from', 'that', 'this', 'it', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
  
  words.forEach(w => {
    if (!stopWords.has(w) && w.length > 2) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  });
  
  return wordFreq;
}

// Calculate cosine similarity between two embeddings
function cosineSimilarity(emb1, emb2) {
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

// Wizard navigation variables
let trainingData = {
  fullText: '',
  chunks: [],
  embeddings: [],
  stats: {}
};

// Save knowledge base with wizard interface
saveKnowledge.addEventListener('click', async () => {
  const textContent = knowledgeText.value.trim();
  if(!textContent){
    alert('⚠️ Please upload a PDF file first.');
    return;
  }
  
  // Check if file was uploaded - only PDF allowed
  if(knowledgeFileInput.files.length > 0) {
    const file = knowledgeFileInput.files[0];
    
    // Only allow PDF files
    if(!file.name.toLowerCase().endsWith('.pdf')) {
      alert('⚠️ Only PDF files are allowed!\n\nPlease upload a PDF document.');
      return;
    }
    
    // Ensure API configuration is set before training
    updateAPIConfig();
    
    // Store data for wizard
    trainingData.fullText = textContent;
    trainingData.fileName = file.name;
    
    // Move to Step 1: Text Extraction
    showWizardStep(1, file.name);
  } else {
    alert('⚠️ Please upload a PDF file first.');
    return;
  }
});

// Wizard step navigation function
function showWizardStep(stepNumber, fileName = '') {
  // Hide all steps
  for(let i = 0; i <= 4; i++) {
    const step = document.getElementById(`step${i}`);
    if(step) step.style.display = 'none';
  }
  
  // Show current step
  const currentStep = document.getElementById(`step${stepNumber}`);
  if(currentStep) currentStep.style.display = 'block';
  
  // Update modal title
  const modalTitle = document.getElementById('modalTitle');
  const titles = [
    '📚 Train Your AI Assistant',
    '📄 Step 1: Extracting Text',
    '✂️ Step 2: Text Chunking',
    '🧮 Step 3: Creating Embeddings',
    '✅ Training Complete!'
  ];
  if(modalTitle) modalTitle.textContent = titles[stepNumber];
  
  // Handle each step
  if(stepNumber === 1) {
    // Show extraction progress
    if(fileName) {
      document.getElementById('fileName').textContent = fileName;
    }
    document.getElementById('charCount').textContent = trainingData.fullText.length.toLocaleString();
    const preview = trainingData.fullText.substring(0, 500);
    document.getElementById('textPreview').textContent = preview + (trainingData.fullText.length > 500 ? '\n\n...' : '');
    document.getElementById('pageProgress').textContent = '✅ Extraction complete!';
  }
}

// Next button: Extraction → Chunking
document.getElementById('nextToChunking').addEventListener('click', async () => {
  // Perform chunking
  const chunkSize = 500;
  const chunks = [];
  const text = trainingData.fullText;
  
  for(let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  
  trainingData.chunks = chunks;
  
  // Show step 2
  showWizardStep(2);
  
  // Display chunks
  document.getElementById('chunkCountDisplay').textContent = chunks.length;
  const chunksList = document.getElementById('chunkExamplesList');
  chunksList.innerHTML = '';
  
  const chunksToShow = Math.min(5, chunks.length);
  for(let i = 0; i < chunksToShow; i++) {
    const preview = chunks[i].substring(0, 100) + (chunks[i].length > 100 ? '...' : '');
    chunksList.innerHTML += `
      <div style="margin:8px 0;padding:10px;background:#f9f9f9;border-left:3px solid #4caf50;border-radius:4px;">
        <strong style="color:#2e7d32;">Chunk ${i+1}:</strong>
        <div style="font-size:11px;color:#555;margin-top:5px;">"${preview}"</div>
      </div>
    `;
  }
  
  if(chunks.length > 5) {
    chunksList.innerHTML += `<div style="text-align:center;color:#888;font-size:12px;margin-top:10px;">... and ${chunks.length - 5} more chunks</div>`;
  }
});

// Back button: Chunking → Extraction
document.getElementById('backToExtraction').addEventListener('click', () => {
  showWizardStep(1);
});

// Next button: Chunking → Embeddings
document.getElementById('nextToEmbedding').addEventListener('click', async () => {
  // Train the RAG system with APPEND mode (keeps existing data)
  const stats = await ragSystem.train(trainingData.fullText, true);
  trainingData.stats = stats;
  trainingData.embeddings = ragSystem.embeddings;
  
  // Mark that user has added their own training data
  if(currentMode === 'ai') {
    userHasTrained = true;
  }
  
  // Show step 3
  showWizardStep(3);
  
  // Display embeddings
  document.getElementById('embeddingCountDisplay').textContent = ragSystem.embeddings.length;
  const embeddingsList = document.getElementById('embeddingExamplesList');
  embeddingsList.innerHTML = '';
  
  const embeddingsToShow = Math.min(5, ragSystem.embeddings.length);
  for(let i = 0; i < embeddingsToShow; i++) {
    const embedding = ragSystem.embeddings[i];
    const vectorPreview = Object.entries(embedding).slice(0, 5).map(([word, val]) => `${word}:${val.toFixed(2)}`).join(', ');
    const vectorSize = Object.keys(embedding).length;
    
    embeddingsList.innerHTML += `
      <div style="margin:8px 0;padding:10px;background:#f9f9f9;border-left:3px solid #2196f3;border-radius:4px;">
        <strong style="color:#1976d2;">Vector ${i+1}:</strong>
        <div style="font-size:10px;color:#555;margin-top:5px;font-family:monospace;">
          [${vectorPreview}... <em>${vectorSize} dimensions</em>]
        </div>
      </div>
    `;
  }
  
  if(ragSystem.embeddings.length > 5) {
    embeddingsList.innerHTML += `<div style="text-align:center;color:#888;font-size:12px;margin-top:10px;">... and ${ragSystem.embeddings.length - 5} more embeddings</div>`;
  }
});

// Back button: Embeddings → Chunking
document.getElementById('backToChunking').addEventListener('click', () => {
  showWizardStep(2);
});

// Next button: Embeddings → Storage Complete
document.getElementById('nextToStorage').addEventListener('click', () => {
  // Update backward compatibility variables
  knowledgeBase = trainingData.fullText;
  knowledgeChunks = ragSystem.chunks;
  knowledgeEmbeddings = ragSystem.embeddings;
  
  // Mark that user has trained (if in AI mode and was offered training)
  if(currentMode === 'ai' && aiTrainingOffered) {
    userHasTrained = true;
  }
  
  // Show final step
  showWizardStep(4);
  
  // Display final stats
  const stats = trainingData.stats;
  document.getElementById('finalChunkCount').textContent = stats.chunks;
  document.getElementById('finalEmbeddingCount').textContent = stats.embeddings;
  document.getElementById('finalVocabSize').textContent = stats.vocabulary;
  document.getElementById('finalStorageSize').textContent = stats.sizeKB;
  
  const llmStatus = ragSystem.enabled && ragSystem.apiKey ? '✅ LLM Ready' : '⚠️ LLM Not Configured';
  document.getElementById('finalLLMStatus').textContent = llmStatus;
});

// Finish button: Close modal
document.getElementById('finishTraining').addEventListener('click', () => {
  // Add uploaded file to the trained books list
  if(trainingData.fileName && !initialPDFs.includes(trainingData.fileName)) {
    initialPDFs.push(trainingData.fileName);
    // Save to localStorage
    localStorage.setItem('trainedBooks', JSON.stringify(initialPDFs));
    updateTrainedBooksList(); // Update the sidebar display
  }
  
  // Close modal
  if(knowledgeModal) knowledgeModal.style.display = 'none';
  
  // Reset to step 0 and clear form for next upload
  showWizardStep(0);
  knowledgeText.value = '';
  knowledgeFileInput.value = '';
  
  // Show success message in chat
  if(currentMode === 'ai' && chatLogAI) {
    const totalKB = (ragSystem.knowledgeBase.length / 1024).toFixed(2);
    appendMessageAI('bot', `✅ Training complete! I now have ${totalKB}KB of knowledge from "${trainingData.fileName}".\n\nYou can ask me questions, or train me on more documents by clicking "Start Training" again!`);
  }
});

// Clear knowledge base
clearKnowledge.addEventListener('click', () => {
  if(confirm('Are you sure you want to clear the knowledge base?')){
    // Clear RAG system
    ragSystem.clear();
    
    // Clear backward compatibility variables
    knowledgeBase = '';
    knowledgeText.value = '';
    knowledgeChunks = [];
    knowledgeEmbeddings = [];
    
    // Clear trained books list
    initialPDFs = [];
    localStorage.removeItem('trainedBooks'); // Remove from storage
    updateTrainedBooksList(); // Update sidebar to show "No books loaded yet"
    
    // Reset display
    const progressDiv = document.getElementById('trainingProgress');
    if(progressDiv) progressDiv.style.display = 'none';
    
    document.getElementById('chunkCount').textContent = 'Chunks: 0';
    document.getElementById('embeddingCount').textContent = 'Embeddings: 0';
    document.getElementById('storageSize').textContent = 'Size: 0 KB';
    
    alert('Knowledge base and conversation history cleared!');
  }
});

// Load knowledge base from localStorage on startup
const savedKnowledge = localStorage.getItem('bot-knowledge-base');
const savedChunks = localStorage.getItem('bot-knowledge-chunks');
if(savedKnowledge){
  knowledgeBase = savedKnowledge;
  if(savedChunks){
    knowledgeChunks = JSON.parse(savedChunks);
    knowledgeEmbeddings = knowledgeChunks.map(s => createSimpleEmbedding(s));
  }
}

// Close knowledge modal on outside click
knowledgeModal.addEventListener('click', (e) => {
  if(e.target === knowledgeModal){
    knowledgeModal.classList.remove('open');
  }
});

// API Option handler (BookEinstein vs Own Key)
const apiOption = document.getElementById('apiOption');
const ownKeySettings = document.getElementById('ownKeySettings');
const bookEinsteinInfo = document.getElementById('bookEinsteinInfo');
const apiKeyInput = document.getElementById('apiKey');
const llmProvider = document.getElementById('llmProvider');
const openaiInfo = document.getElementById('openaiInfo');
const geminiInfo = document.getElementById('geminiInfo');

// Function to update API configuration
function updateAPIConfig() {
  const option = apiOption.value;
  const provider = llmProvider.value;
  
  if (option === 'bookeinstein') {
    // Use BookEinstein API Key
    const bookEinsteinKey = BookEinsteinConfig.GEMINI_API_KEY;
    ragSystem.configure(bookEinsteinKey, true, 'gemini');
    ownKeySettings.style.display = 'none';
    bookEinsteinInfo.style.display = 'block';
  } else {
    // Use own API key
    const apiKey = apiKeyInput.value.trim();
    ragSystem.configure(apiKey, true, provider);
    ownKeySettings.style.display = 'block';
    bookEinsteinInfo.style.display = 'none';
  }
  
  // Save preference
  localStorage.setItem('apiOption', option);
}

// API Option dropdown handler
apiOption.addEventListener('change', updateAPIConfig);

// Provider selection handler (for own key)
llmProvider.addEventListener('change', (e) => {
  const provider = e.target.value;
  
  // Update placeholder and info
  if (provider === 'gemini') {
    apiKeyInput.placeholder = 'Enter Google Gemini API Key (FREE)';
    openaiInfo.style.display = 'none';
    geminiInfo.style.display = 'block';
  } else {
    apiKeyInput.placeholder = 'Enter OpenAI API Key';
    openaiInfo.style.display = 'block';
    geminiInfo.style.display = 'none';
  }
  
  // Update configuration if using own key
  if (apiOption.value === 'own') {
    updateAPIConfig();
  }
});

// API key input handler (for own key)
apiKeyInput.addEventListener('input', (e) => {
  if (apiOption.value === 'own') {
    updateAPIConfig();
  }
});

// Load saved settings on startup
const savedOption = localStorage.getItem('apiOption');
if (savedOption) {
  apiOption.value = savedOption;
} else {
  // Default to BookEinstein if no preference saved
  apiOption.value = 'bookeinstein';
  localStorage.setItem('apiOption', 'bookeinstein');
}

// Load saved API key if using own key
if (ragSystem.apiKey && apiOption.value === 'own') {
  apiKeyInput.value = ragSystem.apiKey;
}

// Load saved provider
if (ragSystem.provider && apiOption.value === 'own') {
  llmProvider.value = ragSystem.provider;
  llmProvider.dispatchEvent(new Event('change'));
}

// Initialize on load - This will configure the RAG system with BookEinstein or user's key
updateAPIConfig();

// ==========================================
// RESIZABLE PANELS FUNCTIONALITY
// ==========================================

let isResizing = false;
let startX = 0;
let startCanvasWidth = 0;
let resizeInitialized = false;

function initializeResizeHandlers() {
  if (resizeInitialized) return; // Prevent multiple initializations
  
  const resizeHandle = document.getElementById('resizeHandle');
  const flowCanvas = document.getElementById('flowCanvas');
  const botPanel = document.getElementById('botPanel');
  
  if (!resizeHandle || !flowCanvas || !botPanel || !casualBotSection) {
    console.log('Resize elements not ready yet');
    return;
  }
  
  // Load saved canvas width from localStorage
  const savedCanvasWidth = localStorage.getItem('canvasWidth');
  if (savedCanvasWidth) {
    flowCanvas.style.flex = 'none';
    flowCanvas.style.width = savedCanvasWidth + 'px';
  }
  
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startCanvasWidth = flowCanvas.offsetWidth;
    
    console.log('Resize started - Current width:', startCanvasWidth);
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
    
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    e.preventDefault(); // Prevent any default behavior
    
    const deltaX = e.clientX - startX;
    const newWidth = startCanvasWidth + deltaX;
    
    // Get current section width
    const sectionWidth = casualBotSection ? casualBotSection.offsetWidth : window.innerWidth;
    
    // Enforce minimum widths
    const minCanvasWidth = 300;
    const minPanelWidth = 350;
    const maxCanvasWidth = sectionWidth - minPanelWidth - 12; // 12px for wider handle
    
    console.log('Resizing:', {deltaX, newWidth, minCanvasWidth, maxCanvasWidth});
    
    if (newWidth >= minCanvasWidth && newWidth <= maxCanvasWidth) {
      flowCanvas.style.flex = 'none';
      flowCanvas.style.width = newWidth + 'px';
      
      // Save to localStorage
      localStorage.setItem('canvasWidth', newWidth);
    }
  });
  
  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  });
  
  resizeInitialized = true;
  console.log('Resize handlers initialized');
}

// ==========================================
// ZOOM FUNCTIONALITY
// ==========================================

const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');

let zoomLevel = 1;
const zoomStep = 0.02; // Reduced to 0.02 for smoother, less sensitive zoom
const minZoom = 0.5;
const maxZoom = 1.5;

// Load saved zoom level
const savedZoom = localStorage.getItem('canvasZoom');
if (savedZoom) {
  zoomLevel = parseFloat(savedZoom);
  applyZoom();
}

function applyZoom() {
  if (connectionsSvg && nodesLayer) {
    connectionsSvg.style.transform = `scale(${zoomLevel})`;
    nodesLayer.style.transform = `scale(${zoomLevel})`;
    
    // Save to localStorage
    localStorage.setItem('canvasZoom', zoomLevel);
  }
}

if (zoomInBtn) {
  zoomInBtn.addEventListener('click', () => {
    if (zoomLevel < maxZoom) {
      zoomLevel = Math.min(zoomLevel + zoomStep, maxZoom);
      applyZoom();
    }
  });
}

if (zoomOutBtn) {
  zoomOutBtn.addEventListener('click', () => {
    if (zoomLevel > minZoom) {
      zoomLevel = Math.max(zoomLevel - zoomStep, minZoom);
      applyZoom();
    }
  });
}

if (zoomResetBtn) {
  zoomResetBtn.addEventListener('click', () => {
    zoomLevel = 1;
    applyZoom();
  });
}

// Mouse wheel zoom (with Ctrl key)
if (flowCanvas) {
  flowCanvas.addEventListener('wheel', (e) => {
    // Only zoom when Ctrl key is pressed
    if (e.ctrlKey) {
      e.preventDefault();
      
      if (e.deltaY < 0) {
        // Zoom in
        if (zoomLevel < maxZoom) {
          zoomLevel = Math.min(zoomLevel + zoomStep, maxZoom);
          applyZoom();
        }
      } else {
        // Zoom out
        if (zoomLevel > minZoom) {
          zoomLevel = Math.max(zoomLevel - zoomStep, minZoom);
          applyZoom();
        }
      }
    }
  }, { passive: false });
}
