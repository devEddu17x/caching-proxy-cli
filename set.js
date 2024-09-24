import { cache } from './cache.js'
export const set = (url, response) => {
  cache.set(url, response)
}
