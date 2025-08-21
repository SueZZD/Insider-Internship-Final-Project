document.addEventListener('DOMContentLoaded', function() {
    const API_KEY = '348088421ad3fb3a9d6e56bb6a9a8f80';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';
    
    let currentPage = 1;
    let totalPages = 1;
    let currentType = 'movie';
    let currentCategory = 'popular';
    let searchQuery = '';
    let timeoutId = null;
    
    // State management for favorites
    let favorites = JSON.parse(localStorage.getItem('favorites')) || {
        movie: [],
        tv: []
    };
    
    // DOM Elements
    const movieGrid = document.getElementById('movie-grid');
    const pagination = document.getElementById('pagination');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const contentTitle = document.getElementById('content-title');
    const tabs = document.querySelectorAll('.tab');
    const navLinks = document.querySelectorAll('.nav-links a[data-type]');
    const dropdownLinks = document.querySelectorAll('.dropdown-content a');
    const modal = document.getElementById('movie-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');
    
    // Initialize the app
    init();
    
    function init() {
        fetchContent(currentType, currentCategory, currentPage);
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Search functionality
        searchInput.addEventListener('input', handleSearchInput);
        searchButton.addEventListener('click', performSearch);
        
        // Tab navigation
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentCategory = tab.dataset.category;
                updateContentTitle();
                fetchContent(currentType, currentCategory, 1);
            });
        });
        
        // Main navigation (Movies/TV Shows)
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                currentType = link.dataset.type;
                updateContentTitle();
                fetchContent(currentType, currentCategory, 1);
            });
        });
        
        // Dropdown navigation
        dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                currentType = link.dataset.type;
                currentCategory = link.dataset.category;
                updateContentTitle();
                
                // Update active nav link
                navLinks.forEach(l => {
                    if (l.dataset.type === currentType) {
                        l.classList.add('active');
                    } else {
                        l.classList.remove('active');
                    }
                });
                
                // Update active tab if exists
                const activeTab = document.querySelector(`.tab[data-category="${currentCategory}"]`);
                if (activeTab) {
                    tabs.forEach(t => t.classList.remove('active'));
                    activeTab.classList.add('active');
                }
                
                fetchContent(currentType, currentCategory, 1);
            });
        });
        
        // Modal close button
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    function handleSearchInput(e) {
        searchQuery = e.target.value.trim();
        
        // Clear previous timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // Only search after 3 characters and throttle to 500ms
        if (searchQuery.length >= 3) {
            timeoutId = setTimeout(() => {
                performSearch();
            }, 500);
        } else if (searchQuery.length === 0) {
            // If search is cleared, return to popular content
            fetchContent(currentType, currentCategory, 1);
        }
    }
    
    function performSearch() {
        if (searchQuery.length === 0) return;
        
        fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                displayResults(data.results);
                updatePagination(data.total_pages);
                contentTitle.textContent = `Search Results for "${searchQuery}"`;
            })
            .catch(error => {
                console.error('Error searching:', error);
                movieGrid.innerHTML = '<p>Error loading search results. Please try again.</p>';
            });
    }
    
    function fetchContent(type, category, page) {
        let url;
        
        if (searchQuery.length >= 3) {
            url = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${page}`;
        } else {
            url = `${BASE_URL}/${type}/${category}?api_key=${API_KEY}&page=${page}`;
        }
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (searchQuery.length >= 3) {
                    displayResults(data.results);
                } else {
                    displayContent(data.results);
                }
                updatePagination(data.total_pages);
                currentPage = page;
            })
            .catch(error => {
                console.error('Error fetching content:', error);
                movieGrid.innerHTML = '<p>Error loading content. Please try again.</p>';
            });
    }
    
    function displayContent(items) {
        movieGrid.innerHTML = '';
        
        if (items.length === 0) {
            movieGrid.innerHTML = '<p>No content found.</p>';
            return;
        }
        
        items.forEach(item => {
            const isMovie = item.media_type === 'movie' || currentType === 'movie';
            const title = isMovie ? item.title : item.name;
            const date = isMovie ? item.release_date : item.first_air_date;
            const posterPath = item.poster_path ? IMG_BASE_URL + item.poster_path : 'https://via.placeholder.com/500x750?text=No+Poster';
            const rating = item.vote_average ? Math.round(item.vote_average * 10) : 0;
            const id = item.id;
            const type = isMovie ? 'movie' : 'tv';
            
            const isFavorited = favorites[type].includes(id);
            
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${posterPath}" alt="${title}" class="movie-poster" data-id="${id}" data-type="${type}">
                <div class="movie-info">
                    <div class="movie-title">${title}</div>
                    <div class="movie-date">${date ? new Date(date).toLocaleDateString() : 'N/A'}</div>
                    <div class="movie-rating">
                        <div class="rating-circle" style="--rating: ${rating}%">${rating}<small>%</small></div>
                        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${id}" data-type="${type}">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </div>
            `;
            
            movieGrid.appendChild(movieCard);
        });
        
        // Add event listeners to posters and favorite buttons
        document.querySelectorAll('.movie-poster').forEach(poster => {
            poster.addEventListener('click', () => {
                showMovieDetails(poster.dataset.id, poster.dataset.type);
            });
        });
        
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(btn.dataset.id, btn.dataset.type, btn);
            });
        });
    }
    
    function displayResults(items) {
        movieGrid.innerHTML = '';
        
        if (items.length === 0) {
            movieGrid.innerHTML = '<p>No results found.</p>';
            return;
        }
        
        items.forEach(item => {
            const isMovie = item.media_type === 'movie';
            const title = isMovie ? item.title : item.name;
            const date = isMovie ? item.release_date : item.first_air_date;
            const posterPath = item.poster_path ? IMG_BASE_URL + item.poster_path : 'https://via.placeholder.com/500x750?text=No+Poster';
            const rating = item.vote_average ? Math.round(item.vote_average * 10) : 0;
            const id = item.id;
            const type = item.media_type;
            
            // Skip person results
            if (type === 'person') return;
            
            const isFavorited = favorites[type].includes(id);
            
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${posterPath}" alt="${title}" class="movie-poster" data-id="${id}" data-type="${type}">
                <div class="movie-info">
                    <div class="movie-title">${title}</div>
                    <div class="movie-date">${date ? new Date(date).toLocaleDateString() : 'N/A'}</div>
                    <div class="movie-rating">
                        <div class="rating-circle" style="--rating: ${rating}%">${rating}<small>%</small></div>
                        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${id}" data-type="${type}">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </div>
            `;
            
            movieGrid.appendChild(movieCard);
        });
        
        // Add event listeners to posters and favorite buttons
        document.querySelectorAll('.movie-poster').forEach(poster => {
            poster.addEventListener('click', () => {
                showMovieDetails(poster.dataset.id, poster.dataset.type);
            });
        });
        
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(btn.dataset.id, btn.dataset.type, btn);
            });
        });
    }
    
    function updatePagination(total) {
        totalPages = total > 500 ? 500 : total; // TMDB API limits to 500 pages
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.textContent = '«';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                fetchContent(currentType, currentCategory, currentPage - 1);
            }
        });
        pagination.appendChild(prevButton);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            const firstButton = document.createElement('button');
            firstButton.textContent = '1';
            firstButton.addEventListener('click', () => {
                fetchContent(currentType, currentCategory, 1);
            });
            pagination.appendChild(firstButton);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                fetchContent(currentType, currentCategory, i);
            });
            pagination.appendChild(pageButton);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
            
            const lastButton = document.createElement('button');
            lastButton.textContent = totalPages;
            lastButton.addEventListener('click', () => {
                fetchContent(currentType, currentCategory, totalPages);
            });
            pagination.appendChild(lastButton);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.textContent = '»';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                fetchContent(currentType, currentCategory, currentPage + 1);
            }
        });
        pagination.appendChild(nextButton);
    }
    
    function updateContentTitle() {
        const categoryMap = {
            'popular': 'Popular',
            'top_rated': 'Top Rated',
            'upcoming': 'Upcoming',
            'now_playing': 'Now Playing',
            'on_the_air': 'On TV'
        };
        
        const typeMap = {
            'movie': 'Movies',
            'tv': 'TV Shows'
        };
        
        contentTitle.textContent = `${categoryMap[currentCategory] || 'Popular'} ${typeMap[currentType] || 'Movies'}`;
    }
    
    function toggleFavorite(id, type, button) {
        id = parseInt(id);
        const index = favorites[type].indexOf(id);
        
        if (index === -1) {
            // Add to favorites
            favorites[type].push(id);
            button.classList.add('favorited');
        } else {
            // Remove from favorites
            favorites[type].splice(index, 1);
            button.classList.remove('favorited');
        }
        
        // Save to localStorage
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    function showMovieDetails(id, type) {
        fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits`)
            .then(response => response.json())
            .then(data => {
                const isMovie = type === 'movie';
                const title = isMovie ? data.title : data.name;
                const date = isMovie ? data.release_date : data.first_air_date;
                const posterPath = data.poster_path ? IMG_BASE_URL + data.poster_path : 'https://via.placeholder.com/500x750?text=No+Poster';
                const rating = data.vote_average ? Math.round(data.vote_average * 10) : 0;
                const isFavorited = favorites[type].includes(data.id);
                
                // Get top 5 cast members
                const cast = data.credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || 'N/A';
                
                modalBody.innerHTML = `
                    <div class="movie-detail-header">
                        <img src="${posterPath}" alt="${title}" class="movie-detail-poster">
                        <div class="movie-detail-info">
                            <h1 class="movie-detail-title">${title}</h1>
                            <div class="movie-detail-meta">
                                <span>${date ? new Date(date).getFullYear() : 'N/A'}</span>
                                <span>${isMovie ? `${data.runtime} min` : `${data.number_of_seasons} Seasons`}</span>
                                <span>${data.genres?.map(genre => genre.name).join(', ') || 'N/A'}</span>
                            </div>
                            <div class="movie-detail-rating">
                                <div class="rating-circle" style="--rating: ${rating}%">${rating}<small>%</small></div>
                                <span>User Score</span>
                                <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${data.id}" data-type="${type}">
                                    <i class="fas fa-star"></i> ${isFavorited ? 'Favorited' : 'Favorite'}
                                </button>
                            </div>
                            <div class="movie-detail-overview">
                                <h3>Overview</h3>
                                <p>${data.overview || 'No overview available.'}</p>
                            </div>
                            <div class="movie-detail-cast">
                                <h3>Cast</h3>
                                <p>${cast}</p>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add event listener to favorite button in modal
                const modalFavoriteBtn = modalBody.querySelector('.favorite-btn');
                if (modalFavoriteBtn) {
                    modalFavoriteBtn.addEventListener('click', (e) => {
                        toggleFavorite(modalFavoriteBtn.dataset.id, modalFavoriteBtn.dataset.type, modalFavoriteBtn);
                        
                        // Update the favorite button in the grid if visible
                        const gridFavoriteBtn = document.querySelector(`.favorite-btn[data-id="${id}"][data-type="${type}"]`);
                        if (gridFavoriteBtn) {
                            gridFavoriteBtn.classList.toggle('favorited');
                        }
                    });
                }
                
                modal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching movie details:', error);
                modalBody.innerHTML = '<p>Error loading movie details. Please try again.</p>';
                modal.style.display = 'block';
            });
    }
});