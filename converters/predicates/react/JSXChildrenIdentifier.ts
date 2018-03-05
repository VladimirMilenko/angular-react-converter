import { JSXExpressionContainer, isCallExpression, CallExpression, isMemberExpression, MemberExpression, isIdentifier, Identifier } from "babel-types";
import { ParserPredicate } from "../predicate";

export class JSXChildrenIdentifier implements ParserPredicate {
    matchingType = 'JSXExpressionContainer';
    parse(token:JSXExpressionContainer):any {
        const expression = token.expression as Identifier;
        const baseObject = expression.name;
        return {
            type: 'ChildrenIdentifier',
            value: {
                type: 'Identifier',
                name: baseObject
            }
        }
    }
    isMatching(token:JSXExpressionContainer):boolean {
        if(isIdentifier(token.expression) && (token.expression as Identifier).name === 'children') return true;
        return false;
    }
}