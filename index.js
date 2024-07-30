import { fetchQuizData } from './quiz.api.js';

let correctAnswers = 0;
let wrongAnswers = 0;
let totalTime = 300; // 5 minutes in seconds
let timerInterval;
let tabOpenTime = 0;
let tabTimer;
let quizDataGlobal;
let cameraStream;
let tabSwitchCount = 0; // To count how many times the user switches tabs

const startQuiz = async () => {
    try {
        console.log("Starting quiz..."); // Debug statement
        resetQuiz(); // Reset quiz data
        quizDataGlobal = await fetchQuizData();
        console.log("Quiz Data:", quizDataGlobal); // Log the fetched data

        if (!quizDataGlobal) {
            throw new Error('Quiz data not available');
        }

        // Inspect the structure of quizDataGlobal
        console.log("Quiz Data Structure:", JSON.stringify(quizDataGlobal, null, 2));
        
        // Ensure the correct data structure is present
        if (Array.isArray(quizDataGlobal)) {
            displayQuiz(quizDataGlobal);
        } else if (quizDataGlobal.Quiz && Array.isArray(quizDataGlobal.Quiz)) {
            displayQuiz(quizDataGlobal.Quiz);
        } else {
            throw new Error('Quiz data structure is incorrect');
        }

        startTimer(); // Start the timer when quiz starts
        disableCopyAndInspect(); // Disable copy and inspect
        accessCamera(); // Access camera if supported
        trackTabOpenTime(); // Start tracking tab open time
    } catch (error) {
        console.error("Error starting quiz:", error);
    }
};

const displayQuiz = (questions) => {
    const quizBox = document.getElementById('quiz-box');
    quizBox.innerHTML = ''; // Clear previous content
    console.log("Displaying quiz..."); // Debug statement

    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <h2>Question ${index + 1}</h2>
            <p>${question[`Q-${index + 1}`] || question.question}</p>
            <ul>
                <li><input type="radio" name="question${index}" value="A"> ${question[`OP-A`] || question.options.A}</li>
                <li><input type="radio" name="question${index}" value="B"> ${question[`OP-B`] || question.options.B}</li>
                <li><input type="radio" name="question${index}" value="C"> ${question[`OP-C`] || question.options.C}</li>
                <li><input type="radio" name="question${index}" value="D"> ${question[`OP-D`] || question.options.D}</li>
            </ul>
            <p hidden class="correct-answer">${question[`Answer`] || question.answer}</p>
        `;
        quizBox.appendChild(questionElement);
    });

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Quiz';
    submitButton.classList.add('submit-button');
    submitButton.onclick = submitQuiz;
    quizBox.appendChild(submitButton);
};

const submitQuiz = () => {
    const questions = document.querySelectorAll('.question');
    let allQuestionsAnswered = true;
    correctAnswers = 0; // Reset correct answers
    wrongAnswers = 0; // Reset wrong answers

    questions.forEach((question, index) => {
        const selectedOption = question.querySelector(`input[name="question${index}"]:checked`);
        const correctAnswer = question.querySelector('.correct-answer').textContent;

        if (selectedOption) {
            const answer = selectedOption.value;
            console.log(`Q${index + 1} - Selected: ${answer}, Correct: ${correctAnswer}`); // Debug statement
            if (answer === correctAnswer) {
                correctAnswers++;
            } else {
                wrongAnswers++;
            }
        } else {
            allQuestionsAnswered = false;
        }
    });

    if (!allQuestionsAnswered) {
        alert('Please answer all questions before submitting the quiz.');
        return;
    }

    clearInterval(timerInterval);
    clearInterval(tabTimer);
    stopCamera();
    saveHistory();
    displayResult();
};

const displayResult = () => {
    const resultBox = document.getElementById('result');
    resultBox.innerHTML = `
        <h2>Quiz Completed!</h2>
        <p>Correct Answers: ${correctAnswers}</p>
        <p>Wrong Answers: ${wrongAnswers}</p>
        <p>Tab open time: ${tabOpenTime} seconds</p>
        <p>Tab switches: ${tabSwitchCount}</p>
    `;
    document.getElementById('quiz-box').innerHTML = ''; // Clear quiz questions
    document.getElementById('timer').style.display = 'none'; // Hide the timer
    displayHistory(); // Display quiz history
};

const startTimer = () => {
    const timerElement = document.getElementById('time');
    totalTime = 300; // Reset total time
    timerElement.textContent = `05:00`; // Reset timer display
    console.log("Starting timer..."); // Debug statement
    timerInterval = setInterval(() => {
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        totalTime--;

        if (totalTime < 0) {
            clearInterval(timerInterval);
            timerElement.textContent = 'Time\'s up!';
            // Submit quiz automatically
            submitQuiz();
        }
    }, 1000); // Update every second
};

const disableCopyAndInspect = () => {
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.onkeydown = function(e) {
        if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 85 || e.keyCode === 117)) {
            return false;
        } else if (e.keyCode === 123) { // F12 key
            return false;
        } else {
            return true;
        }
    };
};

const accessCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const camera = document.getElementById('camera');
            camera.srcObject = stream;
            cameraStream = stream; // Store the stream to close later
            console.log("Camera accessed"); // Debug statement
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
        });
};

const stopCamera = () => {
    if (cameraStream) {
        let tracks = cameraStream.getTracks();
        tracks.forEach(track => track.stop());
        document.getElementById('camera').srcObject = null;
        console.log("Camera stopped"); // Debug statement
    }
};

const trackTabOpenTime = () => {
    tabOpenTime = 0; // Reset tab open time
    tabTimer = setInterval(() => {
        tabOpenTime++;
    }, 1000);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            tabTimer = setInterval(() => {
                tabOpenTime++;
            }, 1000);
            tabSwitchCount++;
        } else {
            clearInterval(tabTimer);
        }
    });
};

const resetQuiz = () => {
    correctAnswers = 0;
    wrongAnswers = 0;
    tabSwitchCount = 0;
    clearInterval(timerInterval);
    clearInterval(tabTimer);
    document.getElementById('quiz-box').innerHTML = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('timer').style.display = 'block';
    console.log("Quiz reset"); // Debug statement
};

const saveHistory = () => {
    const historyList = JSON.parse(localStorage.getItem('quizHistory')) || [];
    historyList.push({ correct: correctAnswers, wrong: wrongAnswers, tabTime: tabOpenTime, tabSwitches: tabSwitchCount });
    localStorage.setItem('quizHistory', JSON.stringify(historyList));
};

const displayHistory = () => {
    const historyList = JSON.parse(localStorage.getItem('quizHistory')) || [];
    const historyElement = document.getElementById('history-list');
    historyElement.innerHTML = ''; // Clear previous history

    historyList.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Quiz ${index + 1}: Correct - ${entry.correct}, Wrong - ${entry.wrong}, Tab Open Time - ${entry.tabTime}s, Tab Switches - ${entry.tabSwitches}`;
        historyElement.appendChild(listItem);
    });
};

document.getElementById('start').addEventListener('click', startQuiz);
