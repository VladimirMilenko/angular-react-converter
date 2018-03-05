export interface ParserPredicate {
    matchingType:string;
    isMatching: (token:any) => boolean;
    parse: (token:any) => any;
}