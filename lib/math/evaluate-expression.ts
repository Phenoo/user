const TOKEN_PATTERN = /sqrt|\d+(?:\.\d*)?|\.\d+|[()+\-*/^]/gi;

export function evaluateArithmeticExpression(expression: string): number {
  const normalized = expression.toLowerCase().replace(/\s+/g, "");
  if (!normalized || normalized.length > 200) {
    throw new Error("Invalid mathematical expression");
  }

  const tokens = normalized.match(TOKEN_PATTERN) ?? [];
  if (tokens.join("") !== normalized) {
    throw new Error("Invalid mathematical expression");
  }

  let position = 0;

  const parsePrimary = (): number => {
    const token = tokens[position];

    if (token === "(") {
      position += 1;
      const value = parseExpression();
      if (tokens[position] !== ")") {
        throw new Error("Invalid mathematical expression");
      }
      position += 1;
      return value;
    }

    if (token === "sqrt") {
      position += 1;
      const value = parsePrimary();
      if (value < 0) {
        throw new Error("Invalid mathematical expression");
      }
      return Math.sqrt(value);
    }

    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new Error("Invalid mathematical expression");
    }
    position += 1;
    return value;
  };

  const parseUnary = (): number => {
    if (tokens[position] === "+") {
      position += 1;
      return parseUnary();
    }
    if (tokens[position] === "-") {
      position += 1;
      return -parseUnary();
    }
    return parsePrimary();
  };

  const parsePower = (): number => {
    const base = parseUnary();
    if (tokens[position] === "^") {
      position += 1;
      return Math.pow(base, parsePower());
    }
    return base;
  };

  const parseTerm = (): number => {
    let value = parsePower();
    while (tokens[position] === "*" || tokens[position] === "/") {
      const operator = tokens[position];
      position += 1;
      const operand = parsePower();
      value = operator === "*" ? value * operand : value / operand;
    }
    return value;
  };

  function parseExpression(): number {
    let value = parseTerm();
    while (tokens[position] === "+" || tokens[position] === "-") {
      const operator = tokens[position];
      position += 1;
      const operand = parseTerm();
      value = operator === "+" ? value + operand : value - operand;
    }
    return value;
  }

  const result = parseExpression();
  if (position !== tokens.length || !Number.isFinite(result)) {
    throw new Error("Invalid mathematical expression");
  }

  return result;
}
