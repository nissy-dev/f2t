declare module "@babel/core" {
  function transformFileAsync(fileName: string, config: Object): Promise<any>
}
