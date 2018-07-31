const { exec } = require("./exec");

describe("Entry, termination and execution flow", () => {
  it("can implicitly begin at start of code", async () => {
    expect(await exec("12+^")).toEqual(["3"]);
  });

  it("can explicitly begin at ENTRY", async () => {
    expect(await exec("1_2n")).toEqual(["2"]);
  });

  it("can implicitly terminate with end of code", async () => {
    expect(await exec("_12+^")).toEqual(["3"]);
  });

  it("can explicitly terminate with x", async () => {
    expect(await exec("_1^x2^")).toEqual(["1"]);
  });

  it("can handle arbitrary whitespace between code points", async () => {
    expect(await exec("_     12 +   ^     x")).toEqual(["3"]);
  });

  it("can handle newline whitespace", async () => {
    expect(await exec("1\n2\nn")).toEqual(["2", "1"]);
  });

  it("doesn't count newlines as code points", async () => {
    expect(await exec("2>\n11n")).toEqual([]);
  });

  it("can swap the top two values on the stack", async () => {
    expect(await exec("23o n")).toEqual(["2", "3"]);
  });

  it("can 'swap' the top two values on a stack of one", async () => {
    expect(await exec("2o n")).toEqual(["2"]);
  });

  it("can flush the stack to output", async () => {
    expect(await exec("123n")).toEqual(["3", "2", "1"]);
  });

  it("can duplicate the top of the stack", async () => {
    expect(await exec("2ddn")).toEqual(["2", "2", "2"]);
  });

  it("emits 0 from an empty stack", async () => {
    expect(await exec("^^")).toEqual(["0", "0"]);
  });

  it("can input onto the stack", async () => {
    expect(await exec("v^", ["5"])).toEqual(["5"]);
  });

  it("takes input 0 when no input function or fixed input given", async () => {
    expect(await exec("vvn")).toEqual(["0", "0"]);
  });

  it("takes input 0 in fixed input when no more inputs", async () => {
    expect(await exec("vvn", ["5"])).toEqual(["0", "5"]);
  });

  it("takes input from a defined function", async () => {
    expect(await exec("vvn", () => "3")).toEqual(["3", "3"]);
  });

  it("takes input from a defined promise-returning function", async () => {
    expect(await exec("vvn", async () => "3")).toEqual(["3", "3"]);
  });
});

describe("Integers onto stack", () => {
  it("can push a 0 to the stack", async () => {
    expect(await exec("_000^^^x")).toEqual(["0", "0", "0"]);
  });

  it("can push a 1 to the stack", async () => {
    expect(await exec("_111^^^x")).toEqual(["1", "1", "1"]);
  });

  it("can push a 2 to the stack", async () => {
    expect(await exec("_222^^^x")).toEqual(["2", "2", "2"]);
  });

  it("can push a 3 to the stack", async () => {
    expect(await exec("_333^^^x")).toEqual(["3", "3", "3"]);
  });

  it("can push a 4 to the stack", async () => {
    expect(await exec("_444^^^x")).toEqual(["4", "4", "4"]);
  });

  it("can push a 5 to the stack", async () => {
    expect(await exec("_555^^^x")).toEqual(["5", "5", "5"]);
  });

  it("can push a 6 to the stack", async () => {
    expect(await exec("_666^^^x")).toEqual(["6", "6", "6"]);
  });

  it("can push a 7 to the stack", async () => {
    expect(await exec("_777^^^x")).toEqual(["7", "7", "7"]);
  });

  it("can push a 8 to the stack", async () => {
    expect(await exec("_888^^^x")).toEqual(["8", "8", "8"]);
  });

  it("can push a 9 to the stack", async () => {
    expect(await exec("_999^^^x")).toEqual(["9", "9", "9"]);
  });
});

describe("Maths operations", () => {
  it("can add two number literals", async () => {
    expect(await exec("_12+^x")).toEqual(["3"]);
  });

  it("can add two input numbers", async () => {
    expect(await exec("_vv+^", ["1", "2"])).toEqual(["3"]);
  });

  it("can subtract two integer literals", async () => {
    expect(await exec("73-^")).toEqual(["4"]);
  });

  it("can subtract two integer literals to a negative", async () => {
    expect(await exec("46-^")).toEqual(["-2"]);
  });

  it("can multiply two integer literals", async () => {
    expect(await exec("46*^")).toEqual(["24"]);
  });

  it("can multiply two integers with a negative", async () => {
    expect(await exec("46-3*^")).toEqual(["-6"]);
  });
});

describe("Flags and jumps", () => {
  it("can jump n steps forward from stack", async () => {
    expect(await exec("19>7  4    62+^")).toEqual(["3"]);
  });

  it("can conditionally skip n steps from stack", async () => {
    expect(await exec("1 01}1 12}3 n")).toEqual(["3", "1"]);
  });

  it("can set a flag and jump back to it", async () => {
    expect(await exec("1 3|2* d8- 4} 3< n")).toEqual(["8"]);
  });

  it("can set a flag and stomp back to it", async () => {
    expect(await exec("1 1| 2* 1[ n")).toEqual(["4"]);
  });

  it("can set a flag at a future code point and jump to it", async () => {
    expect(await exec("0|14)1<0<1^")).toEqual(["1"]);
  });

  it("can successfully ignore a command to jump to a nonexistent flag", async () => {
    expect(await exec("1<2^")).toEqual(["2"]);
  });
});

describe("ASCII", () => {
  it("can emit ASCII characters from the stack", async () => {
    expect(await exec("725**4+A 825**5+A 92+7*A 825**A")).toEqual([
      "J",
      "U",
      "M",
      "P"
    ]);
  });

  it("can flush the stack as ASCII characters", async () => {
    expect(await exec("825** 92+7* 825**5+ 725**4+ a")).toEqual(["JUMP"]);
  });

  it("can read text from stdin to the stack as ASCII", async () => {
    expect(await exec("Rn", ["Hi"])).toEqual(["72", "105"]);
    expect(await exec("RAA", ["Hi"])).toEqual(["H", "i"]);
    expect(await exec("Ra", ["Hi"])).toEqual(["Hi"]);
  });
});
