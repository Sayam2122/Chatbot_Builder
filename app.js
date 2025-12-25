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

// AI mode tracking
let aiQuestionCount = 0; // Track questions in AI mode
let aiTrainingOffered = false; // Track if training offer shown
let userHasTrained = false; // Track if user uploaded their own PDF
let initialPDFs = []; // Store names of initially loaded PDFs

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
let customNodesAdded = 0; // Track custom nodes added
const MAX_CUSTOM_NODES = 3; // Allow only 3 custom nodes

// Track path history for back button
let pathHistory = []; // Array to store node IDs in order of traversal
let activeConnections = []; // Track active connections to persist them after redraw

// Predefined nodes for Casual Bot mode (educational examples)
const predefinedNodes = [
  { id: 'start', label: 'Start point', icon: '🏠', class: 'node-start', x: 80, y: 300, type: 'start', message: 'Welcome to Casual Bot! 👋\n\nI can answer questions about AI concepts. Try asking me about:\n• What is an embedding?\n• What is chunking?\n• What is a vector?\n• How does AI learn?\n• What is RAG?', canAddChild: false },
  
  // First level questions from Start
  { id: 'q1', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 320, y: 40, type: 'response', question: 'what is an embedding', message: '', canAddChild: true },
  { id: 'a1', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 560, y: 40, type: 'response', question: '', message: '🧮 An embedding is a way to convert text into numbers (vectors) that AI can understand. It\'s like translating words into a language computers can process!', canAddChild: false },
  
  { id: 'q2', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 320, y: 160, type: 'response', question: 'what is chunking', message: '', canAddChild: true },
  { id: 'a2', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 560, y: 160, type: 'response', question: '', message: '✂️ Chunking is breaking large text into smaller pieces. Like cutting a big document into paragraphs so AI can process it better!', canAddChild: false },
  
  { id: 'q3', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 320, y: 280, type: 'response', question: 'what is a vector', message: '', canAddChild: true },
  { id: 'a3', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 560, y: 280, type: 'response', question: '', message: '📊 A vector is a list of numbers that represents something in AI. It\'s like coordinates on a map - but for words and concepts!', canAddChild: false },
  
  { id: 'q4', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 320, y: 400, type: 'response', question: 'how does ai learn', message: '', canAddChild: true },
  { id: 'a4', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 560, y: 400, type: 'response', question: '', message: '🎓 AI learns by finding patterns in data! It reads lots of examples and discovers connections - like how you learn from experience!', canAddChild: false },
  
  { id: 'q5', label: 'User Input', icon: '❓', class: 'node-response node-example', x: 320, y: 520, type: 'response', question: 'what is rag', message: '', canAddChild: true },
  { id: 'a5', label: 'Bot Response', icon: '💬', class: 'node-response node-example', x: 560, y: 520, type: 'response', question: '', message: '🤖 RAG (Retrieval-Augmented Generation) is when AI searches through documents to find information before answering. It\'s like having a smart assistant that reads books before responding!', canAddChild: false },
  
  { id: 'fallback', label: 'Default Fallback', icon: 'ELSE', class: 'node-fallback node-example', x: 320, y: 640, type: 'fallback', message: 'I don\'t have an answer for that yet. Try asking about the topics I know!', canAddChild: true }
];

// Predefined connections for Casual Bot
const predefinedConnections = [
  // From Start to all 5 first-level questions
  { from: 'start', to: 'q1' },
  { from: 'start', to: 'q2' },
  { from: 'start', to: 'q3' },
  { from: 'start', to: 'q4' },
  { from: 'start', to: 'q5' },
  { from: 'start', to: 'fallback' },
  
  // Each question to its answer
  { from: 'q1', to: 'a1' },
  { from: 'q2', to: 'a2' },
  { from: 'q3', to: 'a3' },
  { from: 'q4', to: 'a4' },
  { from: 'q5', to: 'a5' }
  
  // New nodes will be created dynamically after each answer
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
  
  // Start conversation automatically
  startConversation();
}

// Auto-load PDFs from books folder for initial training
async function loadInitialPDFs() {
  try {
    // Note: This requires a file listing endpoint or manual array of PDF names
    // For now, we'll use a hardcoded list that user can update
    const pdfFiles = [
      'thebook.pdf',
    ];
    
    if(pdfFiles.length === 0) {
      console.log('ℹ️ No initial PDFs configured in books folder');
      return;
    }
    
    console.log('📚 Loading initial PDFs...');
    
    // Show loading message
    if(chatLogAI) {
      appendMessageAI('bot', '📚 Loading initial training documents, please wait...');
    }
    
    initialPDFs = [];
    
    for(const pdfFile of pdfFiles) {
      try {
        const pdfUrl = `./books/${pdfFile}`;
        
        // Load PDF using PDF.js
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        // Extract text from all pages
        for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        // Train the RAG system with this PDF
        if(fullText.trim()) {
          await ragSystem.train(fullText);
          initialPDFs.push(pdfFile);
          console.log(`✅ Loaded and trained: ${pdfFile}`);
        }
        
      } catch(error) {
        console.error(`❌ Error loading ${pdfFile}:`, error);
      }
    }
    
    // Clear loading message
    if(chatLogAI && initialPDFs.length > 0) {
      chatLogAI.innerHTML = '';
    }
    
    if(initialPDFs.length > 0) {
      console.log(`✅ Successfully loaded ${initialPDFs.length} PDF(s) for initial training`);
    }
    
  } catch(error) {
    console.error('Error loading initial PDFs:', error);
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
  
  // Load initial PDFs and start AI conversation
  loadInitialPDFs().then(() => {
    startConversationAI();
  });
}

function showCanvasView() {
  // Show the node canvas alongside chat
  const flowCanvas = document.getElementById('flowCanvas');
  const botPanel = document.getElementById('botPanel');
  if(flowCanvas) {
    flowCanvas.style.display = 'block';
    // Center the scroll position to allow scrolling in all directions
    setTimeout(() => {
      flowCanvas.scrollLeft = 250;
      flowCanvas.scrollTop = 250;
    }, 50);
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
    
    div.innerHTML = `
      <span class="node-icon">${node.icon}</span>
      <span class="node-label">${node.label}</span>
      ${node.badge ? `<span class="node-badge">${node.badge}</span>` : ''}
      ${(node.type === 'response' || node.type === 'fallback') && isCustomizeMode ? '<button class="add-node-btn" onclick="addChildNode(event, \'' + node.id + '\')">+</button>' : ''}
    `;
    
    div.addEventListener('mousedown', startDrag);
    div.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      openEditModal(node.id);
    });
    
    nodesLayer.appendChild(div);
  });
  
  drawConnections();
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
}

function startConversation(){
  // clear chat log and show start message
  chatLog.innerHTML = '';
  pathHistory = []; // Reset path history
  activeConnections = []; // Reset active connections - CLEAR ALL BLUE LINES
  currentNodeId = 'start';
  previousNodeId = null;
  
  // Hide back button
  const backBtn = document.getElementById('backBtn');
  if(backBtn) backBtn.style.display = 'none';
  
  // Hide main menu button
  const mainMenuBtn = document.getElementById('mainMenuBtn');
  if(mainMenuBtn) mainMenuBtn.style.display = 'none';
  
  // Remove pointer completely
  const existingPointer = document.getElementById('currentPointer');
  if(existingPointer) existingPointer.remove();
  
  // Redraw connections to clear blue lines
  // drawConnections();
  
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
    
    let welcomeMsg = 'Welcome to AI Bot! 🤖\n\n';
    
    if(initialPDFs.length > 0) {
      welcomeMsg += 'I am initially trained on the following documents:\n';
      initialPDFs.forEach((pdf, idx) => {
        welcomeMsg += `${idx + 1}. ${pdf}\n`;
      });
      welcomeMsg += '\nYou can ask me any questions about these topics!';
    } else {
      welcomeMsg += 'I can answer questions based on documents you train me with. Click "Start Training" to teach me from your books, PDFs, or text files!';
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
function drawConnections() {
  connectionsSvg.innerHTML = `
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="#999" />
      </marker>
      <marker id="arrowhead-active" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="#0099ff" />
      </marker>
    </defs>
  `;
  
  connections.forEach(conn => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return;
    
    const fromEl = document.getElementById(`node-${conn.from}`);
    const toEl = document.getElementById(`node-${conn.to}`);
    if (!fromEl || !toEl) return;
    
    const x1 = fromNode.x + fromEl.offsetWidth / 2;
    const y1 = fromNode.y + fromEl.offsetHeight / 2;
    const x2 = toNode.x + toEl.offsetWidth / 2;
    const y2 = toNode.y + toEl.offsetHeight / 2;
    
    // Curved path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const dx = x2 - x1;
    const dy = y2 - y1;
    const controlOffset = Math.abs(dx) * 0.5;
    
    const d = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
    path.setAttribute('d', d);
    path.setAttribute('class', 'connection');
    path.setAttribute('data-from', conn.from);
    path.setAttribute('data-to', conn.to);
    
    // Re-apply active class if this connection was active before redraw
    const isActive = activeConnections.some(ac => ac.from === conn.from && ac.to === conn.to);
    if(isActive) {
      path.classList.add('active');
    }
    
    connectionsSvg.appendChild(path);
  });
  
  // Re-add the current pointer if it exists (to keep it on top)
  if(currentNodeId) {
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
  
  if(nodeId === 'start') {
    // For Start node, position at the END (right side) because traversal goes FROM start
    targetX = node.x + nodeEl.offsetWidth + 15; // 15px after the node
    targetY = node.y + (nodeEl.offsetHeight / 2);
  } else {
    // For other nodes, position BEFORE (left side) at the end of incoming blue line
    targetX = node.x - 15; // 15px before the node
    targetY = node.y + (nodeEl.offsetHeight / 2);
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
    // Clear conversation history in RAG system
    ragSystem.clearHistory();
    startConversation();
  });
}

// Back button (Casual mode)
const backBtn = document.getElementById('backBtn');
if(backBtn){
  backBtn.addEventListener('click', ()=>{
    // Go back in the path history
    if(pathHistory.length > 1) {
      // Remove current node from history
      pathHistory.pop();
      
      // Get the previous node
      const previousNode = pathHistory[pathHistory.length - 1];
      
      // Remove the blue line between previous and current
      if(pathHistory.length >= 2) {
        const fromNode = pathHistory[pathHistory.length - 2];
        const toNode = currentNodeId;
        removeConnectionHighlight(fromNode, toNode);
      }
      
      // Update current node without adding to history again
      currentNodeId = previousNode;
      previousNodeId = pathHistory.length >= 2 ? pathHistory[pathHistory.length - 2] : null;
      
      // Update active node styling (blue border)
      document.querySelectorAll('.node.active').forEach(el=>el.classList.remove('active'));
      const el = document.getElementById('node-' + currentNodeId);
      if(el) el.classList.add('active');
      
      // Update pointer position - NO ANIMATION (just jump directly)
      updateCurrentPointer(currentNodeId, null);
      
      // Hide back button if we're at the start
      if(pathHistory.length <= 1) {
        backBtn.style.display = 'none';
      }
      
      // Hide main menu button if we're at the start
      const mainMenuBtn = document.getElementById('mainMenuBtn');
      if(mainMenuBtn && currentNodeId === 'start') {
        mainMenuBtn.style.display = 'none';
      }
      
      // Add message to chat
      const node = nodes.find(n => n.id === currentNodeId);
      if(node && node.message) {
        appendMessage('bot', '⬅️ Going back...\n\n' + node.message);
      }
    }
  });
}

// Main Menu button (Casual mode)
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

// Customize Nodes button
const customizeNodesBtn = document.getElementById('customizeNodesBtn');
if(customizeNodesBtn){
  customizeNodesBtn.addEventListener('click', ()=>{
    if(customNodesAdded >= MAX_CUSTOM_NODES){
      appendMessage('bot', `⚠️ You've already added ${MAX_CUSTOM_NODES} custom nodes. That's the limit to keep things simple!`);
      return;
    }
    
    // Prompt user to add custom nodes
    appendMessage('bot', `🎨 You can add ${MAX_CUSTOM_NODES - customNodesAdded} more custom node(s)!\n\nTell me:\n1. What question should the node ask?\n2. What answer should it give?\n\nExample: "Question: What is machine learning? Answer: Machine learning is..."`);
    isCustomizeMode = true;
  });
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
        const q = child.question.toLowerCase().trim().replace(/[?!.]/g, '');
        const userText = text.toLowerCase().trim().replace(/[?!.]/g, '');
        
        // Check for match with flexible matching
        if(userText.includes(q) || q.includes(userText) || userText === q){
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
        
        // Show customize button after 3 questions
        if(currentMode === 'casual' && questionCount >= 3) {
          const customizeBtn = document.getElementById('customizeNodesBtn');
          if(customizeBtn) {
            customizeBtn.style.display = 'inline-block';
          }
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
      // Check if it's the main menu button
      const action = e.target.getAttribute('data-action');
      if(action === 'mainmenu') {
        // Go back to start
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        if(mainMenuBtn) {
          mainMenuBtn.click();
        }
        return;
      }
      
      const question = e.target.getAttribute('data-question');
      if(question) {
        // Set the question in input and send it
        userMessage.value = question;
        sendMessage();
        
        // Keep buttons visible - don't remove them
        // User can click any question multiple times
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
  if (ragSystem.knowledgeBase && ragSystem.enabled && ragSystem.apiKey) {
    // Increment question count
    aiQuestionCount++;
    
    appendMessageAI('bot', '🤔 Searching knowledge base and generating answer...');
    
    try {
      const llmAnswer = await ragSystem.askLLM(text);
      const lastMsg = chatLogAI.lastElementChild;
      if (lastMsg && lastMsg.classList.contains('bot-message')) {
        lastMsg.textContent = llmAnswer;
      }
      
      // After 3 questions, offer training option
      if(aiQuestionCount === 3 && !aiTrainingOffered && !userHasTrained) {
        aiTrainingOffered = true;
        setTimeout(() => {
          appendMessageAI('bot', '💡 You can also train me on your own data!\n\nWould you like to upload your own PDF document? (Type "yes" to proceed)');
        }, 1500);
      }
      
    } catch (error) {
      console.error('LLM Error:', error);
      const lastMsg = chatLogAI.lastElementChild;
      if (lastMsg && lastMsg.classList.contains('bot-message')) {
        lastMsg.textContent = '❌ ' + error.message;
      }
    }
  } else {
    appendMessageAI('bot', '⚠️ Please train the AI first by clicking "Start Training" and uploading a document or pasting text content.');
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
    knowledgeModal.classList.add('open');
  });
}

closeKnowledgeModal.addEventListener('click', () => {
  knowledgeModal.classList.remove('open');
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

// Save knowledge base with visual processing
saveKnowledge.addEventListener('click', async () => {
  // Check if user has already trained with their own PDF
  if(userHasTrained && currentMode === 'ai') {
    alert('⚠️ You have already trained me with your document!\n\nYou can only upload one PDF at a time.');
    return;
  }
  
  const textContent = knowledgeText.value.trim();
  if(!textContent){
    alert('Please upload a file or paste some text content first.');
    return;
  }
  
  // Check if file was uploaded (only allow PDF in AI mode after initial training)
  if(knowledgeFileInput.files.length > 0) {
    const file = knowledgeFileInput.files[0];
    
    // In AI mode, only allow PDF files
    if(currentMode === 'ai' && aiTrainingOffered) {
      if(!file.name.toLowerCase().endsWith('.pdf')) {
        alert('⚠️ Only PDF files are allowed!\n\nPlease upload a PDF document.');
        return;
      }
    }
  }
  
  // Reset all steps
  document.querySelectorAll('.step').forEach(s => {
    s.classList.remove('active', 'completed');
  });
  
  // Hide examples
  document.getElementById('chunkExamples').style.display = 'none';
  document.getElementById('embeddingExamples').style.display = 'none';
  
  // Step 1: Text Input
  await animateStep(1);
  const preview = textContent.substring(0, 100) + (textContent.length > 100 ? '...' : '');
  document.getElementById('inputPreview').textContent = `"${preview}"`;
  document.getElementById('chunkCount').textContent = 'Chunks: 0';
  
  // Step 2: Text Chunking
  await animateStep(2);
  
  // Step 3: Create Embeddings
  await animateStep(3);
  
  // Step 4: Store in Memory
  await animateStep(4);
  
  // Use RAG system to train
  const stats = await ragSystem.train(textContent);
  
  // Update backward compatibility variables
  knowledgeBase = textContent;
  knowledgeChunks = ragSystem.chunks;
  knowledgeEmbeddings = ragSystem.embeddings;
  
  // Mark that user has trained (if in AI mode and was offered training)
  if(currentMode === 'ai' && aiTrainingOffered) {
    userHasTrained = true;
  }
  
  // Update UI stats
  document.getElementById('chunkCount').textContent = `Chunks: ${stats.chunks}`;
  document.getElementById('embeddingCount').textContent = `Vectors: ${stats.embeddings}`;
  document.getElementById('storageSize').textContent = `Size: ${stats.sizeKB} KB`;
  
  // Show example chunks (first 4-5)
  const chunkExamplesDiv = document.getElementById('chunkExamples');
  const chunkList = document.getElementById('chunkList');
  if(chunkExamplesDiv && chunkList){
    chunkList.innerHTML = '';
    const chunksToShow = Math.min(5, ragSystem.chunks.length);
    for(let i = 0; i < chunksToShow; i++){
      const chunkPreview = ragSystem.chunks[i].substring(0, 80) + (ragSystem.chunks[i].length > 80 ? '...' : '');
      chunkList.innerHTML += `<div style="margin:3px 0;padding:4px;background:#fff;border-left:3px solid #4caf50;border-radius:3px;"><strong>Chunk ${i+1}:</strong> "${chunkPreview}"</div>`;
    }
    if(chunksToShow > 0){
      chunkExamplesDiv.style.display = 'block';
      console.log('✅ Showing', chunksToShow, 'chunk examples');
    }
  }
  
  // Show example embeddings (first 4-5)
  const embeddingExamplesDiv = document.getElementById('embeddingExamples');
  const embeddingList = document.getElementById('embeddingList');
  if(embeddingExamplesDiv && embeddingList){
    embeddingList.innerHTML = '';
    const embeddingsToShow = Math.min(5, ragSystem.embeddings.length);
    for(let i = 0; i < embeddingsToShow; i++){
      // Show first 5 values of each embedding vector
      const embedding = ragSystem.embeddings[i];
      const vectorPreview = Object.entries(embedding).slice(0, 5).map(([word, val]) => `${word}:${val.toFixed(2)}`).join(', ');
      const vectorSize = Object.keys(embedding).length;
      embeddingList.innerHTML += `<div style="margin:3px 0;padding:4px;background:#fff;border-left:3px solid #2196f3;border-radius:3px;"><strong>Vector ${i+1}:</strong> [${vectorPreview}... <em>${vectorSize} words</em>]</div>`;
    }
    if(embeddingsToShow > 0){
      embeddingExamplesDiv.style.display = 'block';
      console.log('✅ Showing', embeddingsToShow, 'embedding examples');
    }
  }
  
  const llmStatus = ragSystem.enabled && ragSystem.apiKey ? '✅ LLM Ready' : '⚠️ LLM Not Configured';
  
  alert(`✅ Knowledge base trained successfully!\n\n📊 Stats:\n- ${stats.chunks} chunks created\n- ${stats.embeddings} embeddings generated\n- ${stats.vocabulary} unique terms indexed\n- ${stats.sizeKB} KB stored\n- ${llmStatus}\n\n${ragSystem.enabled ? 'The bot can now use AI to answer questions with conversation memory!' : 'Enable LLM mode for AI-powered answers'}`);
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
    
    // Reset display
    document.getElementById('chunkCount').textContent = 'Chunks: 0';
    document.getElementById('embeddingCount').textContent = 'Vectors: 0';
    document.getElementById('storageSize').textContent = 'Size: 0 KB';
    document.getElementById('lastQuery').textContent = 'Waiting for query...';
    document.getElementById('searchResults').textContent = 'Results: 0';
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active', 'completed'));
    
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

// Initialize on load
updateAPIConfig();
