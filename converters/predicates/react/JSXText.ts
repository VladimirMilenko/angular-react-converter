import { ParserPredicate } from "../predicate";
import { isJSXText, JSXText } from "babel-types";

export class JSXTextPredicate implements ParserPredicate {
    matchingType = "JSXText";

    isMatching(token:JSXText):boolean {
        return isJSXText(token);
    }

    parse(token:JSXText):any {
        return {
            type: "JSXTextNode",
            value: {
                type: token.type,
                value: token.value
            }
        }
    }
}