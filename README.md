# f2t
[![npm version](https://badge.fury.io/js/f2t.svg)](https://badge.fury.io/js/f2t)  
CLI tool for converting Flow code into Typescript  

## Usage
```
$ npx f2t -i ./src

Options:
  --version    Show version number                                     [boolean]
  --input, -i  Set the directory path you want to convert    [string] [required]
  --help       Show help                                               [boolean]
```

## Dependencies
### babel plugin
* `@babel/plugin-syntax-object-rest-spread`
* `@babel/plugin-syntax-class-properties`
* `@babel/plugin-syntax-flow`
* `@babel/plugin-syntax-jsx`
* `babel-plugin-flow-to-typescript`

