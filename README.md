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
- [mini-nrm](https://packagephobia.com/result?p=mini-nrm) ~ **20kB** | [nnrm](https://packagephobia.com/result?p=nnrm) ~ **7MB** | [nrm](https://packagephobia.com/result?p=nrm) ~ **15MB**
- Customizing the registry image
- Test response speed details
- TypeScript type declarations included.

## Install

```bash
npm install -g mini-nrm
```

Because it is very slim, you can use `npx` to manage the registry image directly without installing it

```bash
npx mini-nrm --help
```

## Usage

`mnrm --help`: Show this help

```bash
  Usage
    $ mnrm [options]
  Options
    ls, list                            List all the registries
    use <name>                          Switching the registry
    add <name> <registry> [home]        Add a custom registry
    test [-i, --info]                   Test the response time of all registries
    del, delete, rm, remove <name...>   Remove a custom registry
    h, -h, help, --help                 Show this help
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

      ┌─────────┬─────────────┬───────┬───────────┬─────────┬─────────┬────────────────┬──────────┬──────────────────────────────────────────┐
      │ (index) │    name     │ code  │   total   │   DNS   │   TCP   │ start_transfer │ redirect │                effective                 │
      ├─────────┼─────────────┼───────┼───────────┼─────────┼─────────┼────────────────┼──────────┼──────────────────────────────────────────┤
      │    0    │    'npm'    │ '000' │ 'Timeout' │ '27ms'  │  '0ms'  │     '0ms'      │  '0ms'   │      'https://registry.npmjs.org/'       │
      │    1    │   'yarn'    │ '000' │ 'Timeout' │ '32ms'  │  '0ms'  │     '0ms'      │  '0ms'   │     'https://registry.yarnpkg.com/'      │
      │    2    │  'taobao'   │ '200' │  '654ms'  │ '41ms'  │ '214ms' │    '653ms'     │  '0ms'   │    'https://registry.npmmirror.com/'     │
      │    3    │  'tencent'  │ '200' │ '1159ms'  │ '251ms' │ '452ms' │    '1159ms'    │  '0ms'   │ 'https://mirrors.cloud.tencent.com/npm/' │
      │    4    │ 'npmMirror' │ '000' │ 'Timeout' │ '22ms'  │  '0ms'  │     '0ms'      │  '0ms'   │   'https://skimdb.npmjs.com/registry/'   │
      │    5    │  'github'   │ '200' │ '2302ms'  │ '287ms' │ '775ms' │    '2301ms'    │ '1179ms' │  'https://github.com/features/packages'  │
      └─────────┴─────────────┴───────┴───────────┴─────────┴─────────┴────────────────┴──────────┴──────────────────────────────────────────┘
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
