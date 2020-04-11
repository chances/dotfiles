#!/usr/bin/env deno

import * as path from 'https://deno.land/std/path/mod.ts'
import { existsSync } from 'https://deno.land/std/fs/exists.ts'
import { readJsonSync } from 'https://deno.land/std/fs/read_json.ts'
import { assertEquals, AssertionError } from 'https://deno.land/std/testing/asserts.ts'
import * as R from 'https://cdn.pika.dev/ramda@^0.27.0'
import { IFlagArgument, IFlagOptions, ITypeHandler, IFlags } from 'https://deno.land/x/cliffy@v0.4.0/flags.ts';

import fail from './lib/fail.ts'
import requestPermissions from './lib/permissions.ts'
import { processFailed, runCapturingOutput, runIgnoringOutput, runOrFail } from './lib/process.ts'

const verbose = Deno.args.includes('--verbose')
const configPathRelativeToHomedir = path.join('.config', 'git-profiles.json')

await requestPermissions({
  justification: `Requesting permission to load configured profiles from "${path.join('$HOME', configPathRelativeToHomedir)}"…`
}, 'env', 'read')

interface Profile {
  name: string
  email: string
  alias?: string
}
type Profiles = Profile[]

function formatProfile(p: Profile) {
  return [`Name: ${p.name}`, `Email: ${p.email}`].map(line => `\t${line}`).join('\n')
}

function requireEnv(key: string): string {
  const variable = Deno.env(key)
  if (variable === undefined) {
    fail(`Environment variable "${key}" not defined`)
  }
  return variable
}

const configPath = path.normalize(path.join(requireEnv('HOME'), '.config', 'git-profiles.json'))

const profiles: Profiles = []
if (existsSync(configPath)) {
  if (verbose) {
    console.log(`Loading configured profiles from "${configPath}"…`)
  }
  // TODO: Validate the json given the Profiles interface
  profiles.push(...readJsonSync(configPath) as Profiles)
} else if (verbose) {
  console.warn(`File not found: ${configPath}`)
}

function queryProfilesByAlias(query?: string) {
  return (profile: Profile) => {
    if (query) {
      query = query.toLocaleLowerCase()
      return profile.email.toLocaleLowerCase() === query ||
        (profile.alias?.toLocaleLowerCase() === query ?? false)
    }
    return false
  }
}

// Switch Profile program

await requestPermissions({
  justification: `Requesting permission to dynamically import Cliffy (https://deno.land/x/cliffy)…`
}, 'net')

const { Command } = await import('https://deno.land/x/cliffy@v0.4.0/mod.ts')

function isEmail(value: string | false) {
  const emailRegex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return (value && emailRegex.test(value.toLowerCase())) || false
}

const alias = (): ITypeHandler<string | undefined> => {
  return (option: IFlagOptions, arg: IFlagArgument, value: string | false): string | undefined => {
    console.log(value)

    // Lookup saved profile alias
    const emailByAlias = profiles.find(queryProfilesByAlias(value || undefined))
    if (emailByAlias && isEmail(emailByAlias.email)) {
      return emailByAlias.email
    }

    if (!isEmail(value)) {
      throw new Error(`Argument ${option.name} must reference a valid profile or email address, but got "${value}"`);
    }

    return value || undefined;
  }
}

const switchProfile = new Command()
  .version('0.1.0')
  .description('Manage a collection of Git user profiles.')
  .type('alias', alias)
  .complete('email', () => profiles.map(profile => profile.email))

switchProfile.command('ls', new Command()
  // TODO: Add a `list` alias to this sub-command
  .arguments('[profile:alias]')
  .option('-t, --table', 'Format output as a table.')
  .option('--json', 'Format output as json.')
  .option('--verbose', 'Enable verbose logging.')
  .description('Print list of configured profiles.')
  .action(({ json, table }: IFlags, profile?: string) => {
    interface TableEntry {
      [name: string]: string;
    }
    function profileTable(profiles: Profiles) {
      console.table(profiles.map(({ name, email, alias }) => {
        const entry: TableEntry = {};
        const formattedAlias = alias ? ` (${alias})` : ''
        entry[`${name}${formattedAlias}`] = email
        return entry
      }));
    }

    function profilePrinter(profiles: Profiles) {
      return profiles
        .map((profile, i) => [
          `${profile.alias ? `${profile.alias}` : `Profile: ${i + 1}`}`,
          formatProfile(profile),
        ].join('\n'))
        .join('\n')
    }

    if (verbose && profile) console.log([
      'Pre-filtered profile collection:',
      profilePrinter(profiles),
    ].join('\n'))

    type ProfilesLogger = (profiles: Profiles) => void
    const logger: ProfilesLogger = json
      ? R.compose(console.log, JSON.stringify) as ProfilesLogger
      : table ? profileTable : R.compose(console.log, profilePrinter)

    const profilesByQuery = profiles.filter(queryProfilesByAlias(profile))
    if (profile && profilesByQuery.length === 0) return

    if (verbose && profile) console.log('Filtered profile collection:')
    logger(profile ? profilesByQuery : profiles)
  }))

switchProfile.command('to', new Command()
  // TODO: Make profile optional and prompt at runtime
  .arguments('<profile:alias> [name:string]')
  .option('--verbose', 'Enable verbose logging.')
  .description('Switch to the specified Git profile.')
  .action(async (_: any, profile: string, name?: string) => {

    if (!profile) throw new Error('Missing argument(s): profile')

    const runPermJustification = 'Requesting permission to run the Git command…'
    await requestPermissions({justification: runPermJustification}, 'run')

    const maybeProfile = profiles.find(queryProfilesByAlias(profile))

    const gitProfile = maybeProfile || {
      name: name || fail('Missing argument(s): name'),
      email: profile,
      alias: isEmail(profile) ? undefined : profile
    }
    if (!isEmail(gitProfile.email)) throw new Error(`Argument profile must reference a valid profile or email address, but got "${profile}"`)

    const aliasSuffix = gitProfile.alias ? ` ${gitProfile.alias}` : ''
    if (verbose) console.log([
      gitProfile.alias
        ? `Switching to your ${gitProfile.alias} Git profile:`
        : 'Switching to this Git profile:',
      formatProfile(gitProfile)
    ].join('\n'))

    const globalGitConfig = ['git', 'config', '--global']
    const globalGitName = [...globalGitConfig, 'user.name']
    const globalGitEmail = [...globalGitConfig, 'user.email']

    // Update user's Git name and email
    runOrFail([...globalGitName, `"${gitProfile.name}"`])
    runOrFail([...globalGitEmail, `"${gitProfile.email}"`])

    if (verbose) console.log('Verifying changes…')

    async function runOrFailGetGitConfig(cmd: string[]) {
      const output = await runCapturingOutput(cmd)
      if (!output.success) {
        processFailed(globalGitConfig[0], output.code)
      }
      const config = output.stdout

      // https://github.com/lakenen/node-unquote/blob/master/index.js
      const reg = /[\'\"]/
      /**
       * Remove wrapping quotes from a string.
       * @param str String to unquote
       */
      function unquote(str: string) {
        if (!str) {
          return ''
        }
        if (reg.test(str.charAt(0))) {
          str = str.substr(1)
        }
        if (reg.test(str.charAt(str.length - 1))) {
          str = str.substr(0, str.length - 1)
        }
        return str
      }

      return config ? unquote(config.trim()) : config
    }

    // Confirm profile was changed successfully
    const failurePrefix = 'Configured Git profile'
    let observedProfile: Profile | null = null
    try {
      const name = await runOrFailGetGitConfig(globalGitName)
      const email = await runOrFailGetGitConfig(globalGitEmail)
      if (!name || !email) fail(`${failurePrefix} is now unset`)
      observedProfile = { name, email }
      assertEquals(observedProfile, { name: gitProfile.name, email: gitProfile.email })
    } catch (err) {
      if (observedProfile && err instanceof AssertionError) {
        fail(
          [
            `${failurePrefix} does not match given profile:`,
              formatProfile(gitProfile),
            'got:',
              formatProfile(observedProfile),
          ].join('\n'),
          verbose ? err : 'Rerun with --verbose for more details',
        )
      }
      fail('Unknown error:', err instanceof Error ? err : `${err}`)
    }

    if (verbose) console.log('Successfully switched Git profile')
  })
)

await switchProfile.useRawArgs().parse(Deno.args)
