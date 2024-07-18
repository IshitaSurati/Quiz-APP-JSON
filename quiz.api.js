// Exporting a function to fetch quiz data from JSON server
export const fetchQuizData = () => {
    return fetch('http://localhost:2003/Quiz')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Error fetching quiz data:', error);
            return null; // Return null or handle error case appropriately
        });
};
