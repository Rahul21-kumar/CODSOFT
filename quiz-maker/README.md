# Online Quiz Maker (Basic Project)

A simple, responsive Online Quiz Maker built with plain HTML, CSS, and JavaScript.
Data is stored in the browser's localStorage (no backend/server needed).

## Features
- **Home Page**: Welcome message with quick links to create or take a quiz.
- **Quiz Creation**: Form to add a quiz title and multiple questions, each with
  4 multiple-choice options and a correct answer selector.
- **Quiz Listing**: Browse all quizzes created so far.
- **Quiz Taking**: Answer one question at a time with Next/Previous navigation.
- **Quiz Results**: See your final score and a full review of correct vs. your answers.
- **User Authentication**: Basic register/login (stored locally) for a personalized name tag.
- **Mobile Responsive**: Works well on phones, tablets, and desktops.

## How to Run
1. Unzip the folder.
2. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox).
   No installation or server required.

## File Structure
```
quiz-maker/
├── index.html   -> Page structure
├── style.css    -> Styling (responsive layout)
├── script.js    -> All app logic (auth, quiz CRUD, taking quiz, scoring)
└── README.md    -> This file
```

## Notes
- This is a basic/demo-level project using localStorage, so quizzes and users
  are stored only in the browser you use (not shared across devices).
- For a production version, you'd replace localStorage with a real backend
  (e.g., Node.js + Express + MongoDB, or Firebase) and add proper password hashing.
