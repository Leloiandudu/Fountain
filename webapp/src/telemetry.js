const maxLengh = 10
const Telemetry = { requests: [], errors: [], id: btoa(navigator.userAgent) }

export async function logFetch(url, init) {
   const log = logRequest(url, init)
   const response = await fetch(url, init);
   logResponse(log, response)
   return { log, response }
}

export function logRequest(url, init) {
   if (Telemetry.requests.length === maxLengh) {
      Telemetry.requests.shift()
   }

   const log = { url, init }
   Telemetry.requests.push(log)
   return log
}

export function logResponse(log, { status, statusText }) {
   log.response = { status, statusText }
}

export function logResponseBody(log, body) {
   log.response.body = body
}

export function getTelemetry() {
   return Telemetry
}

function onError({ message, source, lineno, colno, error: { fileName, stack } }) {
   Telemetry.errors.push({ message, source, lineno, colno, fileName, stack })
}

window.addEventListener('error', onError, false)
