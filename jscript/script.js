document.addEventListener("DOMContentLoaded", function () {
    const theaterSelect = document.getElementById('theaterSelect');
    const resultContainer = document.getElementById('resultContainer');
    const FINNKINO_API_URL = 'https://www.finnkino.fi/xml/Schedule/';

    fetchTheaters();

    // Event listener teatterin vaihtamiseen
    theaterSelect.addEventListener('change', function () {
        const selectedTheaterId = this.value;
        fetchMovies(selectedTheaterId);
    });

    // fetchTheaters funktio hakee teatterit finnkino APIsta
    function fetchTheaters() {
        const url = 'https://www.finnkino.fi/xml/TheatreAreas/';
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                const parser = new DOMParser();
                const xml = parser.parseFromString(xhr.responseText, "application/xml");
                const theaters = xml.getElementsByTagName('TheatreArea');

                // Näyttää kaikki mahdolliset teatterivalinnat
                for (let i = 0; i < theaters.length; i++) {
                    const theater = theaters[i];
                    const option = document.createElement('option');
                    option.value = theater.getElementsByTagName('ID')[0].textContent;
                    option.textContent = theater.getElementsByTagName('Name')[0].textContent;
                    theaterSelect.appendChild(option);
                }
            } else {
                console.error('Error fetching theaters:', xhr.statusText);
            }
        };

        xhr.onerror = function () {
            console.error('Network Error while fetching theaters');
        };

        xhr.send();
    }

    // fetchMovies funktio hakee valitun teatterin elokuvat
    function fetchMovies(theaterId) {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('fi-FI');

        const url = `${FINNKINO_API_URL}?area=${theaterId}&dt=${formattedDate}`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                const parser = new DOMParser();
                const xml = parser.parseFromString(xhr.responseText, "application/xml");
                const movies = xml.getElementsByTagName('Show');

                resultContainer.innerHTML = ''; // Poistaa aiemin valitun teatterin näytökset

                // Looppaa elokuvat ja hakee halutut tiedot
                for (let i = 0; i < movies.length; i++) {
                    const movie = movies[i];
                    const movieTitle = movie.getElementsByTagName('Title')[0].textContent;
                    const showtimes = movie.getElementsByTagName('dttmShowStart')[0].textContent;
                    const imageUrl = movie.getElementsByTagName('EventSmallImagePortrait')[0].textContent;

                    const movieCard = document.createElement('div');
                    movieCard.className = 'movie-card';

                    const movieInfo = document.createElement('div');
                    movieInfo.innerHTML = `<h3>${movieTitle}</h3><p>Showtime: ${new Date(showtimes).toLocaleString()}</p>`;
                    movieInfo.className = "movie-info";

                    const imgElement = document.createElement('img');
                    imgElement.src = imageUrl;
                    imgElement.alt = `${movieTitle} Poster`;

                    movieCard.appendChild(imgElement);
                    movieCard.appendChild(movieInfo);
                    resultContainer.appendChild(movieCard);
                }
            } else {
                console.error('Error fetching movies:', xhr.statusText);
            }
        };

        xhr.onerror = function () {
            console.error('Network Error');
        };

        xhr.send();
    }
});
