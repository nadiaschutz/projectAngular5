import { hasOwnProperty } from 'tslint/lib/utils';

export interface Serializable<T> {
    deserialize(input: Object): T;
}

/* This is base class from which other elements are derived */
export class FHIRElement {
    id: string;
    extension: any;
}

export class BackboneElement extends FHIRElement {
    modifierExtension: any;
}
/* FHIR classes used in resources */
class Id {
    private id: string;

    constructor(input?: string) {
        const re = new RegExp('[A-Za-z0-9\\-\\.]{1,64}');

        if (re.test(input)) {
            this.id = input;
        } else {
            throw new RangeError('Not a valid Id string - must match reg exp [A-Za-z0-9\\-\\.]{1,64} Was provided: ' + input);
        }
    }
}


export class Code extends FHIRElement {
    private _code: string;
    private codeRE = new RegExp('[^\\s]+([\\s]?[^\\s]+)*');

    constructor(input?: string) {
        super();
        this.setCode(input);
    }

    private setCode(input: string) {
        if (this.codeRE.test(input)) {
            this._code = input;
        } else {
            throw new RangeError('Not a valid Id string - must match reg exp [^\\s]+([\\s]?[^\\s]+)* Was provided: ' + input);
        }
    }

    get code(): string {
        return this._code;
    }

    set code(input: string) {
        this.setCode(input);
    }

    public toString(): string {
        return this._code;
    }

    deserialize(jsonObject: any): Code {
        const that = this;
        Object.entries(jsonObject).forEach(function (value) {
            if (!(typeof value[1] === 'object')) {
                that[value[0]] = value[1];
            } else {
                (that[value[0]].deserialize(value[1]));
            }
        });
        return this;
    }

}

export class Coding extends FHIRElement {
    system: string;
    version: string;
    code: Code;
    display: string;
    userSelected: boolean;

    deserialize(jsonObject: any): Coding {
        const that = this;
        Object.entries(jsonObject).forEach(function (value) {
            if (!(typeof value[1] === 'object')) {
                that[value[0]] = value[1];
            } else {
                (that[value[0]].deserialize(value[1]));
            }
        });
        return this;
    }

}


export class HumanName extends FHIRElement {
    use: Code;
    text: string;
    family: string;
    given: string[];
    prefix: string[];
    suffix: string[];
    period: Period;

    deserialize(jsonObject: any): HumanName {
        const that = this;
        Object.entries(jsonObject).forEach(function (value) {
            if (!(typeof value[1] === 'object')) {
                that[value[0]] = value[1];
            } else {
                (that[value[0]].deserialize(value[1]));
            }
        });
        return this;
    }

}


export class Address extends FHIRElement {
    use: Code;
    type: Code;
    text: string;
    line: string[];
    city: string;
    district: string;
    state: string;
    postalCode: string;
    country: string;
    period: Period;

}

export class Meta extends FHIRElement {
    versionId: Id;
    lastUpdated: string;
    profile: string;
    security: Coding;
    tag: Coding;

    deserialize(jsonObject: any): Meta {
        const that = this;
        Object.entries(jsonObject).forEach(function (value) {
            if (!(typeof value[1] === 'object')) {
                that[value[0]] = value[1];
            } else {
                (that[value[0]].deserialize(value[1]));
            }
        });
        return this;
    }


}

export class CodeableConcept extends FHIRElement {
    coding: Coding[];
    text: string;
}

export class Period extends FHIRElement {
    start: string;
    end: string;
}

export class Quantity extends FHIRElement {
    value: number;
    comparator: Code;
    unit: string;
    system: string;
    code: Code;
}

export class FHIRRange extends FHIRElement {
    low: number;
    high: number;
}

export class UsageContext extends FHIRElement {
    code: Coding;
    value: any;

    set valueCodeableConcept(value: CodeableConcept) {
        this.value = value;
    }
    set valueQuantity(value: Quantity) {
        this.value = value;
    }
    set valueRange(value: FHIRRange) {
        this.value = value;
    }

}

export class Attachment extends FHIRElement {
    contentType: Code;
    language: Code;
    data: string;
    url: string;
    size: number;
    hash: string;
    title: string;
    creation: Date;
}

export class Content extends BackboneElement {
    attachment: Attachment;
    format: Coding;
}

export class Link extends BackboneElement {
    other: Reference;
    type: Code;
}

export class Communication extends BackboneElement {
    language: CodeableConcept;
    preferred: boolean;
}

export class Contact extends BackboneElement {
    relationship: CodeableConcept[];
    name: HumanName;
    telecom: ContactPoint;
    address: Address;
    gender: Code;
    organization: Reference;
    period: Period;
}

export class ContactPoint extends FHIRElement {
    system: Code;
    value: string;
    use: Code;
    rank: number;
    period: Period;
}

export class ContactDetail extends FHIRElement {
    name: string;
    telecom: ContactPoint;
}

export class Reference extends FHIRElement {
    reference: string;
    identifier: Identifier;
    display: string;
}

export class Identifier extends FHIRElement {
    use: Code;
    type: CodeableConcept;
    system: string;
    value: string;
    period: Period;
    assigner: Reference;
}

export class EnableWhen extends BackboneElement {
    question: string;
    hasAnswer: boolean;
    answer: any;

    set answerBoolean(answer: boolean) {
        this.answer = answer;
    }
    set answerInteger(answer: number) {
        this.answer = answer;
    }
    set answerDate(answer: string) {
        this.answer = answer;
    }
    set answerdateTime(answer: string) {
        this.answer = answer;
    }
    set answerTime(answer: string) {
        this.answer = answer;
    }
    set answerUri(answer: string) {
        this.answer = answer;
    }
    set answerAttachment(answer: any) {
        this.answer = answer;
    }
    set answerCoding(answer: Coding) {
        this.answer = answer;
    }
    set answerQuantity(answer: Quantity) {
        this.answer = answer;
    }
    set answerReference(answer: string) {
        this.answer = answer;
    }

}

export class FHIROption extends BackboneElement {
    value: any;

    set valueDate(value: string) {
        this.value = value;
    }
    set valueTime(value: string) {
        this.value = value;
    }
    set valueString(value: string) {
        this.value = value;
    }
    set valueCoding(value: Coding) {
        this.value = value;
    }
}

export class Item extends BackboneElement {
    linkId: string;
    definition: string;
    code: Coding[];
    prefix: string;
    text: string;
    type: Code;
    enableWhen: EnableWhen[];
    required: boolean;
    repeats: boolean;
    readOnly: boolean;
    maxLength: number;
    options: string;
    option: FHIROption[];
    item: Item[];
    initial: any;
}

/* This is the base FHIR Resource from which others are derived */
export class Resource {
    resourceType: string;
    id: Id;
    meta: Meta;
    implicitRules: string;
    language: Code;
}

export class Questionnaire extends Resource implements Serializable<Questionnaire> {
    url: string;
    identifier: Identifier[];
    version: string;
    name: string;
    title: string;
    status: Code;
    experimental: boolean;
    date: string;
    publisher: string;
    description: string;
    purpose: string;
    approvalDate: string;
    lastReviewedDate: string;
    effectivePeriod: Period;
    useContext: UsageContext[];
    jurisdiction: CodeableConcept[];
    contact: ContactDetail[];
    copyright: string;
    code: Coding[];
    subjectType: Code[];
    item: Item[];

    deserialize(jsonObject: any): Questionnaire {
        const that = this;
        Object.entries(jsonObject).forEach(function (value) {
            if (!(typeof value[1] === 'object')) {
                that[value[0]] = value[1];
            } else {
                (that[value[0]].deserialize(value[1]));
            }
        });
        return this;
    }

}

export class Patient extends Resource implements Serializable<Patient> {
    identifier: Identifier[];
    active: boolean;
    name: HumanName[];
    telecom: ContactPoint;
    gender: Code;
    birthDate: Date;
    address: Address;
    maritalStatus: CodeableConcept;
    contact: BackboneElement;
    communication: Communication[];
    generalPractitioner: Reference[];
    managingOrganization: Reference;
    link: Link[];

    deserialize(jsonObject: any): Patient {
        const that = this;
        Object.entries(jsonObject).forEach(function (value) {
            if (!(typeof value[1] === 'object')) {
                that[value[0]] = value[1];
            } else {
                (that[value[0]].deserialize(value[1]));
            }
        });
        return this;
    }
}


export class DocumentReference extends Resource implements Serializable<DocumentReference> {
    masterIdentifier: Identifier;
    status: Code;
    docStatus: Code;
    type: CodeableConcept;
    subject: Reference;
    created: Date;
    author: Reference[];
    content: Content[];
    // TODO - add rest of the fields from the spec
    deserialize(jsonObject: any): DocumentReference {
        const that = this;
        Object.entries(jsonObject).forEach(function (value) {
            if (!(typeof value[1] === 'object')) {
                that[value[0]] = value[1];
            } else {
                (that[value[0]].deserialize(value[1]));
            }
        });
        return this;
    }
}