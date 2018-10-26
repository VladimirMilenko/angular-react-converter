import { AttributeNode, RenderNode, TextNode } from "../../declarations";
import { angularGenerator } from './AngularBootstrap';
import { isMemberExpression } from "babel-types";
import {resolverRegistry, convertComponentName} from "../../helpers";
import generateFromAST from 'babel-generator';

export interface Generator {
  matchingType: string;
  generate: (node: any) => any;
}

export class TextGenerator implements Generator {
  matchingType = 'JSXTextNode';
  generate(node: any): any {
    return {
      nodeName: "#text",
      value: node.value.value
    };
  }
}
const convertAttribute = (attribute: any) => {
  switch (attribute.value.type) {
    case 'MemberExpression':
      return {name: `[${attribute.name}]`, value: generateFromAST(attribute.value.value).code};
    case 'StringLiteral':
      return {name: attribute.name === 'className' ? "class": attribute.name, value:attribute.value.value};
    case 'Identifier':
      return {name: `[${attribute.name}]`, value: attribute.value.value}
    default:
      return {name:attribute.name, value:attribute.value};
  }
}
const getAttributes = (attributes: any) => {
  return attributes.map((x: any) => convertAttribute(x));
}

const isReactComponent = (tag:string) => {
  const firstLetter = tag.charAt(0);

  return firstLetter === firstLetter.toUpperCase();
}

export class RenderNodeGenerator implements Generator {
  matchingType = 'RenderNode';
  generate(node: any):any {
    const tagName = isReactComponent(node.identifier.value) ? convertComponentName(node.identifier.value) : node.identifier.value;

    let htmlNode = {
      nodeName: tagName,
      tagName: tagName,
      attrs: getAttributes(node.attributes || []),
      childNodes: new Array<any>(),
    };

    if(node.children.length) {
      htmlNode.childNodes = [];
      for (let child of node.children) {
        const children = angularGenerator.generate(child);
        if(Array.isArray(children)) {
          htmlNode.childNodes.push(...children);
        } else {
          htmlNode.childNodes.push(children);
        }
      }
    }
    return htmlNode;
  }

}

export class ForLoopGenerator implements Generator {
  matchingType = 'ForLoop';

  generate(node: any):any {
    const children = node.children;
    const childTag = children.identifier.value;
    let key;
    const attrs:Array<any> = getAttributes(children.attributes.filter((x:any)=>x.name !== 'key'));
    const originalName = resolverRegistry.vars.get(node.baseItem.name);

    attrs.unshift({
      name:'*ngFor',
      value: `let ${node.arguments[0].name} of ${originalName && originalName.name}`
    });

    const tagName = isReactComponent(childTag)
      ? convertComponentName(childTag)
      : childTag;

    const htmlNode = {
      tagName,
      nodeName:tagName,
      attrs: attrs,
      childNodes: new Array<any>(),
    };

    //TODO: Fix issue with keys, by generating the function.

    /*
    let keyAttribute = children.attributes.find((x:any) => x.name === 'key');

    if (keyAttribute) {
      if (isMemberExpression(keyAttribute.value)) {
        const {value} = keyAttribute;
        key = generateFromAST(keyAttribute).code;
      }
    }
    */
    for (let child of children.children) {
      htmlNode.childNodes.push(angularGenerator.generate(child));
    }
    return htmlNode;
  }
}

export class RenderIdentifierGenerator implements Generator {
  matchingType = 'RenderIdentifier';
  generate(node: any):any {
    const originalName = resolverRegistry.vars.get(node.value.name);
    return {
      nodeName:'#text',
      value: `{{${originalName ? originalName.name : node.value.name}}}`
    };
  }
}

export class ChildrenIdentifierGenerator implements Generator {
  matchingType = 'ChildrenIdentifier';
  generate(node: any) {
    return {
      nodeName:'ng-content',
      tagName:'ng-content',
      attrs: [],
      childNodes: [],
    };
  }
}

export class LogicalRenderGenerator implements Generator {
  matchingType = 'LogicalRender';
  generate(node: any, generator) {
    const children = generator(node.children);
    children.attrs.push({
      name:'*ngIf',
      value: generateFromAST(node.condition.value).code
    });
    return {
      ...children,
    }
  }
}

export class ConditionalRenderGenerator implements Generator {
  matchingType = 'ConditionalRender';

  generate(node: any, generator) {
    const consequent = generator(node.consequent);
    const alternate = generator(node.alternate);

    let condition = generateFromAST(node.condition.value).code.replace(' ', '');
    const isNegative = condition.startsWith('!');
    const conditionBaseText = condition.charAt(0).toUpperCase() + condition.slice(1);

    const conditionText = isNegative ? `tmpl_Not${conditionBaseText}` : `tmpl_${conditionBaseText}`;

    const reverseCondition = isNegative ? `tmpl_${conditionBaseText}` : `tmpl_Not${conditionBaseText}`;

    const consequentNode = {
      nodeName: 'ng-template',
      tagName: 'ng-template',
      attrs: [{
        name: `#${conditionText}`,
        value: ''
      }],
      childNodes: [consequent]
    };

    const alternateNode =  {
      nodeName: 'ng-template',
      tagName: 'ng-template',
      attrs: [{
        name: `#${reverseCondition}`,
        value: '',
      }],
      childNodes: [alternate]
    };

    const container = {
      nodeName:'ng-container',
      tagName:'ng-container',
      attrs: [{
        name:'*ngIf',
        value: `${condition}; then ${conditionText}; else ${reverseCondition}`
      }],
      childNodes: [],
    }
    return [
      container,
      consequentNode,
      alternateNode
    ]
  }
}
