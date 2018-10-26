import { resolverRegistry, Variable } from "../../helpers";
import generator from "babel-generator";
import * as b from "babel-types";

const inputDecorator = b.decorator(b.callExpression(b.identifier("Input"), []));

const extend = (a: any, b: any) => Object.assign(a, b);

const generateMutatableVariable = (variable: Variable): Array<any> => {
  if (!variable.options || !variable.options.mutations) return [];
  return [
    extend(b.classProperty(b.identifier("_" + variable.name), undefined), {
      accessibility: "private"
    }),
    extend(
      b.classMethod(
        "set",
        b.identifier(variable.name),
        [b.identifier(variable.name)],
        b.blockStatement([
          b.expressionStatement(
            b.assignmentExpression(
              "=",
              b.memberExpression(
                b.thisExpression(),
                b.identifier("_" + variable.name)
              ),
              variable.options.mutations[0].object
            )
          )
        ]),
        false
      ),
      {
        decorators: [inputDecorator]
      }
    ),
    b.classMethod(
      "get",
      b.identifier(variable.name),
      [],
      b.blockStatement([
        b.returnStatement(
          b.memberExpression(
            b.thisExpression(),
            b.identifier("_" + variable.name)
          )
        )
      ]),
      false
    )
  ];
};

export class AngularComponentGenerator {
  generateInputProps(): Array<any> {
    const declarations: Array<any> = [];
    resolverRegistry.vars.forEach((value, key, map1) => {
      switch (value.type) {
        case "Input":
          if (
            value.options &&
            value.options.mutations &&
            value.options.mutations.length
          ) {
            declarations.push(...generateMutatableVariable(value));
          } else {
            declarations.push(
              b.classProperty(b.identifier(value.name), undefined, undefined, [
                inputDecorator
              ])
            );
          }
      }
    });
    return declarations;
  }
  generate(name: string, originalName: string) {
    const src = b.file(
      b.program([
        b.importDeclaration(
          [
            b.importSpecifier(
              b.identifier("Component"),
              b.identifier("Component")
            ),
            b.importSpecifier(b.identifier("Input"), b.identifier("Input"))
          ],
          b.stringLiteral("@angular/core")
        ),
        b.exportNamedDeclaration(
          b.classDeclaration(
            b.identifier(originalName),
            undefined,
            b.classBody([...this.generateInputProps()]),
            [
              b.decorator(
                b.callExpression(b.identifier("Component"), [
                  b.objectExpression([
                    b.objectProperty(
                      b.identifier("selector"),
                      b.stringLiteral(name),
                      false,
                      false,
                      []
                    ),
                    b.objectProperty(
                      b.identifier("templateUrl"),
                      b.stringLiteral(`./${name}.component.html`),
                      false,
                      false,
                      []
                    )
                  ])
                ])
              )
            ]
          ),
          [],
          undefined
        )
      ])
    );

    return generator(src).code;
  }
}
