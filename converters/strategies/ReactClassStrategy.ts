import { Strategy } from "./IStrategy";
import {
  File, JSXIdentifier, ClassDeclaration, Statement, MemberExpression, Identifier, ClassMethod, ReturnStatement, JSXElement,
  JSXAttribute,
  JSXExpressionContainer,
  JSXText,
} from 'babel-types';
import { parse } from 'babylon';
import * as types from 'ast-types';
import * as escope from 'escope';
import { AbstractComponentCreator } from "../AbstractComponentCreator";
import { AttributeNode, RenderNode, TextNode } from "../../declarations";
import { ParserPredicate } from '../predicates/predicate';
import {resolverRegistry} from '../../helpers';


export class ReactClassStrategy implements Strategy {
  name = 'ReactClassStrategy';

  predicates: Array<ParserPredicate>;
  code: string;
  ast: File;
  constructor(code: string, predicates: Array<ParserPredicate>) {
    this.code = code;

    this.predicates = predicates;
    this.ast = parse(this.code, {
      sourceType: 'module',
      ranges: false,
      plugins: [
        'jsx'
      ]
    });
    let scopeManager = escope.analyze(this.ast, {
      ecmaVersion: 6,
      sourceType: 'module'
    });
    let currentScope = scopeManager.acquire(this.ast);
    resolverRegistry.setAst(this.ast);
    types.visit(this.ast, {
      visitExpression: function(path) {
        this.traverse(path);
      }
    })

  }

  get reactComponentClass(): ClassDeclaration {
    return this.ast.program.body.find(token => {
      if (!ReactClassStrategy.isClass(token)) return false;
      token = token as ClassDeclaration;
      if (!ReactClassStrategy.hasSuperClass(token as ClassDeclaration)) return false;
      const superClass = token.superClass as MemberExpression | Identifier;
      return ReactClassStrategy.isReactClass(superClass);
    }) as ClassDeclaration;
  }

  convert(): any {
    const componentClass = this.reactComponentClass;
    const renderMethod = this.getReactRenderMethod(componentClass);
    return this.parseRenderMethod(renderMethod);
  }
  parseRenderMethod(renderMethod: ClassMethod): any {
    //ignore any operations in render others than return statement
    const returnStatement = renderMethod.body.body.find(token => token.type === 'ReturnStatement') as ReturnStatement;
    return resolverRegistry.resolve(returnStatement.argument);
  }
  getReactRenderMethod(componentClass: ClassDeclaration): ClassMethod {
    return componentClass.body.body.find(token => {
      if (token.type !== 'ClassMethod') return false;
      return ReactClassStrategy.isRenderMethod(token);
    }) as ClassMethod;
  }

  static isRenderMethod(token: ClassMethod) {
    const key = token.key as Identifier;
    return key.name == 'render';
  }

  static isClass(token: Statement) {
    return token.type == "ClassDeclaration";
  }

  static hasSuperClass(token: ClassDeclaration) {
    return token.superClass !== null;
  }

  static isReactClass(superClass: MemberExpression | Identifier) {
    if (superClass.type === 'Identifier') {
      return (superClass as Identifier).name === "Component"
    } else if (superClass.type === 'MemberExpression') {
      superClass = superClass as MemberExpression;
      return (superClass.object as Identifier).name === 'React' &&
        (superClass.property as Identifier).name === 'Component';
    }
    return false;
  }
}
