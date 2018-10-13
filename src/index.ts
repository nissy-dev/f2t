#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const prettier = require("prettier")
const options = require('../.babelrc.js')

// 現在はpathしかオプションを受けつけない
if (process.argv.length !== 3) {
  throw Error('Invalid Option... this tool allows users to set only one option (path).')
}

// 再帰ファイル探索
// 参考：https://qiita.com/amay077/items/cc6ee3e66040a5097230
const walk = (inputPath: string, fileCallback: Function, errCallback?: Function):void => {
  fs.readdir(inputPath, function(err: any, files: any) {
      if (err && errCallback) {
          errCallback(err);
          return;
      }

      files.forEach((f: File) => {
          const fullPath = path.join(inputPath, f);
          if(fs.statSync(fullPath).isDirectory()) {
              // ディレクトリなら再帰する
              walk(fullPath, fileCallback); 
          } else {
              fileCallback(fullPath);
          }
      });
  });
};

// エラー処理
const error = (err: Error | null): void => {
  if (err == null) {
    return
  }
  console.log("Receive err:" + err) 
}

// 変換処理 (babel, prettier, rename)
const converter = (fullPath: string) => {
  const isJsFile = fullPath.match(/(js|jsx)$/)
  if (isJsFile == null) {
    return
  }

  babel.transformFileAsync(fullPath, options).then((result: any) => {
    const babeledCode = result.code
    const deletedAtFlowCode = deleteAtFlow(babeledCode)
    // configの扱いどうする？
    const formattedCode = prettier.format(deletedAtFlowCode, { semi: false })
    const extension = isJsxFile(formattedCode) ? 'tsx' : 'ts'
    const newPath = fullPath.replace(/(js|jsx)$/, '') + extension
    fs.writeFile(fullPath, deletedAtFlowCode, error)
    fs.rename(fullPath, newPath, error)
  }).catch((e: Error) => console.log('babel error' + e))
}

// jsかjsxかの判断
const isJsxFile = (code: string): boolean => {
  const lines = code.split('\n').filter((line: string) => 
    line.match(/^\/\//) == null && line.match(/from ('|")react('|")/)
  )
  if (lines.length > 0) {
    return true
  }
  return false
}

const deleteAtFlow = (code: string): string => {
  const lines = code.split('\n')
  const newLines = lines.filter((line: string) => line.match(/@flow/) == null)
  return newLines.join('\n')
}

// メイン処理
// 最後の要素をpathと認識する
// 引数が無いときはカレントディレクトリ
const filePath = process.argv.slice(-1)[0] || '.'
const absPath = path.resolve(filePath)
walk(absPath, converter, error);
