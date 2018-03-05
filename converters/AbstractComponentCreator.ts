import { Strategy } from './strategies/IStrategy';
import { ReactClassStrategy } from './strategies/ReactClassStrategy';
import {AttributeNode, RenderNode, TextNode} from "../declarations";
import {JSXExpressionMap} from './predicates/react/JSXExpressionMap';

export class AbstractComponentCreator {
    currentAst: any;
    strategy: Strategy;

    constructor(code:string) {
        this.strategy = new ReactClassStrategy(code, [new JSXExpressionMap()]);
    }
    convertToAbstractTree():RenderNode {
        console.log(`Starting convertation using ${this.strategy.name}`);
        return this.strategy.convert();
    }

    static createRenderNode(identifier:string,children:Array<RenderNode|TextNode>, attributes: Array<any>, selfClosing: boolean) {
      return {
        type: "RenderNode",
        identifier: {
          type: "Identifier",
          value: identifier,
        },
        children: children,
        attributes: attributes,
        selfClosing: selfClosing
      }
    }
    static createTextNode(text:string):TextNode {
      return {
        type: 'TextNode',
        value: text
      }
    }
}
