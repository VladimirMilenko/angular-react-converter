import { Strategy } from "./IStrategy";
import {
  File,
  ClassDeclaration,
  Statement,
  MemberExpression,
  Identifier,
  ClassMethod,
  ReturnStatement,
  isClass
} from "babel-types";
import { parse } from "babylon";
import traverse from "babel-traverse";
import { ParserPredicate } from "../predicates/predicate";
import { resolverRegistry, convertComponentName } from "../../helpers";

export class ReactClassStrategy implements Strategy {
  name = "ReactClassStrategy";

  predicates: Array<ParserPredicate>;
  code: string;
  ast: File;
  props: any;
  constructor(code: string, predicates: Array<ParserPredicate>) {
    this.code = code;

    this.predicates = predicates;
    this.ast = parse(this.code, {
      sourceType: "module",
      plugins: ["jsx"]
    });
    resolverRegistry.setAst(this.ast);
  }

  get reactComponentClass(): ClassDeclaration {
    return this.ast.program.body.find(token => {
      if (!isClass(token)) return false;
      token = token as ClassDeclaration;
      if (!ReactClassStrategy.hasSuperClass(token as ClassDeclaration))
        return false;
      const superClass = token.superClass as MemberExpression | Identifier;
      return ReactClassStrategy.isReactClass(superClass);
    }) as ClassDeclaration;
  }

  convert(): any {
    const componentClass = this.reactComponentClass;
    const componentName = convertComponentName(
      this.reactComponentClass.id.name
    );
    const renderMethod = this.getReactRenderMethod(componentClass);
    console.log(componentName);
    return { node: this.parseRenderMethod(renderMethod), name: componentName, originalName: this.reactComponentClass.id.name };
  }
  parseRenderMethod(renderMethod: ClassMethod): any {
    //ignore any operations in render others than return statement
    const returnStatement = renderMethod.body.body.find(
      token => token.type === "ReturnStatement"
    ) as ReturnStatement;
    return resolverRegistry.resolve(returnStatement.argument);
  }
  getReactRenderMethod(componentClass: ClassDeclaration): ClassMethod {
    return componentClass.body.body.find(token => {
      if (token.type !== "ClassMethod") return false;
      return ReactClassStrategy.isRenderMethod(token);
    }) as ClassMethod;
  }

  static isRenderMethod(token: ClassMethod) {
    const key = token.key as Identifier;
    return key.name == "render";
  }

  static hasSuperClass(token: ClassDeclaration) {
    return token.superClass !== null;
  }

  static isReactClass(superClass: MemberExpression | Identifier) {
    if (superClass.type === "Identifier") {
      return (superClass as Identifier).name === "Component";
    } else if (superClass.type === "MemberExpression") {
      superClass = superClass as MemberExpression;
      return (
        (superClass.object as Identifier).name === "React" &&
        (superClass.property as Identifier).name === "Component"
      );
    }
    return false;
  }
}
