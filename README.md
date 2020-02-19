# smoljs

`smoljs` is a metacircular interpreter for a subset of `JavaScript`, written in `smoljs`.

It's not done yet.

The goal of `smoljs` is to design a very small and easy to understand interpreter
for a subset of `JavaScript` that is implemented only in that subset, which
makes for an infintely recursive metacircular interpreter.

This will be hopefully used as the basis for a conference talk on compilers and interpreters
in `JavaScript`, and fun stuff like self-hosting and metacircular interpreters.

# TODO

- finish parser
- tree-walking evaluator
- bytecode emitter?
- bytecode interpreter?
- wasm?

# DONE

- a `smoljs` compatible lexer
- most of a parser
