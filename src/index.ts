#!/usr/bin/env node
import * as babel from '@babel/core'
import * as fs from 'fs'
import * as path from 'path'
import * as prettier from 'prettier'
import * as babelConfig from './.babelrc.js'
import * as prettierDefaultConfig from './.prettierrc.js'

// searching files recursively
// ref：https://qiita.com/amay077/items/cc6ee3e66040a5097230
type fileCallbackType = (path: string) => void
type errCallbackType = (err: Error) => void

const walk = (inputPath: string, fileCallback: fileCallbackType, errCallback?: errCallbackType): void => {
  fs.readdir(inputPath, (err, files) => {
      if (err && errCallback) {
          errCallback(err)
          return
      }

      files.forEach((f) => {
          const fullPath = path.join(inputPath, f)
          if (fs.statSync(fullPath).isDirectory()) {
              // This recursion happens if the path indicates a directory
              walk(fullPath, fileCallback)
          } else {
              fileCallback(fullPath)
          }
      })
  })
}

// error message
const error = (err: Error | null): void => {
  if (err == null) {
    return
  }
  console.log(err)
};

// convert (babel, prettier, rename)
const converter = (fullPath: string) => {
  const isJsFile = fullPath.match(/(js|jsx)$/)
  if (isJsFile == null) {
    return
  }

  babel.transformFileAsync(fullPath, babelConfig).then((result: any) => {
    const babeledCode = result.code
    const deletedAtFlowCode = deleteAtFlow(babeledCode)
    // prettier
    const defaultPath = path.resolve('') + '/.prettierrc.js';
    const prettierConfig = isExistFile(defaultPath) ? require(defaultPath) : prettierDefaultConfig
    const formattedCode = prettier.format(deletedAtFlowCode, prettierConfig)
    fs.writeFile(fullPath, formattedCode, error)
    // js → ts,tsx
    const extension = isJsxFile(formattedCode) ? 'tsx' : 'ts'
    const newPath = fullPath.replace(/(js|jsx)$/, '') + extension
    fs.rename(fullPath, newPath, error)
  }).catch((e: Error) => error(e))
}

// confirm existance of prettier config
const isExistFile = (file: string): boolean | undefined => {
  try {
    fs.statSync(file);
    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }
  }
}

// judge whether the file is a jsx file or not
const isJsxFile = (code: string): boolean => {
  const lines = code.split('\n').filter((line: string) =>
    line.match(/^\/\//) == null && line.match(/from ("|')react("|')/),
  )
  if (lines.length > 0) {
    return true
  }
  return false
}

// delete @flow
const deleteAtFlow = (code: string): string => {
  const lines = code.split('\n')
  const newLines = lines.filter((line: string) => line.match(/@flow/) == null)
  return newLines.join('\n')
}

// main process
const main = () => {
  // TODO: とりあえずコマンドライン引数は１つのみとる
  if (process.argv.length !== 3) {
    throw Error('Invalid Option... this tool allows users to set only one option (path).')
  }
  const filePath = process.argv.slice(-1)[0] || '.'
  const absPath = path.resolve(filePath)
  walk(absPath, converter, error)
}
main()
