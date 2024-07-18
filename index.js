import { fetchQuizData } from './quiz.api.js';

// Function to start the quiz
const startQuiz = async () => {
    try {
        const quizData = await fetchQuizData();
        if (!quizData) {
            throw new Error('Quiz data not available');
        }
        console.log("Quiz Data:", quizData);
        displayQuiz(quizData.Quiz);
        startTimer(); // Start the timer when quiz starts
        disableCopyAndInspect(); // Disable copy and inspect
        accessCamera(); // Access camera if supported
    } catch (error) {
        console.error("Error starting quiz:", error);
    }
};

// Function to display quiz questions
const displayQuiz = (questions) => {
    const quizBox = document.getElementById('quiz-box');
    quizBox.innerHTML = ''; // Clear previous content

    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <h2>Question ${index + 1}</h2>
            <p>${question['Q-1']}</p>
            <ul>
                <li>${question['OP-A']}</li>
                <li>${question['OP-B']}</li>
                <li>${question['OP-C']}</li>
                <li>${question['OP-D']}</li>
            </ul>
        `;
        quizBox.appendChild(questionElement);
    });
};

// Function to start the timer
const startTimer = () => {
    let totalTime = 300; // 5 minutes in seconds
    const timerElement = document.getElementById('time');
    const timerInterval = setInterval(() => {
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        totalTime--;

        if (totalTime < 0) {
            clearInterval(timerInterval);
            timerElement.textContent = 'Time\'s up!';
            // Handle time's up event (e.g., submit quiz automatically)
        }
    }, 1000); // Update every second
};

// Function to disable copy and inspect
const disableCopyAndInspect = () => {
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.onkeydown = function(e) {
        if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 85 || e.keyCode === 117)) {
            return false;
        } else {
            return true;
        }
    };
};

// Function to access camera
const accessCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const camera = document.getElementById('camera');
            camera.srcObject = stream;
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
        });
};

// Event listener for the start button
document.getElementById('start').addEventListener("click", startQuiz);
