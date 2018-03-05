import { JSXExpressionContainer, isCallExpression, CallExpression, isMemberExpression, MemberExpression, isIdentifier, Identifier } from "babel-types";
import { ParserPredicate } from "../predicate";
import { resolverRegistry } from "../../../helpers";
import * as types from 'ast-types';



export class JSXExpressionIdentifier implements ParserPredicate {
    matchingType = 'JSXExpressionContainer';
    parse(token: JSXExpressionContainer): any {
        const expression = token.expression as Identifier;
        const baseObject = expression.name;
        types.visit(resolverRegistry.ast, {
            visitJSXExpressionContainer: function (path) {
                if (path.node === token) {
                    console.log(types.Scope);
                    console.log('found current token!');
                    let temp = path;
                    while (!temp.scope.lookup(baseObject)) {
                        temp = temp.parentPath;
                        console.log(temp.scope);
                    }
                    this.abort();
                }
                this.traverse(path);
            }
        });

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