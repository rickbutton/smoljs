import fs from "fs";
import path from "path";
import { parse } from "../index";

describe("Literal", () => {
    it("should parse literals", () => {
        expect(parse("12345;")).toEqual({
            body: [{
                expr: {
                    type: "Literal",
                    value: 12345,
                },
                type: "ExpressionStatement"
            }],
            type: "TopLevel"
        });

        expect(parse("\"foo bar\";")).toEqual({
            body: [{
                expr: {
                    type: "Literal",
                    value: "foo bar",
                },
                type: "ExpressionStatement"
            }],
            type: "TopLevel"
        });
    });
});
describe("UnaryExpression", () => {
    expect(parse("-12345;")).toEqual({
        body: [{
            expr: {
                arg: {
                    type: "Literal",
                    value: 12345,
                },
                operator: "-",
                type: "UnaryExpression",
            },
            type: "ExpressionStatement"
        }],
        type: "TopLevel"
    });
    expect(parse("+12345;")).toEqual({
        body: [{
            expr: {
                arg: {
                    type: "Literal",
                    value: 12345,
                },
                operator: "+",
                type: "UnaryExpression",
            },
            type: "ExpressionStatement"
        }],
        type: "TopLevel"
    });
    expect(parse("!12345;")).toEqual({
        body: [{
            expr: {
                arg: {
                    type: "Literal",
                    value: 12345,
                },
                operator: "!",
                type: "UnaryExpression",
            },
            type: "ExpressionStatement"
        }],
        type: "TopLevel"
    });
    expect(parse("!!12345;")).toEqual({
        body: [{
            expr: {
                arg: {
                    arg: {
                        type: "Literal",
                        value: 12345,
                    },
                    operator: "!",
                    type: "UnaryExpression",
                },
                operator: "!",
                type: "UnaryExpression",
            },
            type: "ExpressionStatement"
        }],
        type: "TopLevel"
    });
});
describe("MemberExpression", () => {
    it("should parse member expressions", () => {
        expect(parse("foo.bar;")).toEqual({
            body: [{
                expr: {
                    object: {
                        name: "foo",
                        type: "Identifier",
                    },
                    property: {
                        name: "bar",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "ExpressionStatement",
            }],
            type: "TopLevel"
        });

        expect(parse("foo[123].bar;")).toEqual({
            body: [{
                expr: {
                    object: {
                        object: {
                            name: "foo",
                            type: "Identifier",
                        },
                        property: {
                            value: 123,
                            type: "Literal",
                        },
                        type: "MemberExpression",
                    },
                    property: {
                        name: "bar",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "ExpressionStatement",
            }],
            type: "TopLevel"
        });
    });
});
describe("ArrayExpression", () => {
    it("should parse array expressions", () => {
        expect(parse("[1,2,3];")).toEqual({
            body: [{
                expr: {
                    elements: [
                        { type: "Literal", value: 1 },
                        { type: "Literal", value: 2 },
                        { type: "Literal", value: 3 },
                    ],
                    type: "ArrayExpression",
                },
                type: "ExpressionStatement",
            }],
            type: "TopLevel",
        });
    });
});

/*describe("metacircular", () => {
    it("correctly parses itself", () => {
        const p = path.join(__dirname, "../index.js");
        const source = fs.readFileSync(p).toString();
        expect(() => parse(source)).not.toThrow();
    });
});*/
