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

let current: string
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

function getCurrentRegistry() {
  return spawnSync(['config', 'get', 'registry']).trim()
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

function onCurl(name: string, registry: string) {
  const args = [
    '--connect-timeout', // Set timeout time in seconds
    '5',
    '-o', // Put the response content into dev/null to destroy
    '/dev/null',
    '-s', // No output of error and progress information
    '-w',
    `{
     "name":"${name}",
     "code":"%{http_code}",
     "total":%{time_total},
     "DNS":%{time_namelookup},
     "TCP":%{time_connect},
     "start_transfer":%{time_starttransfer},
     "redirect":%{time_redirect},
     "effective":"%{url_effective}"
    }`,
    registry + 'mini-nrm',
    '-L' // redirects
  ]
  return cp.spawnSync('curl', args, { encoding: 'utf8' })
}

export function list() {
  let output = ''
  if (!current) current = getCurrentRegistry()

  for (const [k, v] of Object.entries(registriesAll)) {
    const isCurrent = v.registry === current
    const ph = new Array(Math.max(maxCharWidth - k.length + 1)).join('-')
    const registry = `${isCurrent ? '*' : ' '} ${k} ${ph} ${v.registry}\n`
    output += isCurrent ? logger.green(registry) : registry
  }

  return output.trimEnd()
}

export function use(name: string, argv: string[] = []) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registry = (registriesAll as any)[name as string]
  if (Array.isArray(argv) && argv.length) {
    argv.unshift('install')
    argv.push('--registry')
    argv.push(registry.registry)
    cp.spawnSync(NPM, argv, { encoding: 'utf8', cwd: process.cwd(), stdio: 'inherit' })
    return ''
  }
  if (registry) {
    current = registry.registry
    spawnSync(['config', 'set', 'registry', current])
    return list()
  }

  const registrys = Object.keys(registriesAll).map(logger.yellow).join(', ')
  return `  Available registry: ${registrys}`
}

export function add(name: string, registry: string, home?: string) {
  if (name && registry && isHttp(registry)) {
    // Must end with "/"
    if (!registry.endsWith('/')) registry = registry + '/'
    // If a custom added registry is already in place, it will not be added and will warn
    const isExists = Object.entries(registriesAll).some((item) => item[1].registry === registry)
    if (isExists) {
      const warn = logger.yellow(registry)
      return `  The ${warn} you specified already exists, please do not add the same registry again and again`
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-extra-semi
    ;(customRegistries as any)[name] = { home, registry }
    saveRegistries()
    return list()
  }

  const example = logger.yellow('"mnrm add npm https://registry.npmjs.org/ https://www.npmjs.org"')
  return `  mnrm add <name> <registry> [home]\n  Example: ${example}`
}

type response = {
  code: string
  total: string
  DNS: string
  TCP: string
  start_transfer: string
  redirect: string
  effective: string
  error: string
}

export function test(info?: string) {
  const TIMEOUT = 'Timeout'
  const isInfo = ['-i', '--info'].includes(info as string)
  if (!current) current = getCurrentRegistry()

  try {
    const promises = // eslint-disable-next-line max-statements
      Object.keys(registriesAll).map((key) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const registry = (registriesAll as any)[key].registry
        const isCurrent = registry === current
        const ph = new Array(Math.max(maxCharWidth - key.length + 1)).join('-')

        const startTime = Date.now()
        const result = onCurl(key, registry)
        const time = Date.now() - startTime

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (result.error && (result.error as any).code === 'ENOENT') throw new Error()

        const msg = time > 5000 ? TIMEOUT : `${time} ms`

        let color
        if (time < 500) color = logger.green(msg)
        else if (time < 1000) color = logger.yellow(msg)
        else color = logger.red(msg)

        const json: response = JSON.parse(result.stdout)

        // Simple Output
        if (!isInfo) {
          if (json.code === '000') color = logger.red(TIMEOUT)
          const prefix = `${key} ${ph}`
          const currentColor = isCurrent ? logger.green('* ' + prefix) : '  ' + prefix
          return `${currentColor} ${color}`
        }

        // Detailed Output
        const s2msArr = ['total', 'DNS', 'TCP', 'start_transfer', 'redirect']
        for (const key in json) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const value = (json as any)[key]

          if (s2msArr.includes(key)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-extra-semi
            ;(json as any)[key] = s2ms(value) + 'ms'

            if (json.code === '000') json.total = TIMEOUT
          }
        }
        return json
      })

    return Promise.all(promises).then((data) => {
      return isInfo ? data : data.join('\n')
    })
  } catch (error) {
    const err = '  Your device does not have "curl" installed, this function is not available'
    return Promise.resolve(logger.red(err))
  }
}

export function remove(...args: string[]) {
  let isRemove

  for (const arg of args) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existsRegistry = (customRegistries as any)[arg]
    if (existsRegistry) {
      isRemove = true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (customRegistries as any)[arg]
    }
  }

  if (isRemove) {
    saveRegistries()
    return list()
  }

  const names = Object.keys(customRegistries).map(logger.yellow).join(', ')
  if (names) return `  Available registry for deletion: ${names}`

  return logger.yellow('  There are no more registries that can be deleted')
}

export function help() {
  return `
  Usage
    $ mnrm [options]
  Options
    ls, list                            List all the registries
    use <name> [package...]             Switch registry or specify registry directly to install npm packages
    add <name> <registry> [home]        Add a custom registry
    test [-i, --info]                   Test the response time of all registries
    del, delete, rm, remove <name...>   Remove a custom registry
    h, -h, help, --help                 Show this help
  Examples
  
    $ ${logger.yellow('mnrm add npm https://registry.npmjs.org/')}

    $ ${logger.yellow('mnrm use npm')}

    $ ${logger.yellow('mnrm use taobao output-line get-user-ip body-data simple-unique -S')}

    $ ${logger.yellow('mnrm list')}

      ${logger.green('* npm --------- https://registry.npmjs.org/')}
        yarn -------- https://registry.yarnpkg.com/
        taobao ------ https://registry.npmmirror.com/
        tencent ----- https://mirrors.cloud.tencent.com/npm/
        npmMirror --- https://skimdb.npmjs.com/registry/
    
    $ ${logger.yellow('mnrm test')}

      ${logger.green(`* npm --------- ${logger.green('153 ms')}`)}
        yarn -------- ${logger.green('175 ms')}
        taobao ------ ${logger.yellow('519 ms')}
        tencent ----- ${logger.green('121 ms')}
        npmMirror --- ${logger.green('481 ms')}
`
}
