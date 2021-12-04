# @agogpixel/cavy

Opinionated tool for NPM package development.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@agogpixel/cavy.svg)](https://npmjs.org/package/@agogpixel/cavy)
[![Downloads/week](https://img.shields.io/npm/dw/@agogpixel/cavy.svg)](https://npmjs.org/package/@agogpixel/cavy)
[![License](https://img.shields.io/npm/l/@agogpixel/cavy.svg)](https://github.com/agogpixel/cavy/blob/master/package.json)

<!-- toc -->

-   [@agogpixel/cavy](#agogpixelcavy)
-   [Usage](#usage)
-   [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @agogpixel/cavy
$ cavy COMMAND
running command...
$ cavy (-v|--version|version)
@agogpixel/cavy/0.1.0 win32-x64 node-v14.17.6
$ cavy --help [COMMAND]
USAGE
  $ cavy COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

-   [`cavy clean [...]`](#cavy-clean-)
-   [`cavy copy [...]`](#cavy-copy-)
-   [`cavy help [COMMAND]`](#cavy-help-command)
-   [`cavy lint [...]`](#cavy-lint-)
-   [`cavy pack [...]`](#cavy-pack-)
-   [`cavy publish [...]`](#cavy-publish-)

## `cavy clean [...]`

run clean commands

```
USAGE
  $ cavy clean [...]

ARGUMENTS
  ...  commands to execute (from cavy config file); executed in order provided on cli; mutually exclusive with --all

OPTIONS
  -a, --all            execute all commands in the order they are specified in cavy config file; required if no commands
                       provided

  -c, --config=config  [default: .cavy] path to cavy config file

  -f, --[no-]force     [default: true] execute clean commands using 'force'

  -h, --help           show CLI help

  -q, --quiet          suppress output

  -v, --verbose        verbose output

EXAMPLES
  $ cavy clean --all
  $ cavy clean --all --no-force
  $ cavy clean myCavyCleanCommandName --quiet
```

_See code: [src/commands/clean.ts](https://github.com/agogpixel/cavy/blob/v0.1.0/src/commands/clean.ts)_

## `cavy copy [...]`

copy package.json from src directory to dst directory, with redactions

```
USAGE
  $ cavy copy [...]

ARGUMENTS
  ...  commands to execute (from cavy config file); executed in order provided on cli; mutually exclusive with --all

OPTIONS
  -a, --all            execute all commands in the order they are specified in cavy config file; required if no commands
                       provided

  -c, --config=config  [default: .cavy] path to cavy config file

  -f, --force          execute copy commands even if src & dst directories are the same

  -h, --help           show CLI help

  -q, --quiet          suppress output

  -v, --verbose        verbose output

EXAMPLES
  $ cavy copy --all
  $ cavy copy --all --force
  $ cavy copy myCavyCopyCommandName --quiet
```

_See code: [src/commands/copy.ts](https://github.com/agogpixel/cavy/blob/v0.1.0/src/commands/copy.ts)_

## `cavy help [COMMAND]`

display help for cavy

```
USAGE
  $ cavy help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.10/src/commands/help.ts)_

## `cavy lint [...]`

run lint commands

```
USAGE
  $ cavy lint [...]

ARGUMENTS
  ...  commands to execute (from cavy config file); executed in order provided on cli; mutually exclusive with --all

OPTIONS
  -a, --all            execute all commands in the order they are specified in cavy config file; required if no commands
                       provided

  -c, --config=config  [default: .cavy] path to cavy config file

  -h, --help           show CLI help

  -q, --quiet          suppress output

  -v, --verbose        verbose output

  -x, --fix            execute lint commands using 'fix' definitions

EXAMPLES
  $ cavy lint --all
  $ cavy lint --all --fix
  $ cavy lint myCavyLintCommandName --quiet
```

_See code: [src/commands/lint.ts](https://github.com/agogpixel/cavy/blob/v0.1.0/src/commands/lint.ts)_

## `cavy pack [...]`

create package tarball

```
USAGE
  $ cavy pack [...]

ARGUMENTS
  ...  commands to execute (from cavy config file); executed in order provided on cli; mutually exclusive with --all

OPTIONS
  -a, --all            execute all commands in the order they are specified in cavy config file; required if no commands
                       provided

  -c, --config=config  [default: .cavy] path to cavy config file

  -h, --help           show CLI help

  -q, --quiet          suppress output

  -r, --release        do not append devPostfix value to version property in package.json

  -v, --verbose        verbose output

EXAMPLES
  $ cavy pack --all
  $ cavy pack myCavyPackCommandName --quiet
```

_See code: [src/commands/pack.ts](https://github.com/agogpixel/cavy/blob/v0.1.0/src/commands/pack.ts)_

## `cavy publish [...]`

publish package tarball

```
USAGE
  $ cavy publish [...]

ARGUMENTS
  ...  commands to execute (from cavy config file); executed in order provided on cli; mutually exclusive with --all

OPTIONS
  -a, --all            execute all commands in the order they are specified in cavy config file; required if no commands
                       provided

  -c, --config=config  [default: .cavy] path to cavy config file

  -h, --help           show CLI help

  -q, --quiet          suppress output

  -v, --verbose        verbose output

EXAMPLES
  $ cavy publish --all
  $ cavy pack myCavyPublishCommandName --quiet
```

_See code: [src/commands/publish.ts](https://github.com/agogpixel/cavy/blob/v0.1.0/src/commands/publish.ts)_

<!-- commandsstop -->
