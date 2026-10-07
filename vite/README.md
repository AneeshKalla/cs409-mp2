# Movies

Minimal React + TypeScript movie browser using Axios, React Router, and TMDB.

## Run

The repository-root `.env` should contain `VITE_TMDB_API_KEY=your_tmdb_api_key` (see `.env.example`).

```sh
cd vite
npm install
npm run dev
```

Open the local URL printed by Vite, including `/cs409-mp2/`.

## Features

- Search TMDB as you type (300 ms delay); an empty search shows popular movies.
- Sort the returned page by title or rating, ascending or descending.
- Browse a poster gallery and select a genre.
- Open movie details at `/movie/:id`.
- Previous and Next wrap through the originating results in their displayed order. Directly opened details use popular movies for navigation.
- Back to movies restores search, sorting, and genre through URL parameters.
- Loading, error, empty-result, and missing-poster messages.

To keep the app minimal, search and gallery show only the first page (up to 20 movies). Sorting applies to that page.

## Check

```sh
npm run build
npm run lint
```

Manual checks: type a movie title; change both sort options and directions; open a result and cycle Previous/Next; return to results; open Gallery, select a genre, and open a poster; refresh a detail URL; try a search with no matches.

## GitHub Pages

The existing workflow builds from `vite/`. Add the repository Actions secret `VITE_TMDB_API_KEY` and select GitHub Actions under Settings → Pages. Push to main to deploy. The base path matches the current repository name, `cs409-mp2`. A generated `404.html` lets GitHub Pages render direct movie URLs (GitHub still returns HTTP 404 for these fallback requests).

The local `.env` is ignored by Git. Vite embeds the API key into the browser build, as expected for this front-end-only assignment.

## Sources and disclosure

- TMDB getting started: https://developer.themoviedb.org/docs/getting-started
- TMDB movie search: https://developer.themoviedb.org/reference/search-movie
- TMDB discover/genre filtering: https://developer.themoviedb.org/reference/discover-movie
- Initial React/TypeScript scaffold: Vite.
- Implementation assistance: OpenAI Codex. Submit this conversation's chatlog and complete the LLM-use survey as required by the assignment.
