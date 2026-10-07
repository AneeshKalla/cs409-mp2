import { useEffect, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useSearchParams } from 'react-router-dom'
import { api, type Movie } from './api'
import MovieDetails from './MovieDetails'
import './App.css'

function Movies({ gallery = false }: { gallery?: boolean }) {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const genre = params.get('genre') || ''
  const sort = params.get('sort') || 'title'
  const order = params.get('order') || 'asc'
  const [movies, setMovies] = useState<Movie[]>([])
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function update(name: string, value: string) {
    const next = new URLSearchParams(params)
    next.set(name, value)
    setParams(next, { replace: true })
  }

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const timer = setTimeout(async () => {
      try {
        const response = await api.get(gallery ? '/discover/movie' : query.trim() ? '/search/movie' : '/movie/popular', {
          params: { query: query.trim(), with_genres: genre, include_adult: false },
          signal: controller.signal,
        })
        setMovies(response.data.results)
        if (gallery) {
          const response = await api.get('/genre/movie/list', { signal: controller.signal })
          setGenres(response.data.genres)
        }
      } catch {
        if (!controller.signal.aborted) setError('Could not load movies. Check your API key and connection, then try again.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, genre, gallery])

  const sorted = [...movies].sort((a, b) => {
    const difference = sort === 'title' ? a.title.localeCompare(b.title) : a.vote_average - b.vote_average
    return order === 'asc' ? difference : -difference
  })
  const shown = gallery ? movies : sorted
  const from = (gallery ? '/gallery' : '/') + '?' + params.toString()
  const navigation = { ids: shown.map(movie => movie.id), from }

  return (
    <>
      <h2>{gallery ? 'Gallery' : 'Search movies'}</h2>
      {gallery ? (
        <label>Genre <select value={genre} onChange={event => update('genre', event.target.value)}>
          <option value="">All genres</option>
          {genres.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select></label>
      ) : (
        <div className="controls">
          <label className="search-field">Search <input type="search" placeholder="Search for a movie…" value={query} onChange={event => update('q', event.target.value)} /></label>
          <label>Sort by <select value={sort} onChange={event => update('sort', event.target.value)}>
            <option value="title">Title</option><option value="rating">Rating</option>
          </select></label>
          <label>Order <select value={order} onChange={event => update('order', event.target.value)}>
            <option value="asc">Ascending</option><option value="desc">Descending</option>
          </select></label>
        </div>
      )}
      {loading ? <p role="status">Loading movies…</p> : error ? <p role="alert">{error}</p> : (
        <>
          <p>{shown.length ? `Showing ${shown.length} movies (first page of TMDB results).` : 'No movies found.'}</p>
          <ul className={gallery ? 'gallery' : 'movie-list'}>
            {shown.map(movie => (
              <li key={movie.id}>
                <Link to={`/movie/${movie.id}`} state={navigation}>
                  {gallery && (movie.poster_path ? <img src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} alt={`${movie.title} poster`} /> : <span className="missing-poster">No poster</span>)}
                  {movie.title}
                </Link>
                <p>{movie.release_date || 'Release date unknown'} · Rating: {movie.vote_average.toFixed(1)}/10</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <header><h1>Movies</h1><nav><NavLink to="/" end>Search</NavLink><NavLink to="/gallery">Gallery</NavLink></nav></header>
      <main><Routes>
        <Route path="/" element={<Movies />} />
        <Route path="/gallery" element={<Movies gallery />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="*" element={<p>Page not found. <Link to="/">Go to search</Link></p>} />
      </Routes></main>
      <footer>This product uses the TMDB API but is not endorsed or certified by TMDB.</footer>
    </BrowserRouter>
  )
}
