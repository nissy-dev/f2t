#!/usr/bin/env node
import * as fs from 'fs'
import * as path from 'path'
import * as babel from '@babel/core'
import * as prettier from 'prettier'
import * as chalk from 'chalk'
import * as babelConfig from './config/.babelrc.js'
import * as prettierDefaultConfig from './config/.prettierrc.js'
import { walk, isJsxFile, deleteAtFlow } from './utils'
import { flags } from './args'

const fsThrowError = (err: NodeJS.ErrnoException) => {
  if(err) throw err
}

// convert (babel, prettier, rename)
const converter = async (fullPath: string): Promise<void> => {
  try {
    const isJsFile = fullPath.match(/(js|jsx)$/)
    if (isJsFile == null) {
      return
    }
  
    const config = { cwd: path.join(__dirname, '../'), ...babelConfig }
    // flow code is compiled by babel
    const result = await babel.transformFileAsync(fullPath, config)
    const babeledCode = result.code
    const deletedAtFlowCode = deleteAtFlow(babeledCode)
    // prettier
    // @ts-ignore
    const formattedCode = prettier.format(deletedAtFlowCode, prettierDefaultConfig)
    fs.writeFile(fullPath, formattedCode, fsThrowError)
    // js → ts,tsx
    const extension = isJsxFile(formattedCode) ? 'tsx' : 'ts'
    const newPath = fullPath.replace(/(js|jsx)$/, '') + extension
    fs.rename(fullPath, newPath, fsThrowError)
    const cwdPath = path.resolve('.')
    console.log(`${path.relative(cwdPath, fullPath)} -> ${path.relative(cwdPath, newPath)}`)
  } catch (e) {
    throw e
  }
}

// main process
const main = async () => {
  const filePath = flags.input
  const absPath = path.resolve(filePath)
  await walk(absPath, converter)
  // @ts-ignore
  // console.log(chalk.bold.underline('\n🔥 Finish coverting from flow code to typescript!!'))
}

main().catch((e: Error) => {
  // @ts-ignore
  console.error(chalk.red(e.stack))
})
