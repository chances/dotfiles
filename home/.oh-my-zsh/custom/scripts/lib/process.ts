import fail from './fail.ts'

export function processFailed(cmd: string, code: Deno.ProcessStatus['code']) {
  fail(`\nProcess ${cmd} exited with code ${code}`);
}

export type ProcessStatusOutput = Deno.ProcessStatus & { stdout?: string }

/**
 * Spans a new sub-process, capturing stdout and inheriting stderr of parent process.
 * @param cmd Arguments to pass
 */
export async function runCapturingOutput(cmd: string[]): Promise<ProcessStatusOutput> {
  const process = Deno.run({ cmd, stdout: 'piped' })
  const output = await process.output()
  return {
    ...await process.status(),
    stdout: new TextDecoder().decode(output)
  }
}

/**
 * Spans a new sub-process, ignoring stdout and inheriting stderr of parent process.
 * @param cmd Arguments to pass
 */
export async function runIgnoringOutput(cmd: string[]): Promise<Deno.ProcessStatus> {
  return Deno.run({ cmd, stderr: 'inherit', stdout: 'null' }).status()
}

export async function runOrFail(cmd: string[]) {
  const process = await runIgnoringOutput(cmd)
  if (!process.success) {
    processFailed(cmd[0], process.code);
  }
}
