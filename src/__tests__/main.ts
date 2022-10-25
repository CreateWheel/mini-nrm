/* eslint-disable @typescript-eslint/no-explicit-any */
import { strictEqual } from 'assert'
import { readFileSync } from 'fs'
import { join } from 'path'
import { add, remove } from '../main'

describe('tests', () => {
  it('add and remove', () => {
    const home = 'https://www.npmjs.org/test'
    const registry = 'https://registry.npmjs.org/test'

    add('npm2', registry + 2)
    add('npm', registry, home)

    let customRegistries = readFileSync(join(__dirname, '../../custom_registries.json'), 'utf8')
    customRegistries = JSON.parse(customRegistries)
    strictEqual(home, (customRegistries as any).npm.home)
    strictEqual(registry, (customRegistries as any).npm.registry)
    remove('npm')

    customRegistries = readFileSync(join(__dirname, '../../custom_registries.json'), 'utf8')
    customRegistries = JSON.parse(customRegistries)
    strictEqual(registry + 2, (customRegistries as any).npm2.registry)
    remove('npm2')
  })
  // This is a destructive test
  // it('use', async () => {
  //   // Although the use of synchronous "spawnSync",
  //   // but after the completion of the execution and
  //   // then synchronous access to the npm registry to obtain
  //   // the unmodified still before, which may npm do caching,
  //   // or npm internal converted to asynchronous,
  //   // resulting in this test can not run properly,
  //   // unless the use of setTimeout function,
  //   // but this is not elegant

  //   const { spawnSync } = await import('child_process')
  //   const { use } = await import('../lib/main')

  //   const registries = await import('../../registries.json')

  //   const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm'

  //   function getCurrentRegistry() {
  //     return spawnSync(NPM, ['config', 'get', 'registry'], { encoding: 'utf8' }).stdout.trim()
  //   }
  //   // Eliminate output
  //   // eslint-disable-next-line no-console, @typescript-eslint/no-empty-function
  //   console.log = function () {}
  //   const npmRegistry = 'https://registry.npmjs.org/'
  //   const githubRegistry = 'https://npm.pkg.github.com/'
  //   const sourceRegistry = getCurrentRegistry()
  //   const [name, registry] = npmRegistry === sourceRegistry ? ['github', githubRegistry] : ['npm', npmRegistry]
  //   use(name)
  //   //
  //   strictEqual(registry, getCurrentRegistry())
  //   // Reduction regustry
  //   for (const key in registries) {
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     const value = (registries as any)[key]
  //     if (value.regustry === sourceRegistry) use(key)
  //   }
  // }).timeout(5000)
})
