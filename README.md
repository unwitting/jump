# Jump : an obscure, one-dimensional stack-based language

Welcome to Jump!
Jump is a hard-to-read esoteric programming language.
It has curiosity value and very little else, but it's a fun puzzle to write a program or two, and it'll help you learn about stack-based programming.

This repo acts as both the language spec and the source for a Node.JS-based interpreter.

## Running a Jump program

Before getting into the language concepts, let's talk about how to run Jump code.

First, clone this repo.

```
nvm use
```

Uses `nvm` to select the correct version of Node.JS for the interpreter, and

```
npm install --production
```

will install the dependencies you need (very few, and even those are nice-to-haves)

From here, you have a few options.

### Running a local .jump file

You can really use any file extension, but if you have some code in a file, you can run it with

```
node jump.js path/to/file.jump
```

### Running a small inline script

If you just want to play with tiny one-liners, you can give them directly to the interpreter with the `-e` or `--exec` flag:

```
node jump.js -e '12+^'
```

## Concepts

Jump programs are strings of single control characters which represent instructions to the interpreter.
Execution progresses through the program, instruction by instruction, left to right.
Sometimes the flow will be sent elsewhere by an instruction that breaks the usual one-step-by-one-step movement.

### The execution cursor

Three pieces of persistent information are kept track of during the execution of a Jump program: the _execution cursor_, the _stack_ and the _flag_ mapping.

The location in the code string which is currently being executed is referred to as the _execution cursor_, and by default it increments by one after each instruction (so, in most cases, the execution cursor begins as `0`, then `1`, then `2`, etc until changed by a flow control instruction).

### The stack

The _stack_ is the main data-storage location of a Jump program.
It's the only one of the persistent locations which is dynamic in size (and theoretically of infinite capacity, though not really).
It is always accessible, and is acted on in some way by most of Jump's instructions.

Jump's stack is entirely made up of integers (positive or negative).
Functions to encode and decode readable Unicode characters are / will be available, but they'll always be represented on-stack as integers.

As with any good stack, only two operations are defined: _push_ and _pop_.
Pushing a value puts it on the top of the stack, and popping retrieves (and removes) the top value from the stack.

As an example, imagine the stack looks like:

```
3 <-- Top
2
1 <-- Bottom
```

If we _push_ the values 5, and then 4, we'll end up with:

```
4 <-- Top
5
3
2
1 <-- Bottom
```

If we now _pop_ three values from the stack, we'll have:

```
2 <-- Top
1 <-- Bottom
```

At program start, the stack is empty.

### Flags

The _flag_ mapping is the final piece of persistent information kept in a Jump program.

Flags are pointers to code addresses referenced by integer labels.

So, you might ask your program to create a flag at the current execution cursor (let's say it's `10`), with label `3`.
This is called "flag 3".
The interpreter will remember that flag 3 refers to the location `10` in code.

In future, should your code hit an instruction to jump to flag 3, the next instruction executed will be the one directly after
the location of flag 3, ie `11`.
In this way, flags act as labelled `goto`s.

On program start, the flag mapping is empty.

### Program entry

Program execution starts at the location of the first `_` instruction (there should be at most one), or at the first instruction of the code string if no `_` is found.

### Program termination

Programs terminate if the execution cursor leaves the end of the code string, or if a `x` (`TERMINATE`) instruction is executed.

### Instructions

- `0`, `1`, `2`, ..., `9` : Push the given integer
- `x` (`TERMINATE`) : End execution
- `+` (`PLUS`) : Pop `B`, then pop `A`, then push `A + B`
- `-` (`SUBTRACT`) : Pop `B`, then pop `A`, then push `A - B`
- `*` (`MULTIPLY`) : Pop `B`, then pop `A`, then push `A * B`
- `d` (`DUPLICATE`) : Pop `A`, then push `A` twice
- `^` (`EMIT`) : Pop `A` and write `A.toString()` (JS) to `stdout`
- `n` (`FLUSH`) : `EMIT` until there are no values on the stack
- `v` (`CONSUME`) : read a line from `stdin` and push its integer representation (eg `"10" -> 10`)
- `>` (`FORWARD_JUMP`) : pop `N` and jump the execution cursor `N` steps forward (right)
- `}` (`CONDITIONAL_FORWARD_JUMP`) : pop `Q`, then pop `N`, then jump execution cursor `N` steps forward if `Q == 0`
- `|` (`SET_FLAG`) : pop `A`, and set `flag A` to the current execution cursor
- `<` (`JUMP_TO_FLAG`) : pop `A`, and set the current execution cursor to that marked by `flag A`

## Examples

Let's look at a few example programs to get you started.
Use whichever mechanism you like for running them (see the first heading above), but I'll just include the code itself here.

### Add two integer literals together

```
_12+^x
```

This program:

1.  Begins `_` (Stack: `[]`)
1.  Pushes `1` to the stack (Stack: `[1]`)
1.  Pushes `2` to the stack (`[1 2]`)
1.  Pops and adds the top two values on the stack and pushes the result (`+`) (`[3]`)
1.  Pops and emits the top value to `stdout` (`[]`)
1.  Terminates with `x`

If you run it, you'll see `3` emitted to `stdout`.

Both the `_` and the `x` can be omitted, since they're implicit at the start and end of the code anyway.
This program is functionally equivalent:

```
12+^
```

### Read two integers from stdin and add them

```
vv+^
```

This program:

1.  Reads a number `A` from `stdin` and pushes it (`[A]`)
1.  Reads a number `B` from `stdin` and pushes it (`[B]`)
1.  Pops and adds the top two values on the stack and pushes the result (`+`) (`[A+B]`)
1.  Pops and emits the top value to `stdout` (`[]`)

If you run it, you'll be prompted twice for input and see the sum of your two values emitted to `stdout`.
