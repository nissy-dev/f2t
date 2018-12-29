import * as fs from 'fs'
import * as path from 'path'
import * as babel from '@babel/core'
import * as prettier from 'prettier'
import * as babelConfig from './config/.babelrc.js'
import * as prettierDefaultConfig from './config/.prettierrc.js'

/**
 * judge whether the file is a jsx file or not
 * from 'react'があるかどうかで判別する
 */
const isJsxFile = (code: string): boolean => {
  const lines = code.split('\n').filter((line: string) =>
    line.match(/^\/\//) == null && line.match(/from ("|')react("|')/),
  )
  if (lines.length > 0) {
    return true
  }
  return false
}

/**
 * delete '// @flow' line 
 */
const deleteAtFlow = (code: string): string => {
  const lines = code.split('\n')
  const newLines = lines.filter((line: string) => line.match(/@flow/) == null)
  return newLines.join('\n')
}

/**
 * listup all files in the directory
 * @param {string} dirPath 検索するディレクトリのパス
 * @return {Array<string>} ファイルのパスのリスト
 */
export const listupFiles = (dirPath: string) => {
  const ret: string[] = [];
  const paths = fs.readdirSync(dirPath);

  paths.forEach((path: string) => {
    const fullPath = `${dirPath}/${path}`;
    const stat = fs.statSync(fullPath);
    switch (true) {
      case stat.isFile():
        ret.push(fullPath);
        break;

      case stat.isDirectory():
        ret.push(...listupFiles(fullPath));
        break;

      default:
        /* noop */
    }
  })

  return ret;
};

// convert (babel, prettier, rename)
export const converter = async (fullPath: string): Promise<void | Error> => {
  try {
    const config = { cwd: path.join(__dirname, '../'), ...babelConfig }
    // flow code is compiled by babel
    const result = await babel.transformFileAsync(fullPath, config)
    const babeledCode = result.code
    const deletedAtFlowCode = deleteAtFlow(babeledCode)
    // prettier
    // @ts-ignore
    const formattedCode = prettier.format(deletedAtFlowCode, prettierDefaultConfig)
    await fs.writeFile(fullPath, formattedCode, (err: NodeJS.ErrnoException) => {
      if(err) throw err
    })
    // js → ts,tsx
    const extension = isJsxFile(formattedCode) ? 'tsx' : 'ts'
    const newPath = fullPath.replace(/(js|jsx)$/, '') + extension
    await fs.rename(fullPath, newPath, (err: NodeJS.ErrnoException) => {
      if(err) throw err
    })
    const cwdPath = path.resolve('.')
    console.log(`${path.relative(cwdPath, fullPath)} -> ${path.relative(cwdPath, newPath)}`)
  } catch (e) {
    throw e
  }
}

