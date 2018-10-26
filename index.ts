import { AngularComponentGenerator } from "./converters/generators/AngularComponentGenerator";
import * as pretty from "pretty";

import * as fs from "fs";
import * as path from "path";
import * as parse5 from "parse5";
import { AbstractComponentCreator } from "./converters/AbstractComponentCreator";
import { RenderNode } from "./declarations";
import { resolverRegistry } from "./helpers";
import { angularGenerator } from "./converters/generators/AngularBootstrap";


const demoFiles = ["comment.js", "post.js", "profile.js"];

if (process.env.DEMO) {
  for (let file of demoFiles) {
    const code = fs.readFileSync(
      path.resolve(__dirname, "../../pet/instagram/src/components/" + file)
    );

    const builder = new AbstractComponentCreator(code.toString());
    const { node, name, originalName } = builder.convertToAbstractTree();

    const angAST = angularGenerator.generate(node as RenderNode);
    const finalAST = {
      nodeName: "#document-fragment",
      childNodes: [angAST]
    };
    let json = JSON.stringify(node);

    const tsCode = new AngularComponentGenerator().generate(name, originalName);

    const html = parse5.serialize(finalAST);
    const reducedHtml = html.split('=""').join("");
    const template = pretty(reducedHtml);

    fs.writeFileSync(
      path.resolve(
        __dirname,
        "../ang-test-app/src/app/components/" + file.replace(".js", ".component.ts")
      ),
      tsCode
    );

    fs.writeFileSync(
      path.resolve(
        __dirname,
        "../ang-test-app/src/app/components/" + file.replace(".js", ".component.html")
      ),
      template
    );

    resolverRegistry.clear();
  }
} else {
  const code = fs.readFileSync(
    path.resolve(__dirname, "react-test/ClassComponent.js")
  );
  const builder = new AbstractComponentCreator(code.toString());
  const { node, name, originalName } = builder.convertToAbstractTree();

  const angAST = angularGenerator.generate(node as RenderNode);
  const finalAST = {
    nodeName: "#document-fragment",
    childNodes: [angAST]
  };
  let json = JSON.stringify(node);
  console.log(new AngularComponentGenerator().generate(name, originalName));

  const html = parse5.serialize(finalAST);
  const reducedHtml = html.split('=""').join("");

  console.log(pretty(reducedHtml));
}
