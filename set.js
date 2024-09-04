import { cache } from "./cache.js"
export const set =  (url, response) => {
    cache[url] = response
}