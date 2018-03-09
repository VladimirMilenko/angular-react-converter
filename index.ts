import {AngularComponentGenerator} from "./converters/generators/AngularComponentGenerator";

import * as fs from 'fs';
import * as path from 'path';
import * as parse5 from 'parse5';
import { AbstractComponentCreator } from "./converters/AbstractComponentCreator";
import { RenderNode } from "./declarations";
import {resolverRegistry} from "./helpers";
import { angularGenerator } from './converters/generators/AngularBootstrap';
const code = fs.readFileSync(path.resolve(__dirname, '../react-test/ClassComponent.js'));
const builder = new AbstractComponentCreator(code.toString());
const node = builder.convertToAbstractTree();

const angAST = angularGenerator.generate(node as RenderNode);
const finalAST = {
    nodeName: '#document-fragment',
    childNodes: [angAST]
};
let json = JSON.stringify(node);
console.log(resolverRegistry.vars);
console.log(new AngularComponentGenerator().generate());

console.log(parse5.serialize(finalAST));
