
    export interface Meta {
        profile: string[];
    }

    export interface Text {
        status: string;
        div: string;
    }

    export interface ValueCoding {
        system: string;
        code: string;
        display: string;
    }

    export interface Extension2 {
        url: string;
        valueCoding: ValueCoding;
        valueString: string;
    }

    export interface ValueAddress {
        city: string;
        state: string;
        country: string;
    }

    export interface ValueHumanName {
        text: string;
    }

    export interface ValueReference {
        reference: string;
    }

    export interface Extension {
        url: string;
        extension: Extension2[];
        valueString: string;
        valueCode: string;
        valueAddress: ValueAddress;
        valueBoolean?: boolean;
        valueHumanName: ValueHumanName;
        valueReference: ValueReference;
        valueDecimal?: number;
    }

    export interface Coding {
        system: string;
        code: string;
        display: string;
    }

    export interface Type {
        coding: Coding[];
        text: string;
    }

    export interface Identifier {
        system: string;
        value: string;
        type: Type;
    }

    export interface Name {
        use: string;
        family: string;
        given: string[];
        prefix: string[];
    }

    export interface Telecom {
        system: string;
        value: string;
        use: string;
    }

    export interface Extension4 {
        url: string;
        valueDecimal: number;
    }

    export interface Extension3 {
        url: string;
        extension: Extension4[];
    }

    export interface Address {
        extension: Extension3[];
        line: string[];
        city: string;
        state: string;
        country: string;
    }

    export interface Coding2 {
        system: string;
        code: string;
        display: string;
    }

    export interface MaritalStatus {
        coding: Coding2[];
        text: string;
    }

    export interface Coding3 {
        system: string;
        code: string;
        display: string;
    }

    export interface Language {
        coding: Coding3[];
        text: string;
    }

    export interface Communication {
        language: Language;
    }

    export interface Resource {
        resourceType: string;
        id: string;
        meta: Meta;
        text: Text;
        extension: Extension[];
        identifier: Identifier[];
        name: Name[];
        telecom: Telecom[];
        gender: string;
        birthDate: string;
        deceasedDateTime: Date;
        address: Address[];
        maritalStatus: MaritalStatus;
        multipleBirthBoolean: boolean;
        communication: Communication[];
    }

    export interface RootObject {
        resource: Resource;
    }


