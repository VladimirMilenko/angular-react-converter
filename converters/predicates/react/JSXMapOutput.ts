import { JSXExpressionContainer, isCallExpression, CallExpression, isMemberExpression, MemberExpression, isIdentifier, Identifier, isArrowFunctionExpression, ArrowFunctionExpression, isJSXElement, JSXElement } from "babel-types";
import { ParserPredicate } from "../predicate";

export class JSXMapOutput implements ParserPredicate {
    matchingType = 'ArrowFunctionExpression';
    parse(token:ArrowFunctionExpression):any {
        const expression = token.body;
        
        return true;
    }
    isMatching(token:ArrowFunctionExpression):boolean {
        if(!isArrowFunctionExpression(token)) return false;
        const body = token.body as JSXElement;
        
        return isJSXElement(body);
    }
}