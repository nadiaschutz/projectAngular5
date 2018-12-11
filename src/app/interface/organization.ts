
export class Purpose {
    coding: Coding[];
}
export class Address {
    use: string;
    line: string[];
    city: string;
    state: string;
    country: string;
    postalcode: string;
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

export class Identifier {
    system: string;
    value: string;
    type: Type;
}

export class Type {
    coding: Coding[];
    text: string;
}
export class Coding {
    system: string;
    code: string;
    display: string;
}

export class Telecom {
    system: string;
    value: string;
    use: string;
}
export interface Contact {
    purpose: Purpose;
    telecom: Telecom[];
}
export class Resource {
    resourceType: string;
    text: Text;
    extension: Extension[];
    identifier: Identifier[];
    name: string;
    telecom: Telecom[];;
    address: Address[];
    contact: Contact[];
}
