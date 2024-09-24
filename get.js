import { cache } from './cache.js'
export const get = (url) => {
  return cache.get(url)
}
