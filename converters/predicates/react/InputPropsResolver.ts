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

export const resolveVariable = (token:any, identifier:string) => {
  let newIdentifier = identifier;
  traverse(resolverRegistry.ast, {
    enter: (path) => {
      if (path.node !== token) return;
      if (path.scope.bindings[identifier]) {
        const binding = path.scope.bindings[identifier];
        const declaratorNode = binding.path.node as VariableDeclarator;
        if (isObjectPattern(declaratorNode.id) && isMemberExpression(declaratorNode.init)) {
          const init = declaratorNode.init as MemberExpression;
          if (isThisExpression(init.object) && isIdentifier(init.property)) {
            newIdentifier = resolverRegistry.registerVariable(identifier, init.property.name === 'props' ? 'Input' : 'Local');
          }
        }
      }
    }
  });
  return newIdentifier;
};
