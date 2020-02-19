import fs from "fs";
import path from "path";
import { lex } from "../index";

describe("numbers", () => {
    it("should correctly lex 12345", () => {
        expect(lex("12345")).toEqual([{
            type: "number",
            value: 12345,
        }])
    });
});

describe("strings", () => {
    it("should correctly lex \"foo bar baz\"", () => {
        expect(lex("\"foo bar baz\"")).toEqual([{
            type: "string",
            value: "foo bar baz",
        }]);
    });
    it("should fail when given an unterminated string", () => {
        expect(() => lex('"123\n"')).toThrow("unexpected end of line");
        expect(() => lex('"123')).toThrow("unexpected end of line");
    });
});
describe("words", () => {
    it("should correctly lex valid identifiers", () => {
        expect(lex("fooBarBaz")).toEqual([{ type: "word", value: "fooBarBaz" }]);
        expect(lex("_fooBarBaz")).toEqual([{ type: "word", value: "_fooBarBaz" }]);
        expect(lex("$fooBarBaz")).toEqual([{ type: "word", value: "$fooBarBaz" }]);
        expect(lex("foo0Bar1Baz2")).toEqual([{ type: "word", value: "foo0Bar1Baz2" }]);
    });
});

describe("members", () => {
    it("should correctly lex member expressions", () => {
        expect(lex("abc.xyz")).toEqual([
            { type: "word", value: "abc" },
            { type: "dot" },
            { type: "word", value: "xyz" },
        ])
    });
});

describe("functions", () => {
    it("correctly lexes function declarations", () => {
        expect(lex(`function() {  }`)).toEqual([
            { type: "word", value: "function" },
            { type: "lparen" },
            { type: "rparen" },
            { type: "lbrace" },
            { type: "rbrace" },
        ]);

        expect(lex(`function(foo, bar, baz) { foo; bar; baz; }`)).toEqual([
            { type: "word", value: "function" },
            { type: "lparen" },
            { type: "word", value: "foo" }, { type: "comma" },
            { type: "word", value: "bar" }, { type: "comma" },
            { type: "word", value: "baz" },
            { type: "rparen" },
            { type: "lbrace" },
            { type: "word", value: "foo" }, { type: "semi" },
            { type: "word", value: "bar" }, { type: "semi" },
            { type: "word", value: "baz" }, { type: "semi" },
            { type: "rbrace" },
        ]);
    });
})

describe("object literals", () => {
    it("correctly lexes object literals", () => {
        expect(lex("{ foo: 123 }")).toEqual([
            { type: "lbrace" },
            { type: "word", value: "foo" },
            { type: "colon" },
            { type: "number", value: 123 },
            { type: "rbrace" },
        ]);
    });
});

describe("array literals", () => {
    it("correctly lexes array literals", () => {
        expect(lex("[123, 456]")).toEqual([
            { type: "lbracket" },
            { type: "number", value: 123 },
            { type: "comma" },
            { type: "number", value: 456 },
            { type: "rbracket" },
        ]);
    });
});

describe("metacircular", () => {
    it("correctly lexes itself", () => {
        const p = path.join(__dirname, "../index.js");
        const source = fs.readFileSync(p).toString();
        expect(() => lex(source)).not.toThrow();
    });
});
