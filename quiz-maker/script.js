// ---------- Storage Helpers ----------
const DB = {
  getUsers() { return JSON.parse(localStorage.getItem('qm_users') || '[]'); },
  saveUsers(u) { localStorage.setItem('qm_users', JSON.stringify(u)); },
  getQuizzes() { return JSON.parse(localStorage.getItem('qm_quizzes') || '[]'); },
  saveQuizzes(q) { localStorage.setItem('qm_quizzes', JSON.stringify(q)); },
  getCurrentUser() { return JSON.parse(localStorage.getItem('qm_current_user') || 'null'); },
  setCurrentUser(u) { localStorage.setItem('qm_current_user', JSON.stringify(u)); }
};

let state = {
  currentQuiz: null,
  currentQIndex: 0,
  answers: [],
};

const app = document.getElementById('app');
const navbar = document.getElementById('navbar');

// ---------- Navigation ----------
function renderNav() {
  const user = DB.getCurrentUser();
  navbar.innerHTML = '';
  const homeBtn = navBtn('Home', renderHome);
  const listBtn = navBtn('Browse Quizzes', renderQuizList);
  const createBtn = navBtn('Create Quiz', renderCreateQuiz);
  navbar.append(homeBtn, listBtn, createBtn);

  if (user) {
    const logoutBtn = navBtn(`Logout (${user.username})`, () => {
      DB.setCurrentUser(null);
      renderNav();
      renderHome();
    });
    navbar.append(logoutBtn);
  } else {
    const loginBtn = navBtn('Login / Register', renderAuth);
    navbar.append(loginBtn);
  }
}

function navBtn(label, onClick) {
  const b = document.createElement('button');
  b.textContent = label;
  b.onclick = onClick;
  return b;
}

// ---------- Home ----------
function renderHome() {
  const user = DB.getCurrentUser();
  app.innerHTML = `
    <h2>Welcome${user ? ', ' + user.username : ''}! 👋</h2>
    <p>This is a simple Online Quiz Maker. You can create your own quizzes
    with multiple-choice questions, or take quizzes made by others and get
    instant feedback on your score.</p>
    <div>
      <button class="primary" id="goCreate">Create a Quiz</button>
      <button class="secondary" id="goTake">Take a Quiz</button>
    </div>
  `;
  document.getElementById('goCreate').onclick = renderCreateQuiz;
  document.getElementById('goTake').onclick = renderQuizList;
}

// ---------- Auth ----------
function renderAuth() {
  app.innerHTML = `
    <h2>Login / Register</h2>
    <label>Username</label>
    <input type="text" id="username" placeholder="Enter username">
    <label>Password</label>
    <input type="password" id="password" placeholder="Enter password">
    <button class="primary" id="loginBtn">Login</button>
    <button class="secondary" id="registerBtn">Register</button>
    <p id="authMsg" style="color:red;"></p>
  `;

  document.getElementById('registerBtn').onclick = () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) return showAuthMsg('Please fill all fields.');
    const users = DB.getUsers();
    if (users.find(u => u.username === username)) return showAuthMsg('Username already exists.');
    users.push({ username, password });
    DB.saveUsers(users);
    DB.setCurrentUser({ username });
    renderNav();
    renderHome();
  };

  document.getElementById('loginBtn').onclick = () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const users = DB.getUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) return showAuthMsg('Invalid username or password.');
    DB.setCurrentUser({ username });
    renderNav();
    renderHome();
  };
}

function showAuthMsg(msg) {
  document.getElementById('authMsg').textContent = msg;
}

// ---------- Create Quiz ----------
let questionCount = 0;

function renderCreateQuiz() {
  questionCount = 0;
  app.innerHTML = `
    <h2>Create a New Quiz</h2>
    <label>Quiz Title</label>
    <input type="text" id="quizTitle" placeholder="e.g. General Knowledge">
    <div id="questionsContainer"></div>
    <button class="secondary" id="addQuestion">+ Add Question</button>
    <br><br>
    <button class="primary" id="saveQuiz">Save Quiz</button>
    <p id="createMsg" style="color:red;"></p>
  `;
  document.getElementById('addQuestion').onclick = addQuestionBlock;
  document.getElementById('saveQuiz').onclick = saveQuiz;
  addQuestionBlock();
}

function addQuestionBlock() {
  questionCount++;
  const id = questionCount;
  const container = document.getElementById('questionsContainer');
  const block = document.createElement('div');
  block.className = 'question-block';
  block.dataset.id = id;
  block.innerHTML = `
    <button class="remove-q">✕</button>
    <label>Question ${id}</label>
    <input type="text" class="q-text" placeholder="Enter question text">
    <div class="option-row">
      <input type="radio" name="correct-${id}" value="0" checked>
      <input type="text" class="q-option" placeholder="Option A">
    </div>
    <div class="option-row">
      <input type="radio" name="correct-${id}" value="1">
      <input type="text" class="q-option" placeholder="Option B">
    </div>
    <div class="option-row">
      <input type="radio" name="correct-${id}" value="2">
      <input type="text" class="q-option" placeholder="Option C">
    </div>
    <div class="option-row">
      <input type="radio" name="correct-${id}" value="3">
      <input type="text" class="q-option" placeholder="Option D">
    </div>
    <small>Select the radio button next to the correct answer.</small>
  `;
  block.querySelector('.remove-q').onclick = () => block.remove();
  container.appendChild(block);
}

function saveQuiz() {
  const title = document.getElementById('quizTitle').value.trim();
  if (!title) return showCreateMsg('Please enter a quiz title.');

  const blocks = document.querySelectorAll('.question-block');
  if (blocks.length === 0) return showCreateMsg('Add at least one question.');

  const questions = [];
  for (const block of blocks) {
    const qText = block.querySelector('.q-text').value.trim();
    const options = Array.from(block.querySelectorAll('.q-option')).map(i => i.value.trim());
    const id = block.dataset.id;
    const correctRadio = block.querySelector(`input[name="correct-${id}"]:checked`);
    const correctIndex = parseInt(correctRadio.value, 10);

    if (!qText || options.some(o => !o)) {
      return showCreateMsg('Please fill in all questions and options.');
    }
    questions.push({ text: qText, options, correctIndex });
  }

  const user = DB.getCurrentUser();
  const quizzes = DB.getQuizzes();
  quizzes.push({
    id: Date.now().toString(),
    title,
    author: user ? user.username : 'Guest',
    questions
  });
  DB.saveQuizzes(quizzes);
  renderQuizList();
}

function showCreateMsg(msg) {
  document.getElementById('createMsg').textContent = msg;
}

// ---------- Quiz Listing ----------
function renderQuizList() {
  const quizzes = DB.getQuizzes();
  app.innerHTML = `<h2>Available Quizzes</h2>`;
  if (quizzes.length === 0) {
    app.innerHTML += `<p class="empty-msg">No quizzes yet. Be the first to create one!</p>`;
    return;
  }
  quizzes.forEach(q => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `
      <div>
        <h3>${escapeHtml(q.title)}</h3>
        <p>${q.questions.length} questions • by ${escapeHtml(q.author)}</p>
      </div>
      <button class="primary">Take Quiz</button>
    `;
    card.querySelector('button').onclick = () => startQuiz(q.id);
    app.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Taking Quiz ----------
function startQuiz(quizId) {
  const quiz = DB.getQuizzes().find(q => q.id === quizId);
  if (!quiz) return renderQuizList();
  state.currentQuiz = quiz;
  state.currentQIndex = 0;
  state.answers = new Array(quiz.questions.length).fill(null);
  renderQuestion();
}

function renderQuestion() {
  const quiz = state.currentQuiz;
  const idx = state.currentQIndex;
  const q = quiz.questions[idx];

  app.innerHTML = `
    <h2>${escapeHtml(quiz.title)}</h2>
    <div class="progress">Question ${idx + 1} of ${quiz.questions.length}</div>
    <h3>${escapeHtml(q.text)}</h3>
    <div id="optionsContainer"></div>
    <br>
    <button class="secondary" id="prevBtn" ${idx === 0 ? 'disabled' : ''}>Previous</button>
    <button class="primary" id="nextBtn">${idx === quiz.questions.length - 1 ? 'Finish' : 'Next'}</button>
  `;

  const optionsContainer = document.getElementById('optionsContainer');
  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'option-choice';
    if (state.answers[idx] === i) div.classList.add('selected');
    div.textContent = opt;
    div.onclick = () => {
      state.answers[idx] = i;
      document.querySelectorAll('.option-choice').forEach(o => o.classList.remove('selected'));
      div.classList.add('selected');
    };
    optionsContainer.appendChild(div);
  });

  document.getElementById('prevBtn').onclick = () => {
    state.currentQIndex--;
    renderQuestion();
  };
  document.getElementById('nextBtn').onclick = () => {
    if (idx === quiz.questions.length - 1) {
      renderResults();
    } else {
      state.currentQIndex++;
      renderQuestion();
    }
  };
}

// ---------- Results ----------
function renderResults() {
  const quiz = state.currentQuiz;
  let score = 0;
  const reviewHtml = quiz.questions.map((q, i) => {
    const userAns = state.answers[i];
    const isCorrect = userAns === q.correctIndex;
    if (isCorrect) score++;
    const optsHtml = q.options.map((opt, j) => {
      let cls = 'option-choice';
      if (j === q.correctIndex) cls += ' correct';
      else if (j === userAns) cls += ' wrong';
      return `<div class="${cls}">${escapeHtml(opt)}</div>`;
    }).join('');
    return `
      <div class="question-block">
        <strong>Q${i + 1}: ${escapeHtml(q.text)}</strong>
        ${optsHtml}
      </div>
    `;
  }).join('');

  app.innerHTML = `
    <div class="score-box">
      <p>Your Score</p>
      <h2>${score} / ${quiz.questions.length}</h2>
    </div>
    <h3>Review Answers</h3>
    ${reviewHtml}
    <button class="primary" id="backBtn">Back to Quizzes</button>
  `;
  document.getElementById('backBtn').onclick = renderQuizList;
}

// ---------- Init ----------
renderNav();
renderHome();
