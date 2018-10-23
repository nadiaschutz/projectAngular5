
export namespace Employee {
    export class Meta {
        profile: string[];
    }
    
    export class Other {
        reference: string;
    }
    
    export class Link {
        other: Other;
        type: string;
    }
    
    export class RootObject {
        link: Link[];
    }
    
    export class Text {
        status: string;
        div: string;
    }
    
    export class ValueCoding {
        system: string;
        code: string;
        display: string;
    }
    
    export class ValueAddress {
        city: string;
        state: string;
        country: string;
    }
    
    export class ValueHumanName {
        text: string;
    }
    
    export class ValueReference {
        reference: string;
    }
    
    export class Extension {
        url: string;
        valueString: string;
        valueCode: string;
        valueAddress: ValueAddress;
        valueBoolean?: boolean;
        valueHumanName: ValueHumanName;
        valueReference: ValueReference;
        valueIdentifier: string;
        valueDecimal?: number;
    }
    
    export class Coding {
        system: string;
        code: string;
        display: string;
    }
    
    export class Type {
        coding: Coding[];
        text: string;
    }
    
    export class Identifier {
        system: string;
        value: string;
        type: Type;
    }
    
    export class Name {
        use: string;
        family: string;
        given: string[];
        prefix: string[];
    }
    
    export class Telecom {
        system: string;
        value: string;
        use: string;
    }
    
    
    export class Address {
        use: string;
        line: string[];
        city: string;
        state: string;
        country: string;
        postalcode: string;
    }
    
    export class Coding2 {
        system: string;
        code: string;
        display: string;
    }
    
    export class MaritalStatus {
        coding: Coding2[];
        text: string;
    }
    
    
    export class Language {
        coding: Coding[];
    }
    
    export class Communication {
        language: Language;
    }
    
    export class Resource {
        resourceType: string;
        id: string;
        meta: Meta;
        text: Text;
        extension: Extension[];
        identifier: Identifier[];
        name: Name;
        telecom: Telecom[];
        gender: string;
        birthDate: string;
        deceasedDateTime: Date;
        address: Address[];
        maritalStatus: MaritalStatus;
        multipleBirthBoolean: boolean;
        communication: Communication[];
    }

}
