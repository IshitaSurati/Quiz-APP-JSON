export const fetchQuizData = () => {
    return fetch('http://localhost:3000/Quiz')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => data)
        .catch(error => {
            console.error('Error fetching quiz data:', error);
            return null;
        });
};
