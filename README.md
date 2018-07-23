# Jump : an obscure, one-dimensional stack-based language

Welcome to Jump! Jump is a hard-to-read esoteric programming language.
It has curiosity value and very little else, but it's a fun puzzle to use.

This repo acts as both the language spec and the source for a NodeJS-based interpreter.

## Concepts

Jump programs are strings of single control characters which represent instructions to the interpreter.
Execution progresses through the program, instruction by instruction. Sometimes the flow will be sent elsewhere
by an instruction that breaks the usual one-step-by-one-step movement.

### The stack

The stack is one of the two pieces of persistent state kept track of by a Jump program.
It is always accessible, and is the primary focus of most of Jump's instructions.

As with any good stack, two operations only are defined: _push_ and _pop_. Pushing a value puts it on the top of the stack,
and popping retrieves (and removes) the top value from the stack.

As an example, imagine the stack looks like:

```
3 <-- Top
2
1 <-- Bottom
```

If we _push_ the values 4, and then 5, we'll end up with:

```
5 <-- Top
4
3
2
1 <-- Bottom
```

If we now _pop_ three values from the stack, we'll have:

```
2 <-- Top
1 <-- Bottom
```

### Flags

Information about _flags_ are the only other persistent state in a Jump program outside the stack.
Flags are pointers to code addresses referenced by integer labels.

So, you might ask your program to create a flag at the current execution location (let's say it's `10), with label`3`.
This is called "flag 3". The interpreter will remember this.

In future, should your code hit an instruction to jump to flag 3, the next instruction executed will be the one directly after
the location of flag 3, ie `11`. In this way, flags act as labelled `goto`s in Jump.

### Program entry

Program execution starts at the location of the `_` instruction (`ENTRY`), or at the first instruction of the code string if no `_` is found.
It will progress to the right, one character at a time, unless sent somewhere by flow control instructions.

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
