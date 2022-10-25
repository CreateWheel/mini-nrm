import cp from 'child_process'
import { writeFileSync } from 'fs'
import { join } from 'path'
import registries from '../registries.json'
import customRegistries from '../custom_registries.json'

const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm'
let registriesAll = Object.assign({}, registries, customRegistries)

function spawnSync(params: string[]) {
  return cp.spawnSync(NPM, params, { encoding: 'utf8' }).stdout
}

let current = spawnSync(['config', 'get', 'registry']).trim()
const maxCharWidth = Math.max(...Object.keys(registriesAll).map((key) => key.length)) + 3

/**
 * @param {string} str Render colors for "str"
 */
export const logger = {
  red(str: string) {
    return `\x1b[31m${str}\x1b[39m`
  },
  green(str: string) {
    return `\x1b[32m${str}\x1b[39m`
  },
  yellow(str: string) {
    return `\x1b[33m${str}\x1b[39m`
  }
}

function isHttp(str: string) {
  return /^https?:\/\//.test(str)
}

function saveRegistries() {
  registriesAll = Object.assign({}, registries, customRegistries)
  writeFileSync(join(__dirname, '../custom_registries.json'), JSON.stringify(customRegistries, null, 2))
}

function s2ms(s: number) {
  return parseInt((s * 1000) as unknown as string)
}

export function list() {
  let output = '\n'

  for (const [k, v] of Object.entries(registriesAll)) {
    const isCurrent = v.registry === current
    const ph = new Array(Math.max(maxCharWidth - k.length + 1)).join('-')
    const registry = `${isCurrent ? '*' : ' '} ${k} ${ph} ${v.registry}\n`
    output += isCurrent ? logger.green(registry) : registry
  }
  return output
}
export function use(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registry = (registriesAll as any)[name as string]
  if (registry) {
    current = registry.registry
    spawnSync(['config', 'set', 'registry', current])
    return list()
  } else {
    const registrys = Object.keys(registriesAll)
      .map((item) => logger.yellow(item))
      .join(', ')
    return `\n  Available registry: ${registrys}`
  }
}
export function add(name: string, registry: string, home?: string) {
  if (name && registry && isHttp(registry)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-extra-semi
    ;(customRegistries as any)[name] = { home, registry }
    saveRegistries()
    return list()
  } else {
    // eslint-disable-next-line no-console, max-len
    return `\n  mnrm add <name> <registry> [home]\n  Example: ${logger.yellow(
      '"mnrm add npm https://registry.npmjs.org/ https://www.npmjs.org"'
    )}`
  }
}

type response = {
  code: number
  total: number
  DNS: number
  TCP: number
  start_transfer: number
  redirect: number
  effective: string
  error: string
}
export function test(full: string) {
  const promises = // eslint-disable-next-line max-statements
    Object.keys(registriesAll).map((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const registry = (registriesAll as any)[key].registry
      const isCurrent = registry === current
      const ph = new Array(Math.max(maxCharWidth - key.length + 1)).join('-')
      const startTime = Date.now()
      const args = [
        '--connect-timeout', // Set timeout time in seconds
        '5',
        '-o', // Put the response content into dev/null to destroy
        '/dev/null',
        '-s', // No output of error and progress information
        '-w',
        `{
        "name":"${key}",
        "code":"%{http_code}",
        "total":%{time_total},
        "DNS":%{time_namelookup},
        "TCP":%{time_connect},
        "start_transfer":%{time_starttransfer},
        "redirect":%{time_redirect},
        "effective":"%{url_effective}"
      }`,
        registry,
        '-L' // redirects
      ]
      const result = cp.spawnSync('curl', args, { encoding: 'utf8' })

      const error = 'Your device does not have "curl" installed, this function is not available'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (result.error && (result.error as any).code === 'ENOENT') {
        return logger.red(error)
      }

      const time = Date.now() - startTime
      const msg = time > 5000 ? 'Timeout' : `${time} ms`

      let color
      if (time < 1000) color = logger.yellow(msg)
      if (time < 500) color = logger.green(msg)
      else color = logger.red(msg)

      if (!['-i', '--info'].includes(full)) {
        const prefix = `${key} ${ph}`
        const currentColor = isCurrent ? logger.green('* ' + prefix) : '  ' + prefix

        return `${currentColor} ${color}`
      }
      const json: response = JSON.parse(result.stdout)

      const s2msArr = ['total', 'DNS', 'TCP', 'start_transfer', 'redirect']
      for (const key in json) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (json as any)[key]

        if (s2msArr.includes(key)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-extra-semi
          ;(json as any)[key] = s2ms(value) + 'ms'
        }
      }
      return json
    })

  return Promise.all(promises).then((data) => data.join('\n'))
}
export function remove(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existsRegistry = (customRegistries as any)[name]
  if (existsRegistry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (customRegistries as any)[name]
    saveRegistries()
    return list()
  }
  const names = Object.keys(customRegistries)
    .map((item) => logger.yellow(item))
    .join(', ')
  if (names) return `\n  Available registry for deletion: ${names}`
  return logger.yellow('\n  There are no more registries that can be deleted')
}
export function help() {
  // eslint-disable-next-line no-console
  return `
  Usage
    $ mnrm [options]
  Options
    ls, list                          List all the registries
    use <name>                        Switching the registry
    add <name> <registry> [home]      Add a custom registry
    test [-i, --info]                 Test the response time of all registries
    del, delete, rm, remove <name>    Remove a custom registry
    h, -h, help, --help               Show this help
  Examples
  
    $ ${logger.yellow('mnrm add npm https://registry.npmjs.org/')}
    # or
    $ ${logger.yellow('mnrm add npm https://registry.npmjs.org/ https://www.npmjs.org')}

    $ ${logger.yellow('mnrm use npm')}

    $ ${logger.yellow('mnrm list')}

      ${logger.green('* npm --------- https://registry.npmjs.org/')}
        yarn -------- https://registry.yarnpkg.com/
        taobao ------ https://registry.npmmirror.com/
        tencent ----- https://mirrors.cloud.tencent.com/npm/
        npmMirror --- https://skimdb.npmjs.com/registry/
        github ------ https://npm.pkg.github.com/
    
    $ ${logger.yellow('mnrm test')}

      ${logger.green(`* npm --------- ${logger.green('153 ms')}`)}
        yarn -------- ${logger.green('175 ms')}
        taobao ------ ${logger.green('519 ms')}
        tencent ----- ${logger.green('121 ms')}
        npmMirror --- ${logger.green('481 ms')}
        github ------ ${logger.yellow('169 ms')}

    $ ${logger.yellow('mnrm test -i')}

      ┌────────────────┬───────────────────────────────┐
      │    (index)     │            Values             │
      ├────────────────┼───────────────────────────────┤
      │      name      │             'npm'             │
      │      code      │             '000'             │
      │     total      │           '1488ms'            │
      │      DNS       │            '35ms'             │
      │      TCP       │           '1386ms'            │
      │ start_transfer │             '0ms'             │
      │    redirect    │             '0ms'             │
      │   effective    │ 'https://registry.npmjs.org/' │
      └────────────────┴───────────────────────────────┘
      # Omit ...
    `
}
