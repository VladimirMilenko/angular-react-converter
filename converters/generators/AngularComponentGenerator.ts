import {resolverRegistry} from "../../helpers";
import generator from 'babel-generator';
import * as b from 'babel-types';

export class AngularComponentGenerator {
  generateInputProps():Array<any> {
    const declarations:Array<any> = [];
    resolverRegistry.vars.forEach((value, key, map1) => {
      switch (value.type) {
        case 'Input':
          declarations.push(
            b.classProperty(
              b.identifier(value.name),
              undefined,
              undefined,
              [
                b.decorator(b.identifier('Input'))
              ]
            )
          );
      }
    });
    return declarations;
  }
  generate() {
      const src = b.file(
        b.program(
        [
          b.exportNamedDeclaration(
            b.classDeclaration(b.identifier('MyComponent'), undefined, b.classBody(
              [
                ...this.generateInputProps(),
              ]
            ),
              [
              b.decorator(b.callExpression(
                b.identifier('Component'),
                [
                  b.objectExpression( [
                    b.objectProperty(b.identifier('selector'),b.stringLiteral('my-component'),false,false,[]),
                    b.objectProperty(b.identifier('template-url'),b.stringLiteral('./my-component.component.html'),false,false,[]),
                    ]
                  )
                ]
              ))
            ]),
            [],
            undefined,
          )
        ]
      ));

      return generator(src).code;

  }
}
