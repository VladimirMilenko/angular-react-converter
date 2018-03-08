import { AttributeNode, RenderNode, TextNode } from "../../declarations";
import { angularGenerator } from './AngularBootstrap';
import { isMemberExpression } from "babel-types";
import {resolverRegistry} from "../../helpers";

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
  switch (attribute.name) {
    case 'className':
      return {name:"class", value:attribute.value.value};
    default:
      return {name:attribute.name, value:attribute.value.value};
  }
}
const getAttributes = (attributes: any) => {
  return attributes.map((x: any) => convertAttribute(x));
}

export class RenderNodeGenerator implements Generator {
  matchingType = 'RenderNode';
  generate(node: any):any {
    let htmlNode = {
      nodeName: node.identifier.value,
      tagName: node.identifier.value,
      attrs: getAttributes(node.attributes || []),
      childNodes: new Array<any>(),
    };

    if(node.children.length) {
      htmlNode.childNodes = [];
      for (let child of node.children) {
        htmlNode.childNodes.push(angularGenerator.generate(child));
      }
    }
    return htmlNode;
  }

}

export class ForLoopGenerator implements Generator {
  matchingType = 'ForLoop';

  generate(node: any):any {
    const children = node.children;
    let key;
    const attrs:Array<any> = getAttributes(children.attributes.filter((x:any)=>x.name !== 'key'));
    const originalName = resolverRegistry.vars.get(node.baseItem.name);
    attrs.push({
      name:'*ngFor',
      value: `let ${node.arguments[0].name} of ${originalName && originalName.name}`
    });
    const htmlNode = {
      tagName:children.identifier.value,
      nodeName:children.identifier.value,
      attrs: attrs,
      childNodes: new Array<any>(),
    };
    let keyAttribute = children.attributes.find((x:any) => x.name === 'key');

    if (keyAttribute) {
      if (isMemberExpression(keyAttribute.value)) {
        const {value} = keyAttribute;
        key = `${value.object.name}.${value.property.name}`;
      }
    }
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
