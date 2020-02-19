export function lex(str) {
    const state = { tokens: [], pos: 0, str };
    lexState(state);
    return state.tokens;
}

function finishToken(state, type, value) { state.tokens.push({ type, value }); }
function currentChar(state) { return state.str.charAt(state.pos); }
function nextChar(state) { return state.str.charAt(state.pos + 1) || ""; }
function advanceChar(state, n) { state.pos = state.pos + (n || 1); }
function isAlpha(char) { return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z"); }
function isNumeric(char) { return char >= "0" && char <= "9"; }
function numericCharToNumber(char) { return char.charCodeAt(0) - "0".charCodeAt(0); }
function isIdentifierStart(char) { return char === "$" || char === "_" || isAlpha(char); }
function isIdentifierChar(char) { return isNumeric(char) || isIdentifierStart(char) }
function isWhitespace(char) { return char === " " || char === "\t" || char === "\n"; }
const PUNCTUATION = ["+", "-", "*", ".", ":", "(", ")", ";", ",", "{", "}", "[", "]"];
function isPunctuation(char) { return PUNCTUATION.includes(char); }

function lexState(state) {
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
        else if (isWhitespace(char)) { advanceChar(state); }
        else if (char !== "") { throw new Error("unexpected character '" + char + "'"); }
    }
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
    finishToken(state, "word", value);
}
function lexPunctuation(state) {
    const char = currentChar(state);
    advanceChar(state);
    finishToken(state, char);
}
function lexLessOrGreaterThan(state) {
    const char = currentChar(state);
    const next = nextChar(state);

    let type;
    if (char === "<") {
        type = "lt";
    } else {
        type = "gt";
    }

    advanceChar(state);
    if (next === "=") {
        type = type + "e";
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
        finishToken(state, "eqeqeq");
    } else if (second === "=") {
        throw new Error("== is not supported");
    } else {
        finishToken(state, "eq");
    }
}
function lexBoolean(state) {
    const char = currentChar(state);
    const next = nextChar(state);
    const token = char + next;

    if (token === "||") {
        finishToken(state, "or");
    } else if (token === "&&") {
        finishToken(state, "and");
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
        finishToken(state, "not");
    }
}
