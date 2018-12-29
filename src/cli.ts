#!/usr/bin/env node
import * as path from 'path'
import * as chalk from 'chalk'
import { converter, listupFiles } from './utils'
import { flags } from './args'

// main process
const main = async () => {
  const filePath = flags.input
  const absPath = path.resolve(filePath)
  const fileList = await listupFiles(absPath)
  const jsFileList =  fileList.filter((file: string) => file.match(/(js|jsx)$/) != null)
  for(let file of jsFileList) await converter(file);
  console.log(`Successfully converted ${jsFileList.length} files with f2t.`)
  // @ts-ignore
  console.log(chalk.bold.underline('🔥 Finish coverting from flow code to typescript!!'))
}

main().catch((e: Error) => {
  // @ts-ignore
  console.error(chalk.red(e.stack))
})
