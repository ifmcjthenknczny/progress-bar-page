import { defineEventHandler, getHeader, getRequestURL, setResponseHeader, setResponseStatus } from 'h3'

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api')) {
    return
  }

  const configured = process.env.CORS_ORIGIN?.trim()
  if (!configured) {
    return
  }

  const allowHeaders =
    process.env.CORS_ALLOW_HEADERS?.trim() ??
    'Content-Type, Authorization, x-api-key, X-API-Key'

  let allowOrigin: string | null = null
  if (configured === '*') {
    allowOrigin = '*'
  } else {
    const allowed = configured.split(',').map((s) => s.trim()).filter(Boolean)
    const reqOrigin = getHeader(event, 'origin')
    if (reqOrigin && allowed.includes(reqOrigin)) {
      allowOrigin = reqOrigin
    } else if (reqOrigin) {
      console.warn(
        '[CORS] Origin not in CORS_ORIGIN — browser will hide response body. Origin:',
        reqOrigin,
        'allowed:',
        configured,
      )
    }
  }

  if (allowOrigin === null) {
    return
  }

  setResponseHeader(event, 'Access-Control-Allow-Origin', allowOrigin)
  if (allowOrigin !== '*') {
    setResponseHeader(event, 'Vary', 'Origin')
  }
  setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  setResponseHeader(event, 'Access-Control-Allow-Headers', allowHeaders)
  setResponseHeader(event, 'Access-Control-Max-Age', 86400)

  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
