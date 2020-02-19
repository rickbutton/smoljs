export function lex(str) {
    const state = {
        tokens: [],
        pos: 0,
        str,
    };

    return lexState(state).tokens;
}

function currentChar(state) {
    return state.str.charAt(state.pos);
}
function nextChar(state) {
    return state.str.charAt(state.pos + 1) || "";
}
function advanceChar(state) {
    state.pos = state.pos + 1;
    return currentChar(state);
}

function isAlpha(char) { return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z"); }
function isNumeric(char) { return char >= "0" && char <= "9"; }
function numericCharToNumber(char) { return char.charCodeAt(0) - "0".charCodeAt(0); }
function isIdentifierStart(char) { return char === "$" || char === "_" || isAlpha(char); }
function isIdentifierChar(char) { 
    return char === "$" || char === "_" || isNumeric(char) || isAlpha(char); }
function isWhitespace(char) { return char === " " || char === "\t" || char === "\n"; }

const PUNCTUATION = {
    "+": "plus",
    "-": "minus", "*": "mul",

    ".": "dot",
    ":": "colon",
    "(": "lparen",
    ")": "rparen",
    ";": "semi",
    ",": "comma",
    "{": "lbrace",
    "}": "rbrace",
    "[": "lbracket",
    "]": "rbracket",
};
function isPunctuation(char) { return PUNCTUATION[char] !== undefined; }

function lexState(state) {

    let char;
    while (char !== "") {
        char = currentChar(state);

        if (isNumeric(char)) {
            lexNumber(state);
        } else if (char === "\"") {
            lexString(state);
        } else if (isIdentifierStart(char)) {
            lexWord(state);
        } else if (isPunctuation(char)) {
            lexPunctuation(state);
        } else if (char === "<" || char === ">") {
            lexLessOrGreaterThan(state);
        } else if (char === "=") {
            lexEqual(state);
        } else if (char === "!") {
            lexNot(state);
        } else if (char === "|" || char === "&") {
            lexBoolean(state);
        } else if (isWhitespace(char)) {
            advanceChar(state);
        } else if (char !== "") {
            throw new Error("unexpected character '" + char + "'");
        }
    }

    return state;
}

function lexNumber(state) {
    let char = currentChar(state);
    let value = 0;

    while (isNumeric(char)) {
        value = value * 10 + numericCharToNumber(char);
        char = advanceChar(state);
    }
    state.tokens.push({
        type: "number",
        value,
    });
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
    state.tokens.push({
        type: "string",
        value,
    });
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
    state.tokens.push({
        type: "word",
        value,
    });
}

function lexPunctuation(state) {
    const char = currentChar(state);
    const type = PUNCTUATION[char];

    advanceChar(state);
    state.tokens.push({
        type,
    });
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

    state.tokens.push({ type });
}

function lexEqual(state) {
    advanceChar(state);

    const second = currentChar(state);
    const third = nextChar(state);

    if (second === "=" && third === "=") {
        advanceChar(state);
        advanceChar(state);
        state.tokens.push({ type: "eqeqeq" });
    } else if (second === "=") {
        throw new Error("== is not supported");
    } else {
        state.tokens.push({ type: "eq" });
    }
}

function lexBoolean(state) {
    const char = currentChar(state);
    const next = nextChar(state);
    const token = char + next;

    if (token === "||") {
        state.tokens.push({ type: "or" });
    } else if (token === "&&") {
        state.tokens.push({ type: "and" });
    } else {
        throw new Error("unexpected character '" + next + "'");
    }

    advanceChar(state);
    advanceChar(state);
}

function lexNot(state) {
    advanceChar(state);

    const second = currentChar(state);
    const third = nextChar(state);

    if (second === "=" && third === "=") {
        advanceChar(state);
        advanceChar(state);
        state.tokens.push({ type: "noteqeq" });
    } else {
        state.tokens.push({ type: "not" });
    }
}
