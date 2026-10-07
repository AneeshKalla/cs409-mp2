import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api, type Movie } from './api'

interface Details extends Movie {
  runtime: number | null
  genres: { id: number; name: string }[]
}

export default function MovieDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const navigation = location.state as { ids: number[]; from: string } | null
  const [movie, setMovie] = useState<Details | null>(null)
  const [fallbackIds, setFallbackIds] = useState<number[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setMovie(null)
    setError('')
    async function load() {
      try {
        const response = await api.get(`/movie/${id}`, { signal: controller.signal })
        setMovie(response.data)
        if (!navigation?.ids.length) {
          const popular = await api.get('/movie/popular', { signal: controller.signal })
          setFallbackIds(popular.data.results.map((item: Movie) => item.id))
        }
      } catch {
        if (!controller.signal.aborted) setError('Could not load this movie. Check the URL, API key, or connection.')
      }
    }
    load()
    return () => controller.abort()
  }, [id, navigation])

  let ids = navigation?.ids.length ? navigation.ids : fallbackIds
  if (!ids.includes(Number(id))) ids = [Number(id), ...ids]
  const index = ids.indexOf(Number(id))

  function move(offset: number) {
    const next = ids[(index + offset + ids.length) % ids.length]
    navigate(`/movie/${next}`, { state: { ids, from: navigation?.from || '/' } })
  }

  return (
    <>
      <p><Link to={navigation?.from || '/'}>Back to movies</Link></p>
      {error ? <p role="alert">{error}</p> : !movie ? <p role="status">Loading movie…</p> : (
        <div className="movie-details">
          {movie.poster_path && <img className="detail-poster" src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} alt={`${movie.title} poster`} />}
          <div className="detail-info">
            <h2>{movie.title}</h2>
            <p>{movie.overview || 'No description available.'}</p>
            <p>Release date: {movie.release_date || 'Unknown'}</p>
            <p>Rating: {movie.vote_average.toFixed(1)}/10</p>
            <p>Runtime: {movie.runtime ? `${movie.runtime} minutes` : 'Unknown'}</p>
            <p>Genres: {movie.genres.map(genre => genre.name).join(', ') || 'Unknown'}</p>
            <div className="controls">
              <button disabled={ids.length < 2} onClick={() => move(-1)}>Previous</button>
              <button disabled={ids.length < 2} onClick={() => move(1)}>Next</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
