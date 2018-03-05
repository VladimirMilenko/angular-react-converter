export interface Strategy {
    name: string;
    convert: () => any;
}
