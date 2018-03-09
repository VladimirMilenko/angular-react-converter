import { ParserPredicate } from "../converters/predicates/predicate";
import { JSXTextPredicate } from "../converters/predicates/react/JSXText";
import { JSXElementPredicate } from "../converters/predicates/react/JSXElement";
import { JSXMapOutput } from "../converters/predicates/react/JSXMapOutput";
import { JSXExpressionMap } from "../converters/predicates/react/JSXExpressionMap";
import { JSXExpressionIdentifier } from "../converters/predicates/react/JSXExpressionIdentifier";
import { JSXChildrenIdentifier } from "../converters/predicates/react/JSXChildrenIdentifier";
import * as uuidv1 from 'uuid';
import * as equal from 'deep-equal';
import { VariableOptions } from "converters/predicates/react/InputPropsResolver";

interface ArrayConstructor {
    from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Array<U>;
    from<T>(arrayLike: ArrayLike<T>): Array<T>;
}

function isUpperCase(aCharacter:string):boolean
{
    return (aCharacter >= 'A') && (aCharacter <= 'Z');
}

export const convertComponentName = (name:string) => {
    let newName = Array.from(name).map((x,index)=>{
        if(isUpperCase(x) && index !== 0) {
            return '-'+x;
        }
        return x;
    });

    return newName.join('').toLowerCase();
}


export interface Variable {
  type: "Local" | "Input",
  name: string,
  options?: VariableOptions
}
class ResolversRegistry {
    resolvers: Array<ParserPredicate>;
    ast:any;
    vars: Map<string, Variable> = new Map<string, Variable>();

    constructor() {
        this.resolvers = [
            new JSXTextPredicate(),
            new JSXElementPredicate(),
            new JSXMapOutput(),
            new JSXExpressionMap(),
            new JSXExpressionIdentifier(),
            new JSXChildrenIdentifier(),
        ];
    }
    registerVariable(variableName:string, variableType: "Local" | "Input", options?: VariableOptions):string {
      let existingKey = null;
      this.vars.forEach((value, key)=> {
        if(value.name === variableName && value.type === variableType && equal(value.options, options)) {
          existingKey = key;
        }
      });
      if(existingKey) return existingKey;

      const id = uuidv1.v4();

      this.vars.set(id, {
        name:variableName,
        type: variableType,
        options: options || {}
      });
      return id;
    }
    addResolver(resolver:ParserPredicate) {
        this.resolvers.push(resolver);
    }
    setAst(ast:any) {
        this.ast = ast;
    }
    resolve(input:any) {
        const resolvers = this.resolvers.filter(x=>x.matchingType === input.type);
        if(!resolvers.length) throw new Error(`Unable to resolve type ${input.type}`);
        const finalResolver = resolvers.find(x=>x.isMatching(input));
        if(!finalResolver) throw new Error(`No resolver found to match current input: ${input.type}`);

        return finalResolver.parse(input);
    }
}

export const resolverRegistry = new ResolversRegistry();
