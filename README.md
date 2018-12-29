# f2t
CLI tool for converting Flow code into Typescript  

## Usage
```
$ npx f2t -i ./src

Options:
  --version    Show version number                                     [boolean]
  --input, -i  Set the directory path you want to convert    [string] [required]
  --help       Show help                                               [boolean]
```

## Dependency
### babel plugin
* `@babel/plugin-syntax-object-rest-spread`
* `@babel/plugin-syntax-class-properties`
* `@babel/plugin-syntax-flow`
* `@babel/plugin-syntax-jsx`
* `@cureapp/babel-plugin-flow-to-typescript`

