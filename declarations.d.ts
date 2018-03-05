/// <reference path="node_modules/parse5/lib/index.d.ts" />

//@ts-ignore
declare module 'recast';
declare module 'escope';
import {Identifier, Expression} from 'babel-types';

declare interface AttributeNode {
  name: string,
  value: {
    type: string,
    value: any,
  },
}
declare interface TextNode {
  type: string,
  value: string,
}
declare interface RenderNode {
  identifier: {
    type: string,
    value: string,
  },
  type: string,
  children: Array<RenderNode|TextNode>,
  attributes: Array<AttributeNode>,
  selfClosing: boolean,
}

declare module 'clear-html';
