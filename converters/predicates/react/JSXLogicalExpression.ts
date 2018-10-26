import {
  JSXExpressionContainer,
  isCallExpression,
  CallExpression,
  isMemberExpression,
  MemberExpression,
  isIdentifier,
  Identifier,
  ArrowFunctionExpression,
  isObjectPattern,
  VariableDeclarator,
  isThisExpression,
  isLogicalExpression,
  LogicalExpression,
  isJSXElement,
  JSXElement,
  isUnaryExpression,
  isConditionalExpression,
  ConditionalExpression
} from "babel-types";
import { ParserPredicate } from "../predicate";
import { JSXMapOutput } from "./JSXMapOutput";
import { resolverRegistry } from "../../../helpers";
import traverse from "babel-traverse";
import {parse} from 'babylon';
import generateFromAST from 'babel-generator';
import { resolveVariable } from "./InputPropsResolver";

const getASTFromCode = (node) => {
  const code = generateFromAST(node).code;

  return parse(code, {
    sourceType: 'module',
    plugins: [
      'jsx'
    ]
  });

}

const registerVariablesInNode = (node) => {
  const conditionAST = getASTFromCode(node);

  traverse(conditionAST, {
    enter: (path) => {
      if(isIdentifier(path.node)) {
        resolveVariable(path.node.name);
      }
    }
  });
}


export class JSXLogicalExpressionContainer implements ParserPredicate {
  matchingType = "JSXExpressionContainer";

  parse(token: JSXExpressionContainer): any {
    const expression = token.expression as LogicalExpression;

    const right = expression.right as JSXElement;

    registerVariablesInNode(expression.left);


    return {
      type: "LogicalRender",
      condition: {
        type: "LogicalExpression",
        value: expression.left
      },
      children: resolverRegistry.resolve(expression.right)
    };
  }

  isMatching(token: JSXExpressionContainer): boolean {
    if (!isLogicalExpression(token.expression)) return false;
    const expression = token.expression as LogicalExpression;

    if (!isJSXElement(expression.right)) return false;

    if (
      isIdentifier(expression.left) ||
      isLogicalExpression(expression.left) ||
      isUnaryExpression(expression.left)
    )
      return true;

    return false;
  }
}

export class JSXConditionalExpressionContainer implements ParserPredicate {
  matchingType = "JSXExpressionContainer";

  parse(token: JSXExpressionContainer): any {
    // { loading ? <div>{loading}</div> : <div>test 2</div> }
    const expression = token.expression as ConditionalExpression;

    registerVariablesInNode(expression);

    const consequent = expression.consequent as JSXElement;
    const alternate = expression.alternate as JSXElement;

    return {
      type: "ConditionalRender",
      condition: {
        type: "LogicalExpression",
        value: expression.test // AST node, UST
      },
      consequent: resolverRegistry.resolve(consequent),
      alternate: resolverRegistry.resolve(alternate),
    };
  }

  isMatching(token: JSXExpressionContainer): boolean {
    if (!isConditionalExpression(token.expression)) return false;
    const expression = token.expression as ConditionalExpression;

    if (
      !isJSXElement(expression.consequent) ||
      !isJSXElement(expression.alternate)
    )
      return false;

    if (
      isIdentifier(expression.test) ||
      isLogicalExpression(expression.test) ||
      isUnaryExpression(expression.test)
    )
      return true;

    return false;
  }
}
