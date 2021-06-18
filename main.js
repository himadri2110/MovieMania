const API_KEY = 'e02bb07d813f5255844c6d19ab9395ab'; 

let baseURL = 'https://api.themoviedb.org/3/';
let imageURL = 'https://image.tmdb.org/t/p/w300';
let recommImageURL = 'https://image.tmdb.org/t/p/w185';

$(document).ready(() => {
    sessionStorage.setItem('type', 'all');
    sessionStorage.setItem('time', 'day');
    showMovieByTypeTime(sessionStorage.getItem('type'), sessionStorage.getItem('time'));

    sessionStorage.removeItem('category');

    showMovieByCategory('upcoming');

    $('#searchForm').on('submit', (e) => {
        let searchText = $('#searchInput').val();

        getMovies(searchText);

        $('#searchInput').val('');
        e.preventDefault();
    });

    const navShow = () => {
        let burger = document.querySelector('.burger');
        let nav = document.querySelector('.nav-links');

        burger.addEventListener('click', (e) => {
            e.preventDefault();

            nav.classList.toggle('active');
            burger.classList.toggle('toggle');
            $('body').toggleClass('no-overflow');
        });
    }

    navShow();
});

function getMovies(searchText, page=1) {
    let url = `${baseURL}search/movie?api_key=${API_KEY}&query=${searchText}&language=en-US&include_adult=false&page=${page}`;

    $.ajax({
        method: 'GET',
        url: url,

        success: function(data) {
            let output = '';
            let pageinate = '';

            if(data["results"].length > 0) {
                for(let i = 0; i < data["results"].length; i++) {

                    let posterPath = data["results"][i]["poster_path"];

                    output += `
                        <div class="movie">
                            <img class="image" src=${imageURL + String(posterPath)} alt="No image found." loading="lazy">

                            <div class="ratingFlex">
                                <h4 class="title">${data["results"][i]["title"]}</h4>
                                <div class="rating">${data["results"][i]["vote_average"]}</div>
                            </div>

                            <button class="detailsButton" onclick="selectedMovie('${data["results"][i]["id"]}')">More Details</button>
                        </div>
                    `;
                    $('.result').html(output);
                    $('footer').show();
                }
                pageinate = `
                    <button class="prevBtn" onclick="prevBtn()">Prev</button>
                    Page <span class="currentPage"></span> of <span class="totalPages"></span>
                    <button class="nextBtn" onclick="nextBtn()">Next</button>
                `;
                $('.pagination').html(pageinate);
            }

            else {
                output += `
                    <p class="empty">
                        No such movie found. Try searching other keywords.
                    </p>
                `;
                $('.result').html(output);
            }

            sessionStorage.setItem('searchText', searchText);
            getPagination(data["page"], data["total_pages"]);
        }
    }); 
}

function getPagination(currentPage, totalPages) {
    if(totalPages == 0) {
        $('.pagination').hide();
    }

    else{
        if(totalPages == 1) {
            $('.prevBtn').hide();
            $('.nextBtn').hide();
        }
        else if(currentPage == 1) {
            $('.prevBtn').hide();
        }
        else if(currentPage == totalPages) {
            $('.nextBtn').hide();
        }
        else {
            $('.prevBtn').show();
            $('.nextBtn').show();
        }
    }
    $('.currentPage').html(currentPage);
    $('.totalPages').html(totalPages);
}

function prevBtn() {
    $('html, body').animate({scrollTop: 0}, 'slow');
    let page = $('.currentPage').html();
    let prevPage;

    let searchText = sessionStorage.getItem('searchText');
    let category = sessionStorage.getItem('category');
    let genre = sessionStorage.getItem('genre');

    if(page != 1) {
        prevPage = parseInt(page) - 1;

        if(searchText) {
            getMovies(searchText, prevPage);
        }
        else if(category) {
            showMovieByCategory(category, prevPage);
        }
        else if(genre) {
            showMovieByGenre(genre, prevPage);
        }
    }
}

function nextBtn() {
    $('html, body').animate({scrollTop: 0}, 'slow');

    let page = $('.currentPage').html();
    let total = $('.totalPages').html();
    let nextPage;

    let searchText = sessionStorage.getItem('searchText');
    let category = sessionStorage.getItem('category');
    let genre = sessionStorage.getItem('genre');

    if(page != total) {
        nextPage = parseInt(page) + 1;

        if(searchText) {
            getMovies(searchText, nextPage);
        }
        else if(category) {
            showMovieByCategory(category, nextPage);
        }
        else if(genre) {
            showMovieByGenre(genre, nextPage);
        }
    }
}

function selectedMovie(movie_id) {
    sessionStorage.setItem('movieId', movie_id);
    window.location = './moviedetails.html';
}

function selectedTV(tv_id) {
    sessionStorage.setItem('TVId', tv_id);
    window.location = './tvdetails.html';
}

function getMovieDetails(){
    let movie_id = sessionStorage.getItem('movieId');
    
    let url = `${baseURL}movie/${movie_id}?api_key=${API_KEY}&language=en-US`;

    $.ajax({
        url: url,
        method: 'GET',

        success: function(details) {
            let showDetails = '';
            let postPath = details["poster_path"];
            let genres = [];
            let prod_country = [];
            let prod_company = [];
            let language = [];
            
            for(let j = 0 ; j < details["genres"].length ; j++) {
                genres.push(` ${details["genres"][j]["name"]}`);               
            }

            for(let j = 0 ; j < details["production_countries"].length ; j++) {
                prod_country.push(` ${details["production_countries"][j]["name"]}`);               
            }

            for(let j = 0 ; j < details["production_companies"].length ; j++) {
                prod_company.push(` ${details["production_companies"][j]["name"]}`);               
            }

            for(let j = 0 ; j < details["spoken_languages"].length ; j++) {
                language.push(` ${details["spoken_languages"][j]["english_name"]}`); 
            }

            showDetails += `
                <div class="movieTitle">
                    <p>${details["title"]}</p>

                    <button class="watchButton" 
                        onclick="addToWatch('${details["title"]}','${details["id"]}');"
                    >
                    Add to Watchlist</button>
                </div>

                <div class="movieWrapper">
                    <div class="movieFlex">
                        <div class="movieImage">
                            <img src="${imageURL + String(postPath)}" alt="No image found." loading="lazy">
                        </div>

                        <div class="movieText">
                            <div class="movieDetails">
                                <h2>Details: </h2>
                                <hr>
                                
                                <p><strong>Genre: </strong>${genres}</p>
                                <p><strong>Runtime: </strong>${details["runtime"]} min</p>
                                <p><strong>Language: </strong>${language}</p>
                                <p><strong>Release Date: </strong>${details["release_date"]}</p>
                                <p><strong>Average Rating: </strong>${details["vote_average"]}</p>
                                <p><strong>Production Country: </strong>${prod_country}</p>
                                <p><strong>Production Company: </strong>${prod_company}</p>
                            </div>

                            <div class="moviePeople">
                                <h2 class="castTitle"></h2>
                              
                                <p class="cast"></p>
                                <p class="writer"></p>
                                <p class="director"></p>
                                <p class="producer"></p>
                                <p class="music"></p>
                            </div>
                        </div>
                    </div>

                    <div class="moviePlot">
                        <h2>Plot:</h2>
                        <hr>

                        <p>${details["overview"]}</p>
                    </div>
                </div>
            `;

            $('.movieContainer').html(showDetails);
            getCastCrew(movie_id);

            $('title').html(details["title"]);
        }
    });
}

function getTVdetails() {
    let tv_id = sessionStorage.getItem('TVId');

    url = `${baseURL}tv/${tv_id}?api_key=${API_KEY}&language=en-US`;

    $.ajax({
        url: url,
        method: 'GET',

        success: function(tv) {
            let showDetails = '';
            let postPath = tv["poster_path"];
            let genres = [];
            let prod_country = [];
            let prod_company = [];
            let language = [];

            for(let j = 0 ; j < tv["genres"].length ; j++) {
                genres.push(` ${tv["genres"][j]["name"]}`);               
            }

            for(let j = 0 ; j < tv["production_countries"].length ; j++) {
                prod_country.push(` ${tv["production_countries"][j]["name"]}`);               
            }

            for(let j = 0 ; j < tv["production_companies"].length ; j++) {
                prod_company.push(` ${tv["production_companies"][j]["name"]}`);               
            }

            for(let j = 0 ; j < tv["spoken_languages"].length ; j++) {
                language.push(` ${tv["spoken_languages"][j]["english_name"]}`); 
            }

            showDetails += `
                <div class="movieTitle">
                    <p>${tv["name"]}</p>
                </div>

                <div class="movieWrapper">
                    <div class="movieFlex">
                        <div class="movieImage">
                            <img src="${imageURL + String(postPath)}" alt="No image found." loading="lazy">
                        </div>

                        <div class="movieText">
                            <div class="movieDetails">
                                <h2>Details: </h2>
                                <hr>
                                
                                <p><strong>Genre: </strong>${genres}</p>
                                <p><strong>Aired on: </strong>${tv["first_air_date"]}</p>
                                <p><strong>Language: </strong>${language}</p>
                                <p><strong>No. of Seasons: </strong>${tv["number_of_seasons"]}</p>
                                <p><strong>No. of Episodes: </strong>${tv["number_of_episodes"]}</p>
                                <p><strong>Average Rating: </strong>${tv["vote_average"]}</p>
                                <p><strong>Production Country: </strong>${prod_country}</p>
                                <p><strong>Production Company: </strong>${prod_company}</p>
                            </div>

                            <div class="moviePeople">
                                <h2 class="castTitle"></h2>
                              
                                <p class="cast"></p>
                                <p class="writer"></p>
                                <p class="director"></p>
                                <p class="producer"></p>
                                <p class="music"></p>
                            </div>
                        </div>
                    </div>

                    <div class="moviePlot">
                        <h2>Plot:</h2>
                        <hr>

                        <p>${tv["overview"]}</p>
                    </div>
                </div>
            `;

            $('.movieContainer').html(showDetails);
            getTVcast(tv_id);

            $('title').html(tv["name"]);
        }
    });
}

function addToWatch(movie_name, movie_id) {
    localStorage.setItem(movie_name, movie_id);

    watched = document.querySelector('.watchButton');
    watched.classList.add('watched');
    watched.innerText = 'Added to Watchlist';
}

function showWatchlist() {
    for(let name of Object.keys(localStorage)) {
        let movie_id = localStorage.getItem(name);

        let url = `${baseURL}movie/${movie_id}?api_key=${API_KEY}&language=en-US`;

        watch = '';
    
        $.ajax({
            url: url,
            method: 'GET',
    
            success: function(details) {
                if(details["id"] == movie_id) {
                    w_id = details["id"];
                    w_poster = details["poster_path"];
                    w_title = details["title"];
                    w_rating = details["vote_average"];

                    watch += `
                        <div class="movie">
                            <img class="image" src=${imageURL + String(w_poster)} alt="No image found." loading="lazy">

                            <div class="ratingFlex">
                                <h4 class="title">${w_title}</h4>
                                <div class="rating">${w_rating}</div>
                            </div>

                            <button class="detailsButton" onclick="removeFromWatched('${w_title}')">Remove</button>
                        </div>
                    `;
                    $('.watchlist').html(watch);
                }
            }   
        });
    }
}

function removeFromWatched(title) {
    localStorage.removeItem(title);
    window.location.reload();
}

function getCastCrew(movie_id) {
    let url = `${baseURL}movie/${movie_id}/credits?api_key=${API_KEY}&language=en-US`;

    $.ajax({
        url: url,
        method: 'GET',

        success: function(castNcrew) {

            if(castNcrew) {
                let cast = castNcrew["cast"];
                let crew = castNcrew["crew"];
                                
                let showCast = '';
                let castName = [];
    
                if(cast.length > 0) {
                    for(let i = 0; i < 6; i++) {
                        castName.push(` ${cast[i]["name"]}`);
                    }
                    showCast = `
                        <p><strong>Cast: </strong>${castName}</p>
                    `;
                    
                    $('.cast').html(showCast);
                    $('.castTitle').html('Cast & Crew: <hr class="castHR">');
                }
    
                if(crew.length > 0) {
                    let producer, writer, director, music = '';
    
                    for(let j=0; j<crew.length; j++) {
                        if(crew[j]["job"] == "Producer") {
                            producer = crew[j]["name"];
                        }
                        else if(crew[j]["job"] == "Writer" || crew[j]["job"] == "Story" || crew[j]["job"] == "Screenstory") {
                            writer = crew[j]["name"];
                        }
                        else if(crew[j]["job"] == "Director") {
                            director = crew[j]["name"];
                        }
                        else if(crew[j]["job"] == "Music Composer" || crew[j]["job"] == "Music" || crew[j]["job"] == "Original Music Composer") {
                            music = crew[j]["name"];
                        }
                    }
                
                    if(producer) {
                        showProd = `
                            <p><strong>Producer: </strong>${producer}</p>
                        `;
                        $('.producer').html(showProd);
                    }
        
                    if(director) {
                        showDir = `
                            <p><strong>Director: </strong>${director}</p>
                        `;
                        $('.director').html(showDir);
                    }
                    
                    if(writer) {
                        showWri = `
                            <p><strong>Writer: </strong>${writer}</p>
                        `;
                        $('.writer').html(showWri);
                    }
        
                    if(music) {
                        showMusic = `
                            <p><strong>Music Composer: </strong>${music}</p>
                        `;
                        $('.music').html(showMusic);
                    }

                    $('.castTitle').html('Cast & Crew: <hr class="castHR">');
                }
            }    
        }
    });
}

function getTVcast(tv_id) {
    let url = `${baseURL}tv/${tv_id}/credits?api_key=${API_KEY}&language=en-US`;

    $.ajax({
        url: url,
        method: 'GET',

        success: function(tv_cast) {
            if(tv_cast) {
                let cast = tv_cast["cast"];
                let crew = tv_cast["crew"];
                                
                let showCast = '';
                let castName = [];
    
                if(cast.length > 0) {
                    for(let i = 0; i < 6; i++) {
                        castName.push(` ${cast[i]["name"]}`);
                    }
                    showCast = `
                        <p><strong>Cast: </strong>${castName}</p>
                    `;
                    
                    $('.cast').html(showCast);
                    $('.castTitle').html('Cast & Crew: <hr class="castHR">');
                }
    
                if(crew.length > 0) {
                    let producer, writer, director, music = '';
    
                    for(let j=0; j<crew.length; j++) {
                        if(crew[j]["job"] == "Producer") {
                            producer = crew[j]["name"];
                        }
                        else if(crew[j]["job"] == "Writer" || crew[j]["job"] == "Story" || crew[j]["job"] == "Screenstory" || crew[j]["job"] == "Writing") {
                            writer = crew[j]["name"];
                        }
                        else if(crew[j]["job"] == "Director") {
                            director = crew[j]["name"];
                        }
                        else if(crew[j]["job"] == "Music Composer" || crew[j]["job"] == "Music" || crew[j]["job"] == "Original Music Composer") {
                            music = crew[j]["name"];
                        }
                    }
        
                    if(producer) {
                        showProd = `
                            <p><strong>Producer: </strong>${producer}</p>
                        `;
                        $('.producer').html(showProd);
                    }
        
                    if(director) {
                        showDir = `
                            <p><strong>Director: </strong>${director}</p>
                        `;
                        $('.director').html(showDir);
                    }
                    
                    if(writer) {
                        showWri = `
                            <p><strong>Writer: </strong>${writer}</p>
                        `;
                        $('.writer').html(showWri);
                    }
        
                    if(music) {
                        showMusic = `
                            <p><strong>Music Composer: </strong>${music}</p>
                        `;
                        $('.music').html(showMusic);
                    }

                    $('.castTitle').html('Cast & Crew: <hr class="castHR">');
                }
            }    
        }
    });
}

function getMovieRecommendations() {
    let movie_id = sessionStorage.getItem('movieId');

    let url = `${baseURL}movie/${movie_id}/recommendations?api_key=${API_KEY}&language=en-US&include_adult=false&page=1`;

    $.ajax({
        url: url,
        method: 'GET',

        success: function(recomm) {
            let showRecomm = '';

            if(recomm["results"].length > 0) {
                for(let i = 0; i < recomm["results"].length; i++) {
                    let posterPath = recomm["results"][i]["poster_path"];
                   
                    showRecomm += `
                        <div class="movie">
                            <img class="recommImage" src=${recommImageURL + String(posterPath)} alt="No image found." loading="lazy">
                            <h4 class="title">${recomm["results"][i]["title"]}</h4>
                            <button class="detailsButton" onclick="selectedMovie('${recomm["results"][i]["id"]}')">More Details</button>
                        </div>
                    `;
                    $('.movieRecommendations').html(showRecomm);
                }
            }

            else {
                showRecomm += 'No recommendations available.'
                $('.movieRecommendations').html(showRecomm);
            }
        }
    });
}

function getTVrecommendations() {
    let tv_id = sessionStorage.getItem('TVId');

    let url = `${baseURL}tv/${tv_id}/recommendations?api_key=${API_KEY}&language=en-US&include_adult=false&page=1`;

    $.ajax({
        url: url,
        method: 'GET',

        success: function(recomm) {
            let showRecomm = '';

            if(recomm["results"].length > 0) {
                for(let i = 0; i < recomm["results"].length; i++) {
                    let posterPath = recomm["results"][i]["poster_path"];
                   
                    showRecomm += `
                        <div class="movie">
                            <img class="recommImage" src=${recommImageURL + String(posterPath)} alt="No image found." loading="lazy">
                            <h4 class="title">${recomm["results"][i]["name"]}</h4>
                            <button class="detailsButton" onclick="selectedTV('${recomm["results"][i]["id"]}')">More Details</button>
                        </div>
                    `;
                    $('.movieRecommendations').html(showRecomm);
                }
            }

            else {
                showRecomm += 'No recommendations available.'
                $('.movieRecommendations').html(showRecomm);
            }
        }
    });
}

function getMovieReviews() {
    let movie_id = sessionStorage.getItem('movieId');

    let url = `${baseURL}movie/${movie_id}/reviews?api_key=${API_KEY}&language=en-US&page=1`;

    $.ajax({
        url: url,
        method: 'GET', 

        success: function(reviews) {
            let showReview = '';

            if(reviews["results"].length > 0) {
                for(let k = 0; k < reviews["results"].length; k++) {
                    let name = reviews["results"][k]["author"];
                    let content = reviews["results"][k]["content"];
                    let date = reviews["results"][k]["created_at"];

                    date = date.split('T');

                    showReview += `
                        <div class="reviewDetails">
                            <div class="reviewFlex">
                                <div class="author">${name}</div>
                                <div class="date">${date[0]}</div>
                            </div>

                            <div class="content">"${content}"</div>
                            
                            <hr class="contentHR">
                        </div>
                    `;
                }
                $('.movieReviews').html(showReview);
            }

            else {
                showReview += '<center>No reviews available.</center>';
                $('.movieReviews').html(showReview);
            }
        }
    });
}

function getTVreviews() {
    let tv_id = sessionStorage.getItem('TVId');

    let url = `${baseURL}tv/${tv_id}/reviews?api_key=${API_KEY}&language=en-US&page=1`;

    $.ajax({
        url: url,
        method: 'GET', 

        success: function(reviews) {
            let showReview = '';

            if(reviews["results"].length > 0) {
                for(let k = 0; k < reviews["results"].length; k++) {
                    let name = reviews["results"][k]["author"];
                    let content = reviews["results"][k]["content"];
                    let date = reviews["results"][k]["created_at"];

                    date = date.split('T');

                    showReview += `
                        <div class="reviewDetails">
                            <div class="reviewFlex">
                                <div class="author">${name}</div>
                                <div class="date">${date[0]}</div>
                            </div>

                            <div class="content">"${content}"</div>
                            
                            <hr class="contentHR">
                        </div>
                    `;
                }
                $('.movieReviews').html(showReview);
            }

            else {
                showReview += '<center>No reviews available.</center>';
                $('.movieReviews').html(showReview);
            }
        }
    });
}

function showHideRecomm() {
    //Show Recommendations first
    $('.reviews').insertAfter('.recommendations');

    recomm = document.querySelector('.recommendations');
    recomm.classList.toggle('hideRecomm');

    recommText = document.querySelector('.recommButton');
    if(recommText.innerHTML === 'Show Recommendations') {
        recommText.innerHTML = 'Hide Recommendations';
    } else {
        recommText.innerHTML = 'Show Recommendations';
    }
}

function showHideReview() {
    // Show Reviews first
    $('.recommendations').insertAfter('.reviews');

    review = document.querySelector('.reviews');
    review.classList.toggle('hideReview');

    reviewText = document.querySelector('.reviewButton');
    if(reviewText.innerHTML === 'Show Reviews') {
        reviewText.innerHTML = 'Hide Reviews';
    } else {
        reviewText.innerHTML = 'Show Reviews';
    }
}

function movieGenre(selectedGenre) {
    let url = `${baseURL}genre/movie/list?api_key=${API_KEY}&language=en-US`;
    
    $.ajax({
        url: url,
        method: 'GET',

        success: function(genres) {
           
            for(let i in genres.genres) {
                if(genres.genres[i]["name"] === selectedGenre.value) {
                    document.querySelector('.changeTitle').innerHTML = genres.genres[i]["name"];
                    genre_id = genres.genres[i]["id"];
                    showMovieByGenre(genre_id);
                    break;
                }
            }
        }
    });
}

function showMovieByGenre(genre_id, page=1) {
    let url = `${baseURL}discover/movie?api_key=${API_KEY}&with_genres=${genre_id}&language=en-US&sort_by=popularity.desc&include_adult=false&page=${page}`;

    $.ajax({
        url: url,
        method: 'GET',

        success: function(discover) {
            let output = '';

            if(discover["results"].length > 0) {
                for(let i = 0; i < discover["results"].length; i++) {
                    let posterPath = discover["results"][i]["poster_path"];
                   
                    output += `
                        <div class="movie">
                            <img class="image" src=${imageURL+ String(posterPath)} alt="No image found." loading="lazy">

                            <div class="ratingFlex">
                                <h4 class="title">${discover["results"][i]["title"]}</h4>
                                <div class="rating">${discover["results"][i]["vote_average"]}</div>
                            </div>

                            <button class="detailsButton" onclick="selectedMovie('${discover["results"][i]["id"]}')">More Details</button>
                        </div>
                    `;
                    $('.trending').html(output);
                }
            }

            else {
                output += `
                    <p class="empty">
                        No movie found.
                    </p>
                `;
                $('.trending').html(output);
            }

            $('.pagination').show();

            sessionStorage.setItem('genre', genre_id);
            sessionStorage.removeItem('category');
            getPagination(discover["page"], discover["total_pages"]);
        }
    });
}   

function movieCategory(selectedCategory) {
    let appendToURL = '';

    switch(selectedCategory.value) {
        case 'now_playing': 
            appendToURL = 'now_playing'; 
            break;
        case 'popular': 
            appendToURL = 'popular'; 
            break;
        case 'top_rated': 
            appendToURL = 'top_rated'; 
            break;
        case 'upcoming': 
            appendToURL = 'upcoming'; 
            break;
    }

    showMovieByCategory(appendToURL);
    document.querySelector('.changeTitle').innerHTML = selectedCategory.options[selectedCategory.selectedIndex].text;
}

function showMovieByCategory(category, page=1) {
    let url = `${baseURL}movie/${category}?api_key=${API_KEY}&language=en-US&include_adult=false&page=${page}`;

    $.ajax({
        url: url,
        method: 'GET',

        success: function(cat) {
            let output = '';
 
            if(cat["results"].length > 0) {
                for(let i = 0; i < cat["results"].length; i++) {

                    let posterPath = cat["results"][i]["poster_path"];
                   
                    output += `
                        <div class="movie">
                            <img class="image" src=${imageURL + String(posterPath)} alt="No image found." loading="lazy">

                            <div class="ratingFlex">
                                <h4 class="title">${cat["results"][i]["title"]}</h4>
                                <div class="rating">${cat["results"][i]["vote_average"]}</div>
                            </div>

                            <button class="detailsButton" onclick="selectedMovie('${cat["results"][i]["id"]}')">More Details</button>
                        </div>
                    `;
                    $('.trending').html(output);
                }
            }

            else {
                output += `
                <p class="empty">
                    No movie found.
                </p>`;
                $('.trending').html(output);
            }
            $('.pagination').show();

            sessionStorage.setItem('category', category);
            sessionStorage.removeItem('genre');
            getPagination(cat["page"], cat["total_pages"]);
        }
    });
}

function movieType(selectedType) {
    let time = sessionStorage.getItem('time');
    let appendType = '';

    switch(selectedType.value) {
        case 'all': 
            appendType = 'all'; 
            break;
        case 'movie': 
            appendType = 'movie'; 
            break;
        case 'tv': 
            appendType = 'tv'; 
            break;
        case 'person': 
            appendType = 'person'; 
            break;
        default: 
            appendType = 'all';
            break;
    }
    sessionStorage.setItem('type', appendType);
    showMovieByTypeTime(appendType, time);
}

function movieTime(selectedTime) {
    let type = sessionStorage.getItem('type');
    let appendTime = '';
    
    switch(selectedTime.value) {
        case 'day': 
            appendTime = 'day'; 
            break;
        case 'week': 
            appendTime = 'week'; 
            break;
        default: 
            appendTime = 'day';
            break;
    }
    sessionStorage.setItem('time', appendTime);
    showMovieByTypeTime(type, appendTime);
}

function showMovieByTypeTime(appendType, appendTime, page=1) {
    let url = `${baseURL}trending/${appendType}/${appendTime}?api_key=${API_KEY}&include_adult=false&page=${page}`;

    $.ajax({
        url: url,
        method: 'GET',

        success: function(trend) {
            let output = ''; 

            for(let i = 0; i < trend["results"].length; i++) {

                if(trend["results"][i]['media_type'] == 'movie') {
                    let title = trend["results"][i]["title"];
                    let posterPath = trend["results"][i]["poster_path"];

                    output += `
                        <div class="movie">
                            <img class="image" src=${imageURL + String(posterPath)} alt="No image found." loading="lazy">

                            <div class="ratingFlex">
                                <h4 class="title">${title}</h4>
                                <div class="rating">${trend["results"][i]["vote_average"]}</div>
                            </div>

                            <button class="detailsButton" onclick="selectedMovie('${trend["results"][i]["id"]}')">More Details</button>
                        </div>
                    `;
                }

                else if(trend["results"][i]['media_type'] == 'tv') {
                    let name = trend["results"][i]["name"];
                    let posterPath = trend["results"][i]["poster_path"];

                    output += `
                        <div class="movie">
                            <img class="image" src=${imageURL + String(posterPath)} alt="No image found." loading="lazy">

                            <div class="ratingFlex">
                                <h4 class="title">${name}</h4>
                                <div class="rating">${trend["results"][i]["vote_average"]}</div>
                            </div>

                            <button class="detailsButton" onclick="selectedTV('${trend["results"][i]["id"]}')">More Details</button>
                        </div>
                    `;
                }

                else if(trend["results"][i]['media_type'] == 'person') {
                    let name = trend["results"][i]["name"];
                    let profilePath = trend["results"][i]["profile_path"];

                    output += `
                        <div class="movie">
                            <img class="image" src=${imageURL + String(profilePath)} alt="No image found." loading="lazy">

                            <div class="ratingFlex">
                                <h4 class="title">${name}</h4>
                            </div>
                        </div>
                    `;
                }
                $('.showTrending').html(output);
            }
        }
    });
}

window.load = function() {
    sessionStorage.removeItem('category');

    showMovieByCategory('upcoming');
}