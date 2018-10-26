import { JSXExpressionContainer, isIdentifier, Identifier } from "babel-types";
import { ParserPredicate } from "../predicate";
import {resolveVariable} from "./InputPropsResolver";


export class JSXExpressionIdentifier implements ParserPredicate {
    matchingType = 'JSXExpressionContainer';
    parse(token: JSXExpressionContainer): any {
        const expression = token.expression as Identifier;
        const baseObject = resolveVariable(expression.name);
        return {
            type: 'RenderIdentifier',
            value: {
                type: 'Identifier',
                name: baseObject
            }
        }
    }
    isMatching(token: JSXExpressionContainer): boolean {
        if (isIdentifier(token.expression) && !((token.expression as Identifier).name === 'children')) return true;
        return false;
    }
}
