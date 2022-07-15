# About PipeWrench

Implemented TypeScript support for modding Project Zomboid.

**Developers:**

> https://asledgehammer.com  

**Template:**

> https://github.com/asledgehammer/PipeWrenchTemplate  

**Typing:**

> https://github.com/asledgehammer/PipeWrench

<br>

# About pzpw

`pzpw` is a command-line tool to manage your PipeWrench project.

**Developer:**

> https://github.com/Konijima

**Template:** 

> https://github.com/Konijima/PipeWrenchTemplate

**Typing:**

> `npm install -s Zomboid@https://github.com/Konijima/PipeWrench-Zomboid-Types`

> `npm install -s ZomboidEvents@https://github.com/Konijima/PipeWrench-ZomboidEvents-Types`

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
### Update pzpw, require sudo to execute.
```
pzpw update
```
### Set or Generate your workshop project.
```
pzpw workshop <set|generate> <path>
```
### Compile your PipeWrench project.
```
pzpw compile <dist|dev|export>
```
### Check current pzpw version.
```
pzpw version
```
### Show available commands.
```
pzpw help <command>
```
