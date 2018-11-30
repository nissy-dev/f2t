import * as fs from 'fs'
import * as path from 'path'

// judge whether the file is a jsx file or not
export const isJsxFile = (code: string): boolean => {
  const lines = code.split('\n').filter((line: string) =>
    line.match(/^\/\//) == null && line.match(/from ("|')react("|')/),
  )
  if (lines.length > 0) {
    return true
  }
  return false
}

// delete @flow & $Flow
export const deleteAtFlow = (code: string): string => {
  const lines = code.split('\n')
  const newLines = lines.filter((line: string) => line.match(/(@flow|\$Flow)/) == null)
  return newLines.join('\n')
}

// searching files recursively
// ref：https://qiita.com/amay077/items/cc6ee3e66040a5097230
type fileCallbackType = (path: string) => Promise<void>

export const walk = async (inputPath: string, fileCallback: fileCallbackType): Promise<void> => {
  fs.readdir(inputPath, (err, files) => {
    if (err) {
      throw err
    }

    files.forEach(async (f: string) => {
      const fullPath = path.join(inputPath, f)
      if (fs.statSync(fullPath).isDirectory()) {
        // This recursion happens if the path indicates a directory
        walk(fullPath, fileCallback)
      } else {
         await fileCallback(fullPath)
      }
    })
  })
}

