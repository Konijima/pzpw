![](https://github.com/Konijima/pzpw/blob/master/pzpw.png?raw=true)

# About PZPW

`pzpw` is a command-line tool to manage your PipeWrench project.

**Developer:**

https://github.com/Konijima

**Template for PZPW:**

https://github.com/Konijima/pzpw-template

<br>

# About PipeWrench

Implemented TypeScript support for modding Project Zomboid.

**Developers:**

https://asledgehammer.com  

**Template:**

https://github.com/asledgehammer/PipeWrenchTemplate  

**Typing:**

- https://github.com/asledgehammer/PipeWrench
- https://github.com/asledgehammer/PipeWrench-Events
- https://github.com/asledgehammer/PipeWrench-Utils

<br>

# Requirements
To use PZPW command-line you need these software installed on your machine.
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
### Add an additional mod to your project.
```
pzpw add <ModID> <ModName>
```
### Update pzpw, require sudo to execute.
```
pzpw update
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
