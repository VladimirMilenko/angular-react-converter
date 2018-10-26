import { resolverRegistry } from "../../../helpers";
import {
  isIdentifier,
  isMemberExpression,
  isObjectPattern,
  isThisExpression,
  MemberExpression,
  VariableDeclarator,
  isCallExpression,
  isVariableDeclaration,
  isStringLiteral,
  isBooleanLiteral,
  isNumberLiteral
} from "babel-types";
import traverse from "babel-traverse";

export interface VariableOptions {
  mutations?: Array<any>;
  value: any;
}

const isPrimitive = (init: Expression) => {
  return (
    isStringLiteral(init) || isNumberLiteral(init) || isBooleanLiteral(init)
  );
};

const resolveObjectPattern = (
  identifier: string,
  declaratorNode: VariableDeclarator,
  options: VariableOptions = {}
) => {
  let newIdentifier = identifier;
  if (
    isObjectPattern(declaratorNode.id) &&
    isMemberExpression(declaratorNode.init)
  ) {
    const init = declaratorNode.init as MemberExpression;

    if (isThisExpression(init.object) && isIdentifier(init.property)) {
      newIdentifier = resolverRegistry.registerVariable(
        identifier,
        init.property.name === "props" ? "Input" : "Local",
        {
          ...options
        }
      );
    }
  }
  return newIdentifier;
};

function resolveIdentifierDeclaration(
  identifier: string,
  declaratorNode: VariableDeclarator,
  options: VariableOptions = {}
) {
  if (isCallExpression(declaratorNode.init)) {
    const newArguments = declaratorNode.init.arguments.map(argument => {
      if (isIdentifier(argument)) {
        return resolveVariable(argument, argument.name);
      } else {
        return argument;
      }
    });

    resolverRegistry.registerVariable(
      identifier,
      "LocalFunctionCall",
      {
        init: declaratorNode.init.callee,
        arguments: newArguments
      }
    )
  }

  if (isIdentifier(declaratorNode.init)) {
    resolverRegistry.registerVariable(
      declaratorNode.init.name,
      "Local"
    );
  }

  if (isPrimitive(declaratorNode.init)) {
    resolverRegistry.registerVariable(identifier, "Local", {
      init: declaratorNode.init,
      primitive: true,
    });
  }

  return newIdentifier;
}

export const resolveVariable = (
  identifier: string,
  options?: VariableOptions
) => {
  let newIdentifier = identifier;
  traverse(resolverRegistry.ast, {
    enter: path => {
      if (!path.isIdentifier({name: identifier})) return;
      const bindings = path.scope.getAllBindings();
      if (bindings[identifier]) {
        const binding = bindings[identifier];
        const declaratorNode = binding.path.node as VariableDeclarator;
        if (declaratorNode && declaratorNode.id) {
          switch (declaratorNode.id.type) {
            case "ObjectPattern":
              resolveObjectPattern(
                identifier,
                declaratorNode,
                options
              );
              break;
            case "Identifier":
              resolveIdentifierDeclaration(
                identifier,
                declaratorNode,
                options
              );
              break;
          }
        }
      }
    }
  });
  return newIdentifier;
};
