const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const messages = document.getElementById('messages');
const sendButton = document.getElementById('sendButton');
const specializationPanel = document.getElementById('specializationPanel');
const darkModeToggle = document.getElementById('darkModeToggle');
const sidebarButtons = Array.from(document.querySelectorAll('.sidebar-btn'));

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

// Keep specialization cards  in their dedicated panel below the message stream.
// This prevents the cards from jumping into the chat history area.

let selectedLanguage = 'english';
let firstMessage = true;

function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function showTypingIndicator() {
    removeTypingIndicator();   // pehle purana remove karo

    const wrapper = document.createElement('div');
    wrapper.className = 'message bot-message';
    wrapper.id = 'typing-indicator';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble typing-bubble';
    bubble.innerHTML = `
        Typing
        <span class="dot">.</span>
        <span class="dot">.</span>
        <span class="dot">.</span>
    `;

    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}
function triggerTopic(topic) {
  const topicMessages = {
    'fees': 'Tell me about fees',
    'admission': 'How does admission work?',
    'scholarships': 'Are there scholarships available?',
    'specializations': 'Show me the specializations'
  };
  
  // If the user clicks the admission quick topic, show the prepared HTML
  if (topic === 'admission') {
    setActiveSidebarButton(topic);
    // ensure specialization panel is hidden when showing admission info
    specializationPanel.classList.add('hidden');
    if (selectedLanguage === 'hinglish') {
      addBotMessage(admissionHinglishHTML);
    } else {
      addBotMessage(admissionEnglishHTML);
    }
    return;
  }

  const message = topicMessages[topic] || 'Tell me about ' + topic;
  setActiveSidebarButton(topic);
  messageInput.value = message;
  chatForm.requestSubmit();
}

function setActiveSidebarButton(topic) {
  sidebarButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.topic === topic);
  });
}

sidebarButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const topic = button.dataset.topic;
    if (!topic) return;

  

    triggerTopic(topic);
  });
});

// Dark mode initialization
function initDarkMode() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    updateDarkModeToggle(true);
  }
}

function updateDarkModeToggle(isDark) {
  if (darkModeToggle) {
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
  }
}

function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  updateDarkModeToggle(isDarkMode);
}

if (darkModeToggle) {
  darkModeToggle.addEventListener('click', toggleDarkMode);
}

initDarkMode();

const specializationCards = [
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    fee: '₹2,25,000 (Total)',
    collaboration: 'TCS iON',
    description: 'Data Analysis, Visualization, Machine Learning basics, Business Intelligence',
    careers: 'Data Analyst, BI Analyst, Data Scientist'
  },
  {
    id: 'cloud-security',
    title: 'Cloud & Security',
    fee: '₹2,25,000 (Total)',
    collaboration: 'TCS iON',
    description: 'Cloud Computing, Cybersecurity, Network Security',
    careers: 'Cloud Engineer, Cybersecurity Analyst'
  },
  {
    id: 'software-engineering',
    title: 'Software Engineering',
    fee: '₹2,50,000 (Total)',
    collaboration: 'HCL Tech',
    description: 'Software Development, Testing, DevOps, Full Stack',
    careers: 'Software Developer, QA Engineer'
  },
  {
    id: 'data-engineering',
    title: 'Data Engineering',
    fee: '₹2,50,000 (Total)',
    collaboration: 'HCL Tech',
    description: 'Big Data, ETL, Data Pipelines, Database Management',
    careers: 'Data Engineer, ETL Developer'
  },
  {
    id: 'fintech-ai',
    title: 'FinTech & AI',
    fee: '₹2,75,000 (Total)',
    collaboration: 'Paytm',
    description: 'Financial Technology, AI in Banking, Blockchain',
    careers: 'Fintech Developer, AI Specialist'
  }
]; 
function showSpecializationDetail(cardId) {

    const card = specializationCards.find(c => c.id === cardId);

    if (!card) return;

    const detailHTML = `
        <strong>${card.title}</strong><br><br>

        💰 Fee: ${card.fee}<br>
        🤝 Collaboration: ${card.collaboration}<br>
        🚀 Careers: ${card.careers}<br><br>

        📘 ${card.description}
    `;

    appendMessage(detailHTML, 'bot');

    scrollToBottom();
}

const admissionEnglishHTML = `
<strong>Amity BCA Admission Process</strong> 🔥<br><br>

1. Fill the Online Application Form<br>
2. Upload Required Documents<br>
3. Eligibility Verification<br>
4. Pay Application Fee<br>
5. Admission Confirmation & Semester Fee Payment<br><br>

👉 <strong>Official Website:</strong><br><br>

<a href="https://amityonline.com/bachelor-of-computer-applications-online"
   class="admission-link"
   target="_blank"
   rel="noopener noreferrer">
   Apply Now - Amity BCA Admission
</a>

<br><br>

Would you like details about:
Fees, Scholarships, Eligibility or Placements?
`;

const admissionHinglishHTML = `
<strong>Amity BCA Admission Process</strong> 🔥<br><br>

Yeh raha complete step-by-step admission process:<br><br>

1. Online Application Form bharo<br>
2. Required Documents upload karo<br>
3. Eligibility Verification hoga<br>
4. Application Fee pay karo<br>
5. Admission Confirmation & Semester Fee Payment<br><br>

👉 <strong>Official Website:</strong><br><br>

<a href="https://amityonline.com/bachelor-of-computer-applications-online"
   class="admission-link"
   target="_blank"
   rel="noopener noreferrer">
   Apply Now - Amity BCA Admission
</a>

<br><br>

Kya aap Fees, Scholarships, Eligibility ya Placements ke baare me aur details chahte hain?
`;

function scrollToBottom() {

    setTimeout(() => {

        messages.scrollTo({
            top: messages.scrollHeight,
            behavior: 'smooth'
        });

    }, 1000);

}

function setLanguage(language) {
  selectedLanguage = language;
  appendMessage(
    language === 'english'
      ? 'Great 😊 Let us continue in English.'
      : 'Great 😊 Chaliye Hinglish me continue karte hain.',
    'bot'
  );
}

function appendMessage(text, role = 'bot') {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}-message`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = `
    <div class="message-body">${text}</div>
    <div class="message-meta">${formatTimestamp()}</div>
  `;

 wrapper.appendChild(bubble);
messages.appendChild(wrapper);

setTimeout(() => {
    scrollToBottom();
}, 50);
}

function addBotMessage(html) {
  appendMessage(html, 'bot');
}

function showWelcomeSequence() {
  addBotMessage('Hi Student! 👋 Welcome to the AI‑Powered Student Support System for BCA Admissions.');

  setTimeout(() => {
    addBotMessage(`
        <div>
            <p>Would you like to continue in:</p>

            <div class="language-buttons">
                <button onclick="setLanguage('english')" class="lang-btn">
                    English
                </button>

                <button onclick="setLanguage('hinglish')" class="lang-btn">
                    Hinglish
                </button>
            </div>
        </div>
    `);
  }, 3000);
}

function createDetailList(label, items) {
  const list = document.createElement('ul');
  list.className = 'detail-list';

  const heading = document.createElement('li');
  heading.textContent = `${label}: ${items.join(', ')}`;
  list.appendChild(heading);
  return list;
}

function renderSpecializationDetail(card) {
  const detailHTML = `
    <div class="specialization-detail-card">
      <h3>${card.title}</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <span>Fee</span>
          <strong class="fee-highlight">${card.fee}</strong>
        </div>
        <div class="detail-item">
          <span>Collaboration</span>
          <strong>${card.collaboration}</strong>
        </div>
        <div class="detail-item">
          <span>Careers</span>
          <strong>${card.careers}</strong>
        </div>
        <div class="detail-item detail-item-full">
          <span>Description</span>
          <strong>${card.description}</strong>
        </div>
      </div>
      <div class="message-meta detail-meta">${formatTimestamp()}</div>
    </div>
  `;

  const existingDetail = specializationPanel.querySelector('.specialization-detail-card');
  if (existingDetail) {
    existingDetail.remove();
  }

  specializationPanel.insertAdjacentHTML('beforeend', detailHTML);
  scrollToBottom();
}

function renderSpecializationCards(cards) {

    const wrapper = document.createElement('div');
    wrapper.className = 'message bot-message';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    const cardsHTML = cards.map(card => `
        <div class="spec-card">
            <button class="spec-btn" onclick="showSpecializationDetail('${card.id}')">
                ${card.title}
            </button>
        </div>
    `).join('');

    bubble.innerHTML = `
        <div class="specialization-grid">
            ${cardsHTML}
        </div>
    `;

    wrapper.appendChild(bubble);

    messages.appendChild(wrapper);

    scrollToBottom();
}

async function sendMessage(message) {
  sendButton.disabled = true;

  try {
    showTypingIndicator();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        language: selectedLanguage
      })
    });

    const data = await response.json();

    removeTypingIndicator();
    appendMessage(data.response || 'No response received.', 'bot');

    const specializationList = Array.isArray(data.specializations) ? data.specializations : [];
    const shouldRenderSpecializations = Boolean(data.show_specializations) || specializationList.length > 0;

    // Keep already-visible specialization details unless backend explicitly asks to render specializations.
    if (shouldRenderSpecializations) {
      renderSpecializationCards(specializationList.length ? specializationList : specializationCards);
    }
  } catch (error) {
    removeTypingIndicator();
    appendMessage('Connection error. Please try again.', 'bot');
  } finally {
    sendButton.disabled = false;
    if (messageInput) {
      messageInput.focus({ preventScroll: true });
    }
  }
}

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) {
    return;
  }

  messageInput.value = '';
  appendMessage(message, 'user');

  sendMessage(message);
});

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});


setTimeout(() => {
    scrollToBottom();
}, 300);

showWelcomeSequence();
