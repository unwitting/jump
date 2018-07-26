const _ = require("lodash");
const colors = require("colors");
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

// exec(codeString, inputFn, console.log);

let tempOut = [];
exec(
  codeString,
  inputFn,
  out => tempOut.push(out),
  ({ step, executionCursor, codePoint, codeArray, stack, flags }) => {
    let flagStr = "";
    if (_.keys(flags).length > 0) {
      const flagArr = new Array(_.max(_.values(flags)) + 1).join(" ").split("");
      for (const flagIndex of _.keys(flags)) {
        flagArr[flags[flagIndex]] = flagIndex;
      }
      flagStr = flagArr.join("");
    }
    console.log("");
    console.log(`CUR : ${new Array(executionCursor + 1).join(" ")}.`);
    console.log(
      `STR : ${codeArray
        .join("")
        .replace(/_/g, colors.grey("_"))
        .replace(/x/g, colors.grey("x"))
        .replace(/\^/g, colors.red("^"))
        .replace(/n/g, colors.red("n"))
        .replace(/v/g, colors.red("v"))
        .replace(/}/g, colors.blue("}"))
        .replace(/>/g, colors.blue(">"))
        .replace(/\|/g, colors.blue("|"))
        .replace(/</g, colors.blue("<"))}`
    );
    console.log(`FLG : ${colors.blue(flagStr)}`);
    console.log(`STP : ${step}`);
    console.log(`STK : ${stack.join(" ")}`);
    console.log(`OUT : ${tempOut.join(" ")}`);
    tempOut = [];
  },
  { delay: 100 }
);
