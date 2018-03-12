import {resolverRegistry} from "../../../helpers";
import {
  isIdentifier,
  isMemberExpression,
  isObjectPattern,
  isThisExpression,
  MemberExpression,
  VariableDeclarator
} from "babel-types";
import traverse from "babel-traverse";

export interface VariableOptions  {
  mutations?: Array<any>
}

const resolveObjectPattern = (identifier: string, declaratorNode:VariableDeclarator, options:VariableOptions = {}) => {
  let newIdentifier = identifier;
  if (isObjectPattern(declaratorNode.id) && isMemberExpression(declaratorNode.init)) {
    const init = declaratorNode.init as MemberExpression;
    if (isThisExpression(init.object) && isIdentifier(init.property)) {
      newIdentifier = resolverRegistry.registerVariable(identifier, init.property.name === 'props' ? 'Input' : 'Local', options);
    }
  }
  return newIdentifier;
};

function resolveIdentifierDeclaration(identifier: string, declaratorNode: VariableDeclarator, options:VariableOptions = {}) {
  let newIdentifier = identifier;
  if(isIdentifier(declaratorNode.init)) {
    newIdentifier = resolveVariable(declaratorNode.init, declaratorNode.init.name);
  }
  return newIdentifier;
}

export const resolveVariable = (token:any, identifier:string, options?: VariableOptions) => {
  let newIdentifier = identifier;
  traverse(resolverRegistry.ast, {
    enter: (path) => {
      if (path.node !== token) return;
      if (path.scope.bindings[identifier]) {  
        const binding = path.scope.bindings[identifier];
        const declaratorNode = binding.path.node as VariableDeclarator;
        switch (declaratorNode.id.type) {
          case 'ObjectPattern':
            return resolveObjectPattern(identifier, declaratorNode, options);
          case 'Identifier':
            return resolveIdentifierDeclaration(identifier, declaratorNode, options);
        }

      }
    }
  });
  return newIdentifier;
};
