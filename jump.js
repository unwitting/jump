const { exec } = require("./interpreter/exec");
const program = require("commander");
const fs = require("fs");
const readline = require("readline");

program
  .version("0.0.1")
  .option("-e --exec [value]", "A jump code string to execute directly")
  .parse(process.argv);

let codeString = program.exec;
if (!codeString) {
  const [srcFile] = program.args;
  if (!srcFile) {
    console.error("No source file or raw code string (-e) given");
    process.exit(1);
  }
  codeString = fs.readFileSync(srcFile).toString();
}

const inputFn = () =>
  new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question("> ", answer => {
      rl.close();
      resolve(answer);
    });
  });

exec(codeString, inputFn, console.log);
