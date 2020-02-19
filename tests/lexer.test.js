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
            { type: "." },
            { type: "word", value: "xyz" },
        ])
    });
});

describe("functions", () => {
    it("correctly lexes function declarations", () => {
        expect(lex(`function() {  }`)).toEqual([
            { type: "word", value: "function" },
            { type: "(" },
            { type: ")" },
            { type: "{" },
            { type: "}" },
        ]);

        expect(lex(`function(foo, bar, baz) { foo; bar; baz; }`)).toEqual([
            { type: "word", value: "function" },
            { type: "(" },
            { type: "word", value: "foo" }, { type: "," },
            { type: "word", value: "bar" }, { type: "," },
            { type: "word", value: "baz" },
            { type: ")" },
            { type: "{" },
            { type: "word", value: "foo" }, { type: ";" },
            { type: "word", value: "bar" }, { type: ";" },
            { type: "word", value: "baz" }, { type: ";" },
            { type: "}" },
        ]);
    });
})

describe("object literals", () => {
    it("correctly lexes object literals", () => {
        expect(lex("{ foo: 123 }")).toEqual([
            { type: "{" },
            { type: "word", value: "foo" },
            { type: ":" },
            { type: "number", value: 123 },
            { type: "}" },
        ]);
    });
});

describe("array literals", () => {
    it("correctly lexes array literals", () => {
        expect(lex("[123, 456]")).toEqual([
            { type: "[" },
            { type: "number", value: 123 },
            { type: "," },
            { type: "number", value: 456 },
            { type: "]" },
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
