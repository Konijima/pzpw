# PZPW

[![Build](https://github.com/Konijima/pzpw/actions/workflows/Build.yml/badge.svg)](https://github.com/Konijima/pzpw/actions/workflows/Build.yml)
[![npm version](https://badge.fury.io/js/pzpw.svg)](https://badge.fury.io/js/pzpw)

<br>

[NPM](https://www.npmjs.com/search?q=pzpw) | [Template](https://github.com/Konijima/pzpw-template) | [Compiler](https://github.com/Konijima/pzpw-compiler) | [Donation](https://paypal.me/Konijima)
|---|---|---|---|

<br>

# Requirements
To install and use PZPW you need `NodeJS`, `NPM` & `git`.
- [Download NodeJS + NPM](https://nodejs.org/en/download/)  
*Latest LTS Version: 16.17.0 (includes npm 8.15.0)*
- [git](https://git-scm.com/downloads)

<br>

# Installation

```
npm install -g pzpw
```

<br>

# Commands

### Create a new PipeWrench project.
```
pzpw new <ModID> <ModName> <Author>
```
### Add an additional mod to your project.
```
pzpw add <ModID> <ModName>
```
### Switch PipeWrench branch.
```
pzpw switch <stable|unstable>
```
### Update pzpw and project dependencies.
```
pzpw update <all|pzpw|project>
```
### Compile your PipeWrench project.
```
pzpw compile <distribution|development|workshop|declaration>
```
### Link your PipeWrench project to a git repository.
```
pzpw git
```
### Set project cachedir, e.g: C:/Users/Konijima/Zomboid
```
pzpw cachedir <set|unset>
```
### Check current pzpw version.
```
pzpw version
```
### Show available commands.
```
pzpw help <command>
```

<br>

> Apache License Version 2.0  
> Copyright 2022 Konijima  