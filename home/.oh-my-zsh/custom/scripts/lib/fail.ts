import { red, bold } from 'https://deno.land/std/fmt/colors.ts'

export default function fail(message?: string, err?: Error | string): never {
  message && console.error(red(bold(message)))
  err && console.error(typeof err === 'string' ? err : formatError(err))
  Deno.exit(1)
}

export function formatError(err: Error) {
  return `${err.message}${err.stack ? `\n${err.stack}` : ''}`
}
