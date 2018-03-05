import { TextGenerator, RenderNodeGenerator, ForLoopGenerator, RenderIdentifierGenerator, ChildrenIdentifierGenerator } from './AngularGenerator';
import { Generator } from './AngularGenerator';

class AngularGenerator {
    generators: Array<Generator>;
    constructor() {
        this.generators = [new TextGenerator(), new RenderNodeGenerator(), new ForLoopGenerator(), new RenderIdentifierGenerator(), new ChildrenIdentifierGenerator()];
    }

    generate(input: any) {
        const generators = this.generators.filter(x => x.matchingType === input.type);
        if (!generators.length) throw new Error(`Unable to generate type ${input.type}`);

        return generators[0].generate(input);
    }
}

export const angularGenerator = new AngularGenerator();