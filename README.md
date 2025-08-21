# Insider-Internship-Final-Project

# MovieDB
MovieDB is a web application for discovering and tracking movies and TV shows. It utilizes The Movie Database (TMDb) API to fetch and display popular, top-rated, and upcoming content. Users can search for specific titles, view detailed information about a movie or TV show, and save their favorites.

# Features
Browse Content: View popular, top-rated, and upcoming movies and TV shows.

Dynamic Tabs: Switch between different categories like "Popular," "Top Rated," "Upcoming," and "On TV."

Search Functionality: Search for movies, TV shows, and people with live-throttled search results.

Content Details: Click on any title to view a modal with detailed information, including:

Title and release date

User score (rating)

Overview and synopsis

Genre information

Top cast members

Favorites Management: Add or remove movies and TV shows to a favorites list, which is saved locally in the browser.

Pagination: Navigate through multiple pages of content.

Responsive Design: The application is fully responsive and works on various devices, from desktops to mobile phones.

# Technologies Used
HTML5: For the structure of the web pages.

CSS3: For styling, including responsive design and layout.

JavaScript (ES6+): For fetching data from the API, handling user interactions, and dynamically updating the DOM.

The Movie Database (TMDb) API: The primary data source for all movie and TV show information.

Font Awesome: Used for icons (e.g., search, star).

# Getting Started
To get a local copy up and running, follow these simple steps.

# Prerequisites
You will need a TMDb API key to run this project.

Sign up for an account on The Movie Database.

Get your free API key from your account settings.

# Installation
Clone the repository:

Bash

git clone https://github.com/your-username/moviedb-project.git
Navigate to the project directory:

Bash

cd moviedb-project
Open the app.js file and replace the placeholder with your actual API key:

JavaScript

const API_KEY = 'YOUR_API_KEY_HERE';
Open the index.html file in your web browser.

# Project Structure
index.html: The main HTML file containing the page structure.

style.css: The CSS file for all styling.

app.js: The JavaScript file that handles API calls, DOM manipulation, and all interactive features.

# API Endpoints
The application uses the following TMDb API endpoints:

Popular Movies: /movie/popular

Top Rated Movies: /movie/top_rated

Upcoming Movies: /movie/upcoming

Popular TV Shows: /tv/popular

Top Rated TV Shows: /tv/top_rated

On The Air TV Shows: /tv/on_the_air

Multi-Search: /search/multi

Movie/TV Details: /{type}/{id} (with append_to_response=credits)

# Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

# License
Distributed under the MIT License. See LICENSE for more information.
