const APILINK = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=6c15403173438a88267ed4d2b436248d";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?api_key=6c15403173438a88267ed4d2b436248d&query=";

const main = document.getElementById("section");
const form = document.getElementById("form");
const Search = document.getElementById("query");

// Load default movies
returnMovies(APILINK);

function returnMovies(url) {
    fetch(url)
        .then(res => res.json())
        .then(function(data) {
            main.innerHTML = ""; // clear previous

            data.results.forEach(element => {

                const div_card = document.createElement("div");
                div_card.classList.add("card");

                const div_image = document.createElement("img");
                div_image.classList.add("thumbnail");
                div_image.src = IMGPATH + element.poster_path;

                const div_title = document.createElement("h3");
                div_title.innerHTML = element.title;

                div_card.appendChild(div_image);
                div_card.appendChild(div_title);

                main.appendChild(div_card);
            });
        });
}

// Search
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const searchTerm = Search.value;

    if (searchTerm) {
        returnMovies(SEARCHAPI + searchTerm);
        Search.value = "";
    }
});