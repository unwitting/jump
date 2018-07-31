const _ = require("lodash");

const CODE_POINTS = require("./src/code_points");

const pause = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));

const act = async (
  executionCursor,
  codePoint,
  stack,
  flags,
  inputFn,
  outputFn
) => {
  let newExecutionCursor = executionCursor;
  if (codePoint === CODE_POINTS.EMIT) {
    outputFn(stack.length === 0 ? "0" : stack.pop().toString());
  } else if (codePoint === CODE_POINTS.EMIT_AS_ASCII) {
    outputFn(String.fromCharCode(stack.length === 0 ? "0" : stack.pop()));
  } else if (codePoint === CODE_POINTS.FLUSH) {
    while (stack.length > 0) {
      outputFn(stack.pop().toString());
    }
  } else if (codePoint === CODE_POINTS.FLUSH_AS_ASCII) {
    let out = "";
    while (stack.length > 0) {
      out += String.fromCharCode(stack.pop());
    }
    outputFn(out);
  } else if (codePoint === CODE_POINTS.CONSUME) {
    stack.push(parseInt(await inputFn(), 10));
  } else if (codePoint === CODE_POINTS.CONSUME_AS_ASCII) {
    const word = await inputFn();
    const toPush = _.reverse(word.split(""));
    for (const char of toPush) {
      stack.push(char.charCodeAt(0));
    }
  } else if (codePoint === CODE_POINTS.SWAP) {
    if (stack.length > 1) {
      const swap = stack.pop();
      const other = stack.pop();
      stack.push(swap);
      stack.push(other);
    }
  } else if (codePoint === CODE_POINTS.PLUS) {
    stack.push(stack.pop() + stack.pop());
  } else if (codePoint === CODE_POINTS.SUBTRACT) {
    stack.push(-stack.pop() + stack.pop());
  } else if (codePoint === CODE_POINTS.MULTIPLY) {
    stack.push(stack.pop() * stack.pop());
  } else if (codePoint === CODE_POINTS.DUPLICATE) {
    const dup = stack.pop();
    stack.push(dup);
    stack.push(dup);
  } else if (codePoint === CODE_POINTS.FORWARD_JUMP) {
    newExecutionCursor += stack.pop();
  } else if (codePoint === CODE_POINTS.CONDITIONAL_FORWARD_JUMP) {
    const distance = stack.pop();
    if (stack.pop() === 0) {
      newExecutionCursor += distance;
    }
  } else if (codePoint === CODE_POINTS.SET_FLAG) {
    flags[stack.pop()] = executionCursor;
  } else if (codePoint === CODE_POINTS.SET_FLAG_AHEAD) {
    const delta = stack.pop();
    flags[stack.pop()] = executionCursor + delta;
  } else if (codePoint === CODE_POINTS.JUMP_TO_FLAG) {
    const target = stack.pop();
    if (flags[target] !== undefined) {
      newExecutionCursor = flags[target];
    }
  } else if (codePoint === CODE_POINTS.STOMP_TO_FLAG) {
    const target = stack.pop();
    if (flags[target] !== undefined) {
      newExecutionCursor = flags[target];
      delete flags[target];
    }
  } else if (codePoint === CODE_POINTS.ZERO) {
    stack.push(0);
  } else if (codePoint === CODE_POINTS.ONE) {
    stack.push(1);
  } else if (codePoint === CODE_POINTS.TWO) {
    stack.push(2);
  } else if (codePoint === CODE_POINTS.THREE) {
    stack.push(3);
  } else if (codePoint === CODE_POINTS.FOUR) {
    stack.push(4);
  } else if (codePoint === CODE_POINTS.FIVE) {
    stack.push(5);
  } else if (codePoint === CODE_POINTS.SIX) {
    stack.push(6);
  } else if (codePoint === CODE_POINTS.SEVEN) {
    stack.push(7);
  } else if (codePoint === CODE_POINTS.EIGHT) {
    stack.push(8);
  } else if (codePoint === CODE_POINTS.NINE) {
    stack.push(9);
  }
  return { newExecutionCursor };
};

const exec = async (
  codeString,
  input,
  outputFn,
  track = () => {},
  { delay } = {}
) => {
  const codeArray = _.reject(codeString.split(""), c => c === "\n");
  const stack = [];
  const flags = {};
  const output = [];

  let inputFn = () => "0";
  if (_.isArray(input)) {
    let currInputIndex = 0;
    inputFn = () => {
      if (currInputIndex >= input.length) {
        return "0";
      }
      return input[currInputIndex++];
    };
  } else if (_.isFunction(input)) {
    inputFn = input;
  }

  const fixedOutput = _.isUndefined(outputFn);
  if (fixedOutput) {
    outputFn = x => output.push(x);
  }

  let step = 0;
  for (
    let executionCursor = Math.max(0, codeArray.indexOf(CODE_POINTS.ENTRY));
    codeArray[executionCursor] !== CODE_POINTS.TERMINATE &&
    executionCursor < codeArray.length;
    executionCursor++
  ) {
    const codePoint = codeArray[executionCursor];
    const { newExecutionCursor } = await act(
      executionCursor,
      codePoint,
      stack,
      flags,
      inputFn,
      outputFn
    );
    executionCursor = newExecutionCursor;
    track({
      step,
      executionCursor,
      codeArray,
      codePoint,
      stack,
      flags
    });
    step++;
    if (delay) {
      await pause(delay);
    }
  }

  if (fixedOutput) {
    return output;
  }
};

module.exports = { exec };
