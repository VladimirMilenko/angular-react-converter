import {
  JSXExpressionContainer,
  isCallExpression,
  CallExpression,
  isMemberExpression,
  MemberExpression,
  isIdentifier,
  Identifier,
  ArrowFunctionExpression,
  isObjectPattern, VariableDeclarator, isThisExpression,
} from "babel-types";
import {ParserPredicate} from "../predicate";
import {JSXMapOutput} from './JSXMapOutput';
import {resolverRegistry} from "../../../helpers";
import traverse from 'babel-traverse';
import {resolveVariable} from "./InputPropsResolver";

export class JSXExpressionMap implements ParserPredicate {
  matchingType = 'JSXExpressionContainer';

  parse(token: JSXExpressionContainer): any {
    const expression = token.expression as CallExpression;

    const callee = expression.callee as MemberExpression;
    const baseObject = (callee.object as Identifier).name;
    const arrowExpression = expression.arguments[0] as ArrowFunctionExpression;
    const renderOutput = resolverRegistry.resolve(arrowExpression.body);

    let baseItem = this.getBaseObjectName(callee);
    let newBaseItem = resolveVariable(token, baseItem);
    return {
      type: 'ForLoop',
      baseItem: {
        type: 'Identifier',
        name: newBaseItem
      },
      arguments: arrowExpression.params,
      children: renderOutput,
      mutations: this.getMutations(callee)
    }
  }

  getBaseObjectName(callee: MemberExpression) {
    let temp = callee;
    while (!isIdentifier(temp.object)) {
      temp = temp.object.callee;
    }
    return (temp.object as Identifier).name;
  }

  getMutations(callee: MemberExpression) {
    if (!isCallExpression(callee.object)) return [];
    return [callee];
  }

  isMatching(token: JSXExpressionContainer): boolean {
    if (!isCallExpression(token.expression)) return false;
    const expression = token.expression as CallExpression;


    if (!isMemberExpression(expression.callee)) return false;
    const callee = expression.callee as MemberExpression;

    if (!isIdentifier(callee.property)) return false;
    const fnToBeCalled = (callee.property as Identifier).name;

    if (fnToBeCalled === 'map') {
      return true;
    }
    return false;

  }
}
