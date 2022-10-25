#!/usr/bin/env node

import { list, use, add, test, remove, help } from './main'

const [cmd, ...argv] = process.argv.slice(2)

switch (cmd) {
  case 'ls':
  case 'list':
    // eslint-disable-next-line no-console
    console.log(list())
    break
  case 'use':
    // eslint-disable-next-line no-console
    console.log(use(argv[0]))
    break
  case 'add':
    // eslint-disable-next-line no-console
    console.log(add(argv[0], argv[1], argv[2]))
    break
  case 'test':
    // eslint-disable-next-line no-console
    test(argv[0]).then(console.log)
    break
  case 'del':
  case 'delete':
  case 'rm':
  case 'remove':
    // eslint-disable-next-line no-console
    console.log(remove(argv[0]))
    break
  case '-v':
  case '--version':
    // eslint-disable-next-line no-console
    console.log('v1.0.0-beta.1')
    break
  case 'h':
  case '-h':
  case 'help':
  case '--help':
  case undefined:
  default:
    // eslint-disable-next-line no-console
    console.log(help())
}
