import * as yargs from "yargs";
// @ts-ignore
import * as pkg from "../package.json";

export type CLIOptions = {
  input: string
}

const args = yargs
  .version(pkg.version)
  .option("input", {
    alias: "i",
    demandOption: true,
    describe: "Set the directory path you want to convert",
    type: "string",
  })
  .help("help")
  .detectLocale(false)

const { _: [target], ...flags } = args.argv;
  
export { flags };
