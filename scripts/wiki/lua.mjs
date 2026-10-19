// Evaluates a wiki data module (`return { ... }` of plain table literals) into JS values.
import luaparse from "luaparse";

function unquote(raw) {
  if (raw.startsWith("[")) return raw.replace(/^\[=*\[\n?/, "").replace(/\]=*\]$/, "");
  return raw.slice(1, -1).replace(/\\(.)/g, (_, c) => ({ n: "\n", t: "\t", r: "\r" })[c] ?? c);
}

function evaluate(node) {
  switch (node.type) {
    case "StringLiteral":
      return unquote(node.raw);
    case "NumericLiteral":
    case "BooleanLiteral":
      return node.value;
    case "NilLiteral":
      return null;
    case "UnaryExpression":
      if (node.operator === "-") return -evaluate(node.argument);
      break;
    case "BinaryExpression":
      if (node.operator === "..") return String(evaluate(node.left)) + String(evaluate(node.right));
      break;
    case "TableConstructorExpression":
      return evaluateTable(node);
  }
  throw new Error(`Unsupported Lua expression: ${node.type} at line ${node.loc?.start.line}`);
}

function evaluateTable(node) {
  if (node.fields.every((f) => f.type === "TableValue")) return node.fields.map((f) => evaluate(f.value));
  const obj = {};
  const positional = [];
  for (const f of node.fields) {
    if (f.type === "TableKey") obj[evaluate(f.key)] = evaluate(f.value);
    else if (f.type === "TableKeyString") obj[f.key.name] = evaluate(f.value);
    else positional.push(evaluate(f.value));
  }
  if (positional.length) obj.__list = positional;
  return obj;
}

export function evalLuaModule(source) {
  const ast = luaparse.parse(source, { comments: false, locations: true });
  const ret = ast.body.find((s) => s.type === "ReturnStatement");
  if (!ret) throw new Error("Module has no return statement");
  return evaluate(ret.arguments[0]);
}
