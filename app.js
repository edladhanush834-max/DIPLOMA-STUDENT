document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  let state = {
    selectedBranch: localStorage.getItem('diplomate_branch') || 'cs',
    budget: parseFloat(localStorage.getItem('diplomate_budget')) || 5000,
    expenses: JSON.parse(localStorage.getItem('diplomate_expenses')) || [],
    activeSubjectId: '',
    speechActive: false
  };

  // --- MOCK SPEECH UTTERANCES CONTAINER ---
  let synthesisInstance = window.speechSynthesis;
  let activeUtterance = null;

  // --- AUDIO SYNTHESIS HELPER ---
  function speak(text) {
    if (synthesisInstance) {
      synthesisInstance.cancel(); // Stop current speech
      activeUtterance = new SpeechSynthesisUtterance(text);
      
      // Select a nice premium natural voice if available
      const voices = synthesisInstance.getVoices();
      const EnglishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                           voices.find(v => v.lang.startsWith('en')) || 
                           voices[0];
      if (EnglishVoice) {
        activeUtterance.voice = EnglishVoice;
      }
      activeUtterance.rate = 1.0;
      activeUtterance.pitch = 1.0;
      synthesisInstance.speak(activeUtterance);
    }
  }

  // --- WEB SPEECH RECOGNITION (VOICE ASSISTANT) ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      state.speechActive = true;
      updateVoiceUI();
      logAssistantMessage("Voice Recognition", "Listening... Please speak now.");
    };

    recognition.onend = () => {
      state.speechActive = false;
      updateVoiceUI();
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      state.speechActive = false;
      updateVoiceUI();
      logAssistantMessage("System Error", "Recognition failed: " + event.error);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      logAssistantMessage("You", speechToText);
      processVoiceCommand(speechToText);
    };
  } else {
    console.warn("Speech recognition not supported in this browser.");
  }

  // --- VIEW ROUTING ENGINE ---
  function navigateTo(viewId) {
    // Update menu bar links
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-target') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update visible views
    document.querySelectorAll('.page-view').forEach(view => {
      if (view.id === viewId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });
  }

  // Bind side menu navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      navigateTo(target);
    });
  });

  // Bind dashboard portal shortcuts
  document.querySelectorAll('.quick-link-card').forEach(card => {
    card.addEventListener('click', () => {
      const destination = card.getAttribute('data-go');
      navigateTo(destination);
    });
  });

  // --- CORE UI SYNCHRONIZATION ---
  function updateDashboardUI() {
    const branchName = window.branchData[state.selectedBranch]?.name || "Student Stream";
    document.getElementById('dashboard-branch-pill').innerText = branchName;
    document.getElementById('dash-active-branch').innerText = state.selectedBranch.toUpperCase();
    document.getElementById('welcome-message').innerText = `Hello, ${state.selectedBranch.toUpperCase()} Student!`;
    
    // Money statistics sync
    const totalSpent = calculateTotalSpent();
    const balance = state.budget - totalSpent;
    document.getElementById('dash-balance').innerText = `₹${balance.toLocaleString()}`;
    
    // Select dropdown option sync
    document.getElementById('branch-selector').value = state.selectedBranch;
  }

  function updateVoiceUI() {
    const micContainer = document.getElementById('mic-container');
    const actionBtn = document.getElementById('voice-activation-btn');
    const mainStatus = document.getElementById('voice-main-status');
    const sidebarIndicator = document.getElementById('sidebar-voice-indicator');
    const sidebarText = document.getElementById('sidebar-voice-text');

    if (state.speechActive) {
      micContainer.classList.add('active');
      mainStatus.innerText = "Listening for commands...";
      mainStatus.style.color = "var(--accent-cyan)";
      sidebarIndicator.classList.add('active');
      sidebarText.innerText = "Voice system active";
    } else {
      micContainer.classList.remove('active');
      mainStatus.innerText = "Voice Assistant Paused";
      mainStatus.style.color = "var(--text-primary)";
      sidebarIndicator.classList.remove('active');
      sidebarText.innerText = "Voice system idle";
    }
  }

  // Helper log in assistant window
  function logAssistantMessage(sender, message) {
    const log = document.getElementById('voice-messages-log');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('transcript-message', sender === 'You' ? 'user' : 'assistant');
    
    const senderSpan = document.createElement('span');
    senderSpan.classList.add('message-sender');
    senderSpan.innerText = sender;
    
    const textSpan = document.createElement('span');
    textSpan.classList.add('message-text');
    textSpan.innerText = message;
    
    msgDiv.appendChild(senderSpan);
    msgDiv.appendChild(textSpan);
    log.appendChild(msgDiv);
    
    // Auto scroll to bottom
    log.scrollTop = log.scrollHeight;
  }

  // --- PREP HUB DYNAMIC CONTROLLERS ---
  function initPrepHub() {
    const branchInfo = window.branchData[state.selectedBranch];
    document.getElementById('prep-branch-pill').innerText = branchInfo.name;
    document.getElementById('prep-branch-name').innerText = `${branchInfo.name} Hub`;

    const subSelect = document.getElementById('prep-subject-selector');
    subSelect.innerHTML = '';

    if (branchInfo.subjects.length > 0) {
      branchInfo.subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.innerText = subject.name;
        subSelect.appendChild(option);
      });
      state.activeSubjectId = branchInfo.subjects[0].id;
      renderSubjectContent();
    } else {
      subSelect.innerHTML = '<option value="">No Subjects Configured</option>';
      document.getElementById('notes-view').innerHTML = '<div class="empty-state">No notes available.</div>';
      document.getElementById('questions-view').innerHTML = '<div class="empty-state">No questions loaded.</div>';
    }
  }

  function renderSubjectContent() {
    const branchInfo = window.branchData[state.selectedBranch];
    const subject = branchInfo.subjects.find(s => s.id === state.activeSubjectId);
    
    const notesContainer = document.getElementById('notes-view');
    const questionsContainer = document.getElementById('questions-view');
    
    notesContainer.innerHTML = '';
    questionsContainer.innerHTML = '';

    if (!subject) return;

    // Render Notes
    if (subject.notes && subject.notes.length > 0) {
      subject.notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.classList.add('note-card', 'glass-panel');
        
        const h3 = document.createElement('h3');
        h3.innerText = note.title;
        
        const p = document.createElement('p');
        p.innerText = note.content;
        
        const readBtn = document.createElement('button');
        readBtn.classList.add('read-btn');
        readBtn.title = "Read Aloud";
        readBtn.innerHTML = `
          <svg viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        `;
        
        readBtn.addEventListener('click', () => {
          speak(`${note.title}. ${note.content}`);
        });

        noteCard.appendChild(h3);
        noteCard.appendChild(p);
        noteCard.appendChild(readBtn);
        notesContainer.appendChild(noteCard);
      });
    } else {
      notesContainer.innerHTML = '<div class="empty-state">No notes available for this subject.</div>';
    }

    // Render Questions (Accordion style)
    if (subject.questions && subject.questions.length > 0) {
      subject.questions.forEach(qItem => {
        const accordion = document.createElement('div');
        accordion.classList.add('question-accordion', 'glass-panel');
        
        const header = document.createElement('div');
        header.classList.add('question-header');
        header.innerHTML = `
          <span>${qItem.q}</span>
          <svg class="question-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        `;
        
        const body = document.createElement('div');
        body.classList.add('question-body');
        
        const content = document.createElement('div');
        content.classList.add('question-content');
        
        const ansP = document.createElement('p');
        ansP.innerText = qItem.a;
        
        const readBtn = document.createElement('button');
        readBtn.classList.add('read-btn');
        readBtn.title = "Read Answer";
        readBtn.innerHTML = `
          <svg viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        `;
        
        readBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Avoid triggering accordion close
          speak(`Question: ${qItem.q}. Answer: ${qItem.a}`);
        });

        content.appendChild(ansP);
        content.appendChild(readBtn);
        body.appendChild(content);
        accordion.appendChild(header);
        accordion.appendChild(body);
        
        // Click accordion toggle
        header.addEventListener('click', () => {
          const isOpen = accordion.classList.contains('open');
          // Close others
          document.querySelectorAll('.question-accordion').forEach(acc => acc.classList.remove('open'));
          if (!isOpen) {
            accordion.classList.add('open');
          }
        });
        
        questionsContainer.appendChild(accordion);
      });
    } else {
      questionsContainer.innerHTML = '<div class="empty-state">No sample questions loaded.</div>';
    }
  }

  // Handle Prep hub UI selectors
  document.getElementById('prep-subject-selector').addEventListener('change', (e) => {
    state.activeSubjectId = e.target.value;
    renderSubjectContent();
  });

  // Handle internal tabs inside prep hub
  document.getElementById('tab-notes').addEventListener('click', () => {
    document.getElementById('tab-notes').classList.add('active');
    document.getElementById('tab-questions').classList.remove('active');
    document.getElementById('notes-view').style.display = 'flex';
    document.getElementById('questions-view').style.display = 'none';
  });

  document.getElementById('tab-questions').addEventListener('click', () => {
    document.getElementById('tab-notes').classList.remove('active');
    document.getElementById('tab-questions').classList.add('active');
    document.getElementById('notes-view').style.display = 'none';
    document.getElementById('questions-view').style.display = 'flex';
  });

  // Save Settings configuration
  document.getElementById('save-branch-btn').addEventListener('click', () => {
    const selected = document.getElementById('branch-selector').value;
    state.selectedBranch = selected;
    localStorage.setItem('diplomate_branch', selected);
    updateDashboardUI();
    initPrepHub();
    speak(`Configured your branch to ${window.branchData[selected].name}`);
  });

  // --- MONEY MANAGER SYSTEM ---
  function calculateTotalSpent() {
    return state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  function updateMoneyUI() {
    const totalSpent = calculateTotalSpent();
    const remaining = state.budget - totalSpent;
    const spentPercent = state.budget > 0 ? (totalSpent / state.budget) * 100 : 0;
    const remainingPercent = Math.max(0, 100 - spentPercent);
    
    // Numerical displays
    document.getElementById('tracker-total-budget').innerText = `₹${state.budget.toLocaleString()}`;
    document.getElementById('tracker-total-spent').innerText = `₹${totalSpent.toLocaleString()}`;
    document.getElementById('tracker-remaining-budget').innerText = `₹${remaining.toLocaleString()}`;
    document.getElementById('budget-remaining-percent').innerText = `${Math.round(remainingPercent)}% Left`;
    
    // Bar styling
    const fillBar = document.getElementById('budget-fill-bar');
    fillBar.style.width = `${remainingPercent}%`;
    
    if (remainingPercent > 50) {
      fillBar.style.backgroundColor = 'var(--accent-green)';
    } else if (remainingPercent > 15) {
      fillBar.style.backgroundColor = '#f59e0b'; // Amber yellow
    } else {
      fillBar.style.backgroundColor = 'var(--accent-red)';
    }

    // Synchronize balance metric card on dashboard
    document.getElementById('dash-balance').innerText = `₹${remaining.toLocaleString()}`;

    renderExpensesLedger();
  }

  function renderExpensesLedger() {
    const ledger = document.getElementById('expenses-ledger');
    ledger.innerHTML = '';

    if (state.expenses.length === 0) {
      ledger.innerHTML = '<div class="empty-state">No expenditures logged this month.</div>';
      return;
    }

    // Render expense items (newest first)
    [...state.expenses].reverse().forEach(exp => {
      const li = document.createElement('li');
      li.classList.add('expense-item');
      
      li.innerHTML = `
        <div class="expense-left">
          <span class="expense-name">${exp.title}</span>
          <div class="expense-meta">
            <span class="expense-cat-pill ${exp.category}">${exp.category}</span>
            <span class="expense-date">${exp.date}</span>
          </div>
        </div>
        <div class="expense-right">
          <span class="expense-amount">₹${exp.amount}</span>
          <button class="delete-expense-btn" data-id="${exp.id}" title="Delete Record">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      `;
      
      // Delete event attachment
      li.querySelector('.delete-expense-btn').addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        removeExpense(id);
      });

      ledger.appendChild(li);
    });
  }

  function addExpense(title, amount, category) {
    if (!title || isNaN(amount) || amount <= 0) return false;
    
    const newExp = {
      id: Date.now(),
      title,
      amount,
      category: category || 'others',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    };

    state.expenses.push(newExp);
    localStorage.setItem('diplomate_expenses', JSON.stringify(state.expenses));
    updateMoneyUI();
    return true;
  }

  function removeExpense(id) {
    state.expenses = state.expenses.filter(e => e.id !== id);
    localStorage.setItem('diplomate_expenses', JSON.stringify(state.expenses));
    updateMoneyUI();
  }

  // Budget Update
  document.getElementById('save-budget-btn').addEventListener('click', () => {
    const budgetVal = parseFloat(document.getElementById('budget-input').value);
    if (!isNaN(budgetVal) && budgetVal >= 0) {
      state.budget = budgetVal;
      localStorage.setItem('diplomate_budget', budgetVal);
      updateMoneyUI();
      speak(`Monthly budget allowance updated to rupees ${budgetVal}`);
    }
  });

  // Manual Transaction Submission
  document.getElementById('add-expense-btn').addEventListener('click', () => {
    const title = document.getElementById('expense-title').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;

    if (title === "") {
      alert("Please enter a valid expense item name.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid expense cost.");
      return;
    }

    if (addExpense(title, amount, category)) {
      // Clear forms
      document.getElementById('expense-title').value = '';
      document.getElementById('expense-amount').value = '';
    }
  });


  // --- VOICE COMMAND ENGINE ---
  function processVoiceCommand(text) {
    const commandText = text.toLowerCase().trim();
    
    // Command 1: Switch views
    if (commandText.includes("dashboard")) {
      navigateTo("view-dashboard");
      speak("Switching to student dashboard.");
      logAssistantMessage("Assistant", "Navigated to Dashboard.");
      return;
    }
    
    if (commandText.includes("prep") || commandText.includes("syllabus") || commandText.includes("study")) {
      navigateTo("view-prep");
      speak("Opening prep resources hub.");
      logAssistantMessage("Assistant", "Navigated to Prep Hub.");
      return;
    }

    if (commandText.includes("money") || commandText.includes("budget") || commandText.includes("expense")) {
      navigateTo("view-money");
      speak("Navigating to student budget spreadsheet.");
      logAssistantMessage("Assistant", "Navigated to Money Manager.");
      return;
    }

    // Command 2: Read Notes
    if (commandText.includes("read notes") || commandText.includes("read notes out loud")) {
      const branchInfo = window.branchData[state.selectedBranch];
      const subject = branchInfo.subjects.find(s => s.id === state.activeSubjectId);
      if (subject && subject.notes && subject.notes.length > 0) {
        speak(`Reading notes for ${subject.name}.`);
        let speechBuffer = `Here are the study notes for ${subject.name}. `;
        subject.notes.forEach((note, index) => {
          speechBuffer += `Topic ${index + 1}: ${note.title}. ${note.content}. `;
        });
        speak(speechBuffer);
        logAssistantMessage("Assistant", `Reading study notes for ${subject.name} out loud.`);
      } else {
        speak("I couldn't find any study notes loaded for this subject.");
        logAssistantMessage("Assistant", "No active subject notes available to read.");
      }
      return;
    }

    // Command 3: Add expense dynamically via parser
    // Syntax examples: "add expense 200 for books", "add expense 50 for lunch"
    const expenseRegex = /add expense\s+(\d+)\s+for\s+(.+)/i;
    const match = commandText.match(expenseRegex);
    if (match) {
      const amount = parseFloat(match[1]);
      const title = match[2];
      
      // Attempt category mapping
      let category = 'others';
      if (title.includes("food") || title.includes("lunch") || title.includes("canteen") || title.includes("tea")) {
        category = 'food';
      } else if (title.includes("book") || title.includes("copy") || title.includes("pen") || title.includes("stationery") || title.includes("notes")) {
        category = 'books';
      } else if (title.includes("bus") || title.includes("travel") || title.includes("metro") || title.includes("cab") || title.includes("ticket")) {
        category = 'transit';
      } else if (title.includes("movie") || title.includes("party") || title.includes("game")) {
        category = 'entertainment';
      }

      if (addExpense(title, amount, category)) {
        speak(`Successfully logged expenditure of ${amount} rupees for ${title}.`);
        logAssistantMessage("Assistant", `Expense logged: ₹${amount} for "${title}" under category "${category}".`);
      } else {
        speak("I could not log the expense. Please repeat the transaction details.");
      }
      return;
    }

    // Command 4: Reset budget database
    if (commandText.includes("reset budget") || commandText.includes("clear database")) {
      state.expenses = [];
      state.budget = 5000;
      localStorage.setItem('diplomate_budget', 5000);
      localStorage.setItem('diplomate_expenses', JSON.stringify([]));
      updateMoneyUI();
      speak("Budget allowance reset to 5000 rupees and ledger cleared.");
      logAssistantMessage("Assistant", "Reset budget ledger to factory defaults.");
      return;
    }

    // Command 5: Help panel
    if (commandText.includes("help") || commandText.includes("commands")) {
      const instructions = "You can navigate by saying: go to dashboard, go to prep, or go to money. You can study by saying: read notes. You can track spending by saying: add expense 100 for textbook.";
      speak(instructions);
      logAssistantMessage("Assistant", "Commands available: 'go to dashboard', 'go to prep', 'go to money', 'read notes', 'add expense [amount] for [description]', 'reset budget'.");
      return;
    }

    // Default unrecognized command response
    const defaultResponse = "Command not recognized. Say 'Help' to hear what I can do.";
    speak(defaultResponse);
    logAssistantMessage("Assistant", defaultResponse);
  }

  // Bind Voice microphone activation button
  const voiceBtn = document.getElementById('voice-activation-btn');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (!recognition) {
        alert("Web Speech recognition is not supported or permission was blocked on this browser.");
        return;
      }
      if (state.speechActive) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  }

  // --- APPLICATION INITIALIZATION ---
  updateDashboardUI();
  initPrepHub();
  updateMoneyUI();
});
