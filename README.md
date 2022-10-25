<h1 align="center">mini-nrm</h1>
<p align="center">Mini npm registry manager</p>

<p align="center">
    <a href="https://www.npmjs.com/package/mini-nrm"><img src="https://img.shields.io/npm/v/mini-nrm?logo=npm" alt="Version"></a>
    <a href="https://github.com/Lete114/visitor-badge"><img src="https://visitor_badge.deta.dev/?pageID=github.CreateWheel.mini-nrm" alt="visitor_badge"></a>
    <a href="https://github.com/CreateWheel/mini-nrm/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/mini-nrm?color=FF5531" alt="MIT License"></a>
</p>

# mini-nrm

Super lightweight npm registry manager

- **No dependencies.**
- [mini-nrm](https://packagephobia.com/result?p=mini-nrm) ~ **5kb** | [nnrm](https://packagephobia.com/result?p=nnrm) ~ **7.8mb** | [nrm](https://packagephobia.com/result?p=nrm) ~ **15mb**
- TypeScript type declarations included.

## Install

```bash
npm install -g mini-nrm
```

## Usage

`mnrm -h`: Show this help

```bash
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

    $ mnrm add npm https://registry.npmjs.org/
    # or
    $ mnrm add npm https://registry.npmjs.org/ https://www.npmjs.org

    $ mnrm use npm

    $ mnrm list

      * npm --------- https://registry.npmjs.org/
        yarn -------- https://registry.yarnpkg.com/
        taobao ------ https://registry.npmmirror.com/
        tencent ----- https://mirrors.cloud.tencent.com/npm/
        npmMirror --- https://skimdb.npmjs.com/registry/
        github ------ https://npm.pkg.github.com/

    $ mnrm test

      * npm --------- 153 ms
        yarn -------- 175 ms
        taobao ------ 519 ms
        tencent ----- 121 ms
        npmMirror --- 481 ms
        github ------ 169 ms

    $ mnrm test -i

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
```

## JavaScript API

```js
import mnrm from 'mini-nrm'

console.log(mnrm.list())
// output
// * npm --------- https://registry.npmjs.org/
//   yarn -------- https://registry.yarnpkg.com/
//   taobao ------ https://registry.npmmirror.com/
//   tencent ----- https://mirrors.cloud.tencent.com/npm/
//   npmMirror --- https://skimdb.npmjs.com/registry/
//   github ------ https://npm.pkg.github.com/
```