import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: { api_key: import.meta.env.VITE_TMDB_API_KEY },
  timeout: 10000,
})

export interface Movie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
  overview: string
}
