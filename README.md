![](https://github.com/Konijima/pzpw/blob/master/pzpw.png?raw=true)

# About PipeWrench

Implemented TypeScript support for modding Project Zomboid.

**Developers:**

https://asledgehammer.com  

**Template:**

https://github.com/asledgehammer/PipeWrenchTemplate  

**Typing:**

https://github.com/asledgehammer/PipeWrench

<br>

# About pzpw

`pzpw` is a command-line tool to manage your PipeWrench project.

**Developer:**

https://github.com/Konijima

**Template:** 

https://github.com/Konijima/PipeWrenchTemplate

**Typing:**

```
npm install -s Zomboid@https://github.com/Konijima/PipeWrench-Zomboid-Types
```
```
npm install -s ZomboidEvents@https://github.com/Konijima/PipeWrench-ZomboidEvents-Types
```

<br>

# Requirements
- [NodeJS + npm](https://nodejs.org/en/download/) 
- [git](https://git-scm.com/downloads)

<br>

# Install

```
npm install -g pzpw
```

<br>

# Commands

### Create a new PipeWrench project.
```
pzpw new <ModID> <ModName> <Author>
```
### Add a mod to your project. **(Not implemented)**
```
pzpw add <ModName>
```
### Update pzpw, require sudo to execute.
```
pzpw update
```
### Set or Generate your workshop project. **(Not implemented)**
```
pzpw workshop <set|generate> <path>
```
### Compile your PipeWrench project.
```
pzpw compile <distribution|development|workshop|declaration>
```
### Check current pzpw version.
```
pzpw version
```
### Show available commands.
```
pzpw help <command>
```
