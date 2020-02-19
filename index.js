export function lex(str) { const state = { tokens: [], pos: 0, str };
    let char;
    while (char !== "") {
        char = currentChar(state);

        if (isNumeric(char)) { lexNumber(state); }
        else if (char === "\"") { lexString(state); }
        else if (isIdentifierStart(char)) { lexWord(state); }
        else if (isPunctuation(char)) { lexPunctuation(state); }
        else if (char === "<" || char === ">") { lexLessOrGreaterThan(state); }
        else if (char === "=") { lexEqual(state); }
        else if (char === "!") { lexNot(state); }
        else if (char === "|" || char === "&") { lexBoolean(state); }
        else if (char === " " || char === "\t" || char === "\n") { advanceChar(state); }
        else if (char !== "") { throw new Error("unexpected character '" + char + "'"); }
    }
    return state.tokens;
}
export function parse(str) { return parseTop(lex(str)); }

function finishToken(state, type, value) { state.tokens.push({ type, value }); }
function currentChar(state) { return state.str.charAt(state.pos); }
function nextChar(state) { return state.str.charAt(state.pos + 1) || ""; }
function advanceChar(state, n) { state.pos = state.pos + (n || 1); }
function isAlpha(char) { return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z"); }
function isNumeric(char) { return char >= "0" && char <= "9"; }
function numericCharToNumber(char) { return char.charCodeAt(0) - "0".charCodeAt(0); }
function isIdentifierStart(char) { return char === "$" || char === "_" || isAlpha(char); }
function isIdentifierChar(char) { return isNumeric(char) || isIdentifierStart(char) }
const PUNCTUATION = ["+", "-", "*", ".", ":", "(", ")", ";", ",", "{", "}", "[", "]"];
function isPunctuation(char) { return PUNCTUATION.includes(char); }
const KEYWORDS = 
    ["export", "function", "if", "return", "switch", "throw", "const", "let", "while"];
function isKeyword(char) { return KEYWORDS.includes(char); }

function eat(tokens, type) {
    const token = tokens[0];
    if (!token) return;
    if (!type || token.type === type) {
        tokens.shift();
        return token;
    }
}
function expect(tokens, type) {
    const token = eat(tokens);
    if (!token) { throw new Error("expected '" + type + "'"); }
    if (type && token.type !== type) { 
        throw new Error("expected '" + type + "' received '" + token.type + "'");
    }
    return token;
}

function lexNumber(state) {
    let char = currentChar(state);
    let value = 0;

    while (isNumeric(char)) {
        value = value * 10 + numericCharToNumber(char);
        advanceChar(state);
        char = currentChar(state);
    }
    finishToken(state, "number", value);
}
function lexString(state) {
    advanceChar(state);

    let inEscape = false;
    let value = "";
    while (true) {
        const char = currentChar(state);

        if (inEscape) {
            if (char === "n") {
                value = value + "\n";
            } else if (char === "t") {
                value = value + "\t";
            } else if (char === "\"") {
                value = value + "\"";
            } else if (char === "\\") {
                value = value + "\\";
            } else {
                throw new Error("unexpected string escape '\\" + char + "'");
            }
            inEscape = false;
            advanceChar(state);
        } else if (char === "\n" || char === "") {
            throw new Error("unexpected end of line");
        } else if (char === "\\") {
            inEscape = true;
            advanceChar(state);
        } else if (char !== "\"") {
            value = value + char;
            advanceChar(state);
        } else {
            break;
        }
    }

    advanceChar(state);
    finishToken(state, "string", value);
}
function lexWord(state) {
    let value = "";
    while (true) {
        const char = currentChar(state);

        if (isIdentifierChar(char)) {
            value += char;
            advanceChar(state);
        } else {
            break;
        }
    }
    if (isKeyword(value)) {
        finishToken(state, value, value);
    } else {
        finishToken(state, "word", value);
    }
}
function lexPunctuation(state) {
    const char = currentChar(state);
    advanceChar(state);
    finishToken(state, char);
}
function lexLessOrGreaterThan(state) {
    const char = currentChar(state);
    const next = nextChar(state);

    let type = char;
    advanceChar(state);
    if (next === "=") {
        type = type + "=";
        advanceChar(state);
    }

    finishToken(state, type);
}
function lexEqual(state) {
    advanceChar(state);
    const second = currentChar(state);
    const third = nextChar(state);

    if (second === "=" && third === "=") {
        advanceChar(state, 2);
        finishToken(state, "===");
    } else if (second === "=") {
        throw new Error("== is not supported");
    } else {
        finishToken(state, "=");
    }
}
function lexBoolean(state) {
    const char = currentChar(state);
    const next = nextChar(state);
    const token = char + next;

    if (token === "||") {
        finishToken(state, "||");
    } else if (token === "&&") {
        finishToken(state, "&&");
    } else {
        throw new Error("unexpected character '" + next + "'");
    }

    advanceChar(state, 2);
}
function lexNot(state) {
    advanceChar(state);
    const second = currentChar(state);
    const third = nextChar(state);

    if (second === "=" && third === "=") {
        advanceChar(state, 2);
        finishToken(state, "noteqeq");
    } else {
        finishToken(state, "!");
    }
}

function parseTop(toks) {
    const tokens = toks.slice();

    const node = { type: "TopLevel", body: [] };

    while (tokens.length > 0) {
        const stmt = parseStatement(tokens, node);
        node.body.push(stmt);
    }
    return node;
}

function parseStatement(tokens) {
    const token = tokens[0];
    switch (token.type) {
        case "export": eat(tokens); return parseStatement(tokens);
        case "function": return parseFunction(tokens);
        case "if": return parseIf(tokens);
        case "return": return parseReturn(tokens);
        case "switch": return parseSwitch(tokens);
        case "throw": return parseThrow(tokens);
        case "const": return parseBinding(tokens, true);
        case "let": return parseBinding(tokens, false);
        case "while": return parseWhile(tokens);
        case ";": eat(tokens); return parseStatement(tokens);
        default:
            const expr = parseExpression(tokens);
            expect(tokens, ";");
            return { type: "ExpressionStatement", expr };
    }
}
function parseExpression(tokens) {
    const token = tokens[0];
    if (token.type === "!" || token.type === "-" || token.type === "+") {
        eat(tokens);
        const arg = parseExpression(tokens);
        return { operator: token.type, arg, type: "UnaryExpression" };
    } else {
        return parseExpressionSubscripts(tokens);
    }
}
function parseExpressionSubscripts(tokens) {
    return parseSubscripts(tokens, parseExpressionAtom(tokens));
}
function parseSubscripts(tokens, base) {
    while (true) {
        const element = parseSubscript(tokens, base);
        if (element === base) return base;
        base = element;
    }
}
function parseSubscript(tokens, object) {
    const computed = eat(tokens, "[");
    if (computed || eat(tokens, ".")) {
        let property;
        if (computed) {
            property = parseExpression(tokens);
        } else {
            property = parseIdentifier(tokens);
        }
        if (computed) { expect(tokens, "]") }
        object = { type: "MemberExpression", object, property }
    } else if (eat(tokens, "(")) {
        const args = parseExpressionList(")", tokens);
        object = { callee: object, args, type: "CallExpression" };
    }
    return object;
}
function parseExpressionAtom(tokens) {
    const token = tokens[0];
    switch (token.type) {
        case "word": return parseIdentifier(tokens);
        case "number": case "string": return parseLiteral(tokens);
        case "(": return parseParenExpression(tokens);
        case "[": 
            const list = parseExpressionList("]", tokens);
            return { type: "ArrayExpression", elements: list.exprs };
        case "{": return parseObject(tokens);
        default: throw new Error("unexpected expression type '" + token.type + "'");
    }
}
function parseLiteral(tokens) { 
    const token = eat(tokens, "number") || eat(tokens, "string");
    return { type: "Literal", value: token.value };
}
function parseIdentifier(tokens) { 
    const token = expect(tokens, "word");
    return { type: "Identifier", name: token.value };
}
function parseParenExpression(tokens) { 
    expect(tokens, "(");
    return parseExpressionList(")", tokens);
}
function parseExpressionList(end, tokens) {
    eat(tokens);
    const exprs = [];
    let first = true;
    while (true) {

        const comma = eat(tokens, ",");
        const token = tokens[0];

        

        if (token.type === end) {
            eat(tokens);
            return { type: "SequenceExpression", exprs };
        } else if (!first && !comma) {
            throw new Error("expected ,");
        } else {
            exprs.push(parseExpression(tokens));
            first = false;
        }
    }
}
function parseObject(tokens) {
    throw new Error("unsupported");
}
function parseFunction(tokens) {
    expect(tokens, "function");
    const name = parseIdentifier(expect(tokens, "word"));
    expect(tokens, "(");

    const args = parseExpressionList(")", tokens);
    if (args.exprs.some(e => e.type !== "Identifier"))
        throw new Error("unexpected function argument");
    const body = parseBlock(tokens);
    return { name, args, body };
}
function parseBlock(tokens) {
    const body = [];
    while (!eat(tokens, "}")) {
        const stmt = parseStatement(tokens);
        body.push(stmt);
    }
    return { type: "BlockStatement", body };
}
