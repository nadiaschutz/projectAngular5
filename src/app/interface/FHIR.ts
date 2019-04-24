import { hasOwnProperty } from 'tslint/lib/utils';
import { TimingAst } from '@angular/animations/browser/src/dsl/animation_ast';

export interface Serializable<T> {
    deserialize(input: Object): T;
}

/* This is base class from which other elements are derived */
export class FHIRElement {
    id: string;
    extension: Extension[];
}

export class BackboneElement extends FHIRElement {
    modifierExtension: any;
}
/* FHIR classes used in resources */
export class Id {
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
    // should be of type Code
    code: string;
    display: string;
    userSelected: boolean;
    value: string;

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

export class Extension {
    url: string;
    valueString: string;
    valueCode: string;
    valueAddress: Address;
    valueBoolean?: boolean;
    valueHumanName: HumanName;
    valueReference: Reference;
    valueIdentifier: string;
    valueDecimal?: number;
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

export class PractitionerForImmunization extends BackboneElement {
    role: CodeableConcept;
    actor: Reference;
}

export class ImmunizationExplaination extends BackboneElement {
    reason: CodeableConcept[];
    reasonNotGiven: CodeableConcept[];
}

export class ImmunizationReaction extends BackboneElement {
    date: Date;
    detail: Reference;
    reported: boolean;
}

export class VaccinationProtocol extends BackboneElement {
    doseSequence: number;
    description: string;
    authority: Reference;
    series: string;
    seriesDoses: number;
    targetDiseases: CodeableConcept[];
    doseStatus: CodeableConcept;
    doseStatusReason: CodeableConcept;
}
export class Attachment extends FHIRElement {

    // should be of type code
    contentType: string;

    // should be of type code
    language: string;
    data: string;
    url: string;
    size: number;
    hash: string;
    title: string;
    creation: string;
}

export class Qualification extends BackboneElement {
    identifier: Identifier[];
    code: CodeableConcept;
    period: Period;
    issuer: Reference;
}

export class Content extends BackboneElement {
    attachment: Attachment;
    format: Coding;
}

export class Link extends BackboneElement {
    other: Reference;
    type: Code;
}

export class PatientCommunication extends BackboneElement {
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
    system: string;
    value: string;
    use: string;
    rank: number;
    period: Period;
}

export class ContactDetail extends FHIRElement {
    name: string;
    telecom: ContactPoint;
}

class Related extends BackboneElement {
    // TODO - change to Code once code is sorted out
    type: string;
    target: Reference;
}

export class Reference extends FHIRElement {
    reference: string;
    identifier: Identifier;
    display: string;
}

export class Identifier extends FHIRElement {
    use: string;
    type: CodeableConcept;
    system: string;
    value: string;
    period: Period;
    assigner: Reference;
}

export class Payload extends BackboneElement {
    contentString: string;
    contentAttachment: Attachment;
    contentReference: Reference;
}

export class Network extends BackboneElement {
    address: string;
    type: string;
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

export class Answer extends BackboneElement {
    valueDecimal: number;
    valueInteger: number;
    valueDate: Date;
    valueDateTime: Date;
    valueTime: string;
    valueString: string;
    valueUri: string;
    valueAttachment: Attachment;
    valueCoding: Coding;
    valueQuantity: Quantity;
    valueBoolean: boolean;
    valueReference: Reference;
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

export class Annotation extends FHIRElement {
    authorReference: Reference;
    authorString: string;
    time: Date;
    text: string;
}

export class Context extends BackboneElement {
    encounter: Reference;
    event: CodeableConcept[];
    sourcePatientInfo: Reference;
}

export class ReferenceRange extends BackboneElement {
    low: string;
    high: string;
    type: CodeableConcept;
    appliesTo: CodeableConcept [];
    age: Range;
    text: string [];
}

export class Participant extends BackboneElement {
    type: CodeableConcept[];
    actor: Reference;
    required: string;
    status: string;
}
export class Activity extends BackboneElement {
    outcomeCodeableConcept: CodeableConcept[];
    outcomeReference: Reference[];
    progress: Annotation[];
    reference: Reference;

}


export class Timing extends FHIRElement {
    event: Date;
    // TODO work on a Timing object
    repeat: string;
    location: Reference;
    performer: Reference[];
    productCodeableConcept: CodeableConcept;
    productReference: Reference;
    dailyAmount: string;
    quantity: string;
    description: string;

}

export class Component extends BackboneElement {
    code: CodeableConcept;
    valueQuantity: Quantity;
    valueCodeableConcept: CodeableConcept;
    valueString: string;
    valueBoolean: boolean;
    valueRange: Range;
    valueRatio: Ratio;
    valueSampledData: SampledData;
    valueAttachmnet: Attachment;
    valueTime: string;
    valueDateTime: Date;
    valuePeriod: Period;
    dataAbsentReason: CodeableConcept;
    interpretation: CodeableConcept;
    referenceRange: ReferenceRange [];
}

export class Ratio extends FHIRElement {
    numerator: Quantity;
    denominator: Quantity;
}

export class Input extends BackboneElement {
    type: CodeableConcept;
    value: any;
}

export class Output extends BackboneElement {
    type: CodeableConcept;
    value: any;
}

export class SampledData extends FHIRElement {
    origin: number;
    period: number;
    factor: number;
    lowerLimit: number;
    upperLimit: number;
    dimensions: number;
    data: string;
}
export class Restriction extends BackboneElement {
    repetitions: number;
    preiod: Period;
    recipient: Reference[];
}

export class AvailableTime extends BackboneElement {
    daysOfWeek: string[];
    allDay: boolean;
    availableStartTime: string;
    availableEndTime: string;
}

export class NotAvailable extends BackboneElement {
    description: string;
    during: Period;
}

export class Detail extends BackboneElement {
    category: CodeableConcept;
    definition: Reference;
    code: CodeableConcept;
    reasonCode: CodeableConcept[];
    reasonReference: Reference[];
    goal: Reference;
    status: Code;
    statusReason: string;
    prohibited: boolean;
    scheduledTiming: Timing;
    scheduledPeriod: Period;
    scheduledString: string;
}

export class Position extends BackboneElement {
    longitude: number;
    latitude: number;
    altitude: number;
}

export class Requester extends BackboneElement {
    agent: Reference;
    onBehalfOf: Reference;
}

export class QuestionnaireResponseItem extends BackboneElement {
    linkId: string;
    definition: string;
    text: string;
    answer: Answer[];
}

export class Item extends BackboneElement {
    linkId: string;
    definition: string;
    code: Coding[];
    prefix: string;
    text: string;
    type: Code;
    subject: Reference;
    enableWhen: EnableWhen[];
    required: boolean;
    repeats: boolean;
    readOnly: boolean;
    maxLength: number;
    options: string;
    option: FHIROption[];
    item: Item[];
    initial: any;
    answer: Answer[];
}

/* This is the base FHIR Resource from which others are derived */
export class Resource {
    resourceType: string;
    id: string;
    meta: Meta;
    implicitRules: string;
    // TODO - Solve Code structure, save language as a code
    language: string;
    extension: Extension[];
}

export class Agent extends BackboneElement {
    role: CodeableConcept[];
    reference: Reference;
    userId: Identifier;
    altId: string;
    name: string;
    requestor: boolean;
    location: Reference;
    policy: string[];
    media: Coding;
    /**
     * Logical network location for application activity
     */
    network: Network;
    /**
     * Reason given for this user
     */
    purposeOfUse: CodeableConcept;
}

export class Source extends BackboneElement {
    site: string;
    identifier: Identifier;
    type: Coding[];
}

export class EntityDetail extends BackboneElement {
    type: string;
    value: string;
}
export class Entity extends BackboneElement {
    identifier: Identifier;
    reference: Reference;
    type: Coding;
    role: Coding;
    lifecycle: Coding;
    securityLabel: Coding[];
    name: string;
    description: string;
    query: string;
    detail: EntityDetail[];
}

export class Udi extends BackboneElement {
    deviceIdentifier: string;
    name: string;
    jurisdiction: string;
    carrierHRF: string;
    carrierAIDC: any;
    issuer: string;
    entryType: string;
}
export class QuestionnaireResponse extends Resource implements Serializable<QuestionnaireResponse> {
    identifier: Identifier;
    basedOn: Reference[];
    parent: Reference[];
    questionnaire: Reference;
    status: string;
    context: Reference;
    authored: Date;
    author: Reference;
    source: Reference;
    item: QuestionnaireResponseItem[];
    subject: Reference;

    deserialize(jsonObject: any): QuestionnaireResponse {
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

export class Questionnaire extends Resource implements Serializable<Questionnaire> {
    url: string;
    identifier: Identifier[];
    version: string;
    name: string;
    title: string;
    // TODO - fix Code and change status to type Code
    status: string;
    experimental: boolean;
    date: string;
    publisher: string;
    description: string;
    purpose: string;
     rovalDate: string;
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
    telecom: ContactPoint[];
    gender: Code;
    birthDate: string;
    address: Address;
    maritalStatus: CodeableConcept;
    contact: Contact[];
    communication: PatientCommunication[];
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
    description: string;
    author: Reference[];
    content: Content[];
    indexed: Date;
    context: Context;
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

export class Appointment extends Resource implements Serializable<Appointment> {

    identifier: Identifier[];
    status: string;
    serviceCategory: CodeableConcept;
    serviceType: CodeableConcept[];
    specialty: CodeableConcept[];
    appointmentType: CodeableConcept;
    indication: Reference[];
    priority: number;
    description: string;
    supportingInformation: Reference[];
    start: Date;
    end: Date;
    minutesDuration: number;
    slot: Reference[];
    created: Date;
    comment: string;
    incomingReferral: Reference[];
    participant: Participant[];
    requestPeriod: Period[];

    deserialize(jsonObject: any): Appointment {
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


export class Organization extends Resource implements Serializable<Organization> {

    identifier: Identifier[];
    active: boolean;
    status: string;
    name: string;
    alias: string[];
    description: string;
    type: CodeableConcept[];
    telecom: ContactPoint[];
    address: Address[];
    partOf: Reference;
    contact: Contact[];
    endpoint: Reference[];

    deserialize(jsonObject: any): Organization {
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

export class Location extends Resource implements Serializable<Location> {

    identifier: Identifier[];
    status: string;
    operationalStatus: Coding;
    name: string;
    alias: string[];
    description: string;
    mode: Code;
    type: CodeableConcept;
    telecom: ContactPoint[];
    address: Address;
    physicalType: CodeableConcept;
    managingOrganization: Reference;
    partOf: Reference;
    endpoint: Reference[];
    extension: Extension[];

    deserialize(jsonObject: any): Location {
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

export class Account extends Resource implements Serializable<Account> {

    identifier: Identifier[];
    status: Code;
    type: CodeableConcept;
    name: string;
    subject: Reference;
    period: Period;
    active: Period;
    // TODO: fix mapping for money
    // balance: Money;
    alias: string[];
    description: string;
    mode: Code;
    telecom: ContactPoint;
    address: Address;
    physicalType: CodeableConcept;
    managingOrganization: Reference;
    partOf: Reference;
    endpoint: Reference[];

    deserialize(jsonObject: any): Account {
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

export class ProcessRequest extends Resource implements Serializable<ProcessRequest> {

    identifier: Identifier[];
    status: string;
    created: Date;
    provider: Reference;
    request: Reference;

    deserialize(jsonObject: any): ProcessRequest {
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

export class Encounter extends Resource implements Serializable<Encounter> {

    identifier: Identifier[];
    status: string;
    episodeOfCare: Reference[];
    subject: Reference;

    deserialize(jsonObject: any): Encounter {
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


export class EpisodeOfCare extends Resource implements Serializable<EpisodeOfCare> {

    identifier: Identifier[];
    status: string;
    statusHistory: BackboneElement[];
    type: CodeableConcept[];
    diagnosis: BackboneElement[];
    patient: Reference;
    mangingOrganization: Reference;
    period: Period;
    referralRequest: Reference;
    careManager: Reference;
    team: Reference[];
    account: Reference[];

    deserialize(jsonObject: any): EpisodeOfCare {
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
export class CarePlan extends Resource implements Serializable<CarePlan> {

    identifier: Identifier[];
    defintion: Reference[];
    basedOn: Reference[];
    replaces: Reference[];
    partOf: Reference[];
    status: string;
    intent: string;
    category: CodeableConcept[];
    title: string;
    description: string;
    subject: Reference;
    context: Reference;
    period: Period;
    author: Reference[];
    careTeam: Reference[];
    addresses: Reference[];
    supportingInfo: Reference[];
    goal: Reference[];
    activity: Activity[];
    note: Annotation[];


    deserialize(jsonObject: any): CarePlan {
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

export class Communication extends Resource implements Serializable<Communication> {

    identifier: Identifier[];
    defintion: Reference[];
    basedOn: Reference[];
    partOf: Reference[];
    status: string;
    notDone: boolean;
    notDoneReason: CodeableConcept;
    category: CodeableConcept[];
    medium: CodeableConcept[];
    subject: Reference;
    context: Reference;
    recipient: Reference[];
    topic: Reference[];
    sent: Date;
    received: Date;
    sender: Reference;
    reasonCode: CodeableConcept[];
    reasonReference: Reference[];
    payload: Payload[];
    note: Annotation[];

    deserialize(jsonObject: any): Communication {
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

export class Task extends Resource implements Serializable<Task> {

    identifier: Identifier[];
    defintionUri: string;
    defintionReference: Reference;
    basedOn: Reference[];
    groupIdentifier: Identifier;
    replaces: Reference[];
    partOf: Reference[];
    status: string;
    statusReason: CodeableConcept;
    businessStatus: CodeableConcept;
    intent: string;
    priority: string;
    code: CodeableConcept;
    description: string;
    focus: Reference;
    for: Reference;
    context: Reference;
    executionPeriod: Period;
    authoredOn: string;
    lastModified: string;
    requester: Requester;
    performerType: CodeableConcept;
    owner: Reference;
    reason: CodeableConcept;
    note: Annotation[];
    relevantHistory: Reference[];
    restriction: Restriction;
    input: Input[];
    output: Output[];

    deserialize(jsonObject: any): Task {
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

export class ProcedureRequest extends Resource implements Serializable<ProcedureRequest> {
    identifier: Identifier[];
    status: string;
    intent: string;
    category: CodeableConcept[];
    orderDetail: CodeableConcept[];
    subject: Reference;
    requester: Requester;
    performer: Reference;
    authoredOn: string;
    context: Reference;
    performerType: CodeableConcept;
    note: Annotation[];

    deserialize(jsonObject: any): ProcedureRequest {
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


export class PractitionerRole extends Resource implements Serializable<PractitionerRole> {

    identifier: Identifier[];
    active: boolean;
    period: Period;
    practitioner: Reference;
    organization: Reference;
    code: CodeableConcept[];
    specialty: CodeableConcept[];
    location: Reference[];
    healthcareService: Reference[];
    telecom: ContactPoint[];
    availableTime: AvailableTime[];
    notAvailable: NotAvailable[];
    availabilityExceptions: string;
    endpoint: Reference[];

    deserialize(jsonObject: any): PractitionerRole {
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

export class Practitioner extends Resource implements Serializable<Practitioner> {

    identifier: Identifier[];
    active: boolean;
    name: HumanName[];
    telecom: ContactPoint[];
    address: Address[];
    gender: string;
    birthDate: string;
    photo: Attachment[];
    qualification: Qualification[];
    communication: CodeableConcept[];

    deserialize(jsonObject: any): Practitioner {
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

export class Device extends Resource implements Serializable<Device> {

    identifier: Identifier[];
    udi: Udi;
    status: string;
    type: CodeableConcept;
    lotNumber: string;
    manufacturer: string;
    manufacturerDate: Date;
    expirationDate: Date;
    model: string;
    version: string;
    patient: Reference;
    owner: Reference;
    contact: ContactPoint[];
    location: Reference;
    url: string;
    note: Annotation[];
    safety: CodeableConcept[];

    deserialize(jsonObject: any): Device {
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

export class Observation extends Resource implements Serializable<Observation> {

    identifier: Identifier [];
    basedOn: Reference [];
    status: string;
    category: CodeableConcept [];
    code: CodeableConcept;
    subject: Reference;
    context: Reference;
    effectiveDateTime: Date;
    effectivePeriod: Period;
    issued: string;
    performer: Reference [];
    valueQuantity: Quantity;
    valueCodeableConcept: CodeableConcept;
    valueString: string;
    valueBoolean: boolean;
    valueRange: Range;
    valueRatio: Ratio;
    valueSampledData: SampledData;
    valueAttachmnet: Attachment;
    valueTime: string;
    valueDateTime: Date;
    valuePeriod: Period;
    dataAbsentReason: CodeableConcept;
    interpretation: CodeableConcept;
    comment: string;
    bodySite: CodeableConcept;
    method: CodeableConcept;
    specimen: Reference;
    device: Reference;
    referenceRange: ReferenceRange [];
    related: Related [];
    component: Component [];

    deserialize(jsonObject: any): Observation {
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

export class Immunization extends Resource implements Serializable<Immunization> {

    identifier: Identifier[];
    status: string;
    notGiven: boolean;
    vaccineCode: CodeableConcept;
    patient: Reference;
    encounter: Reference;
    date: string;
    primarySource: boolean;
    reportOrigin: CodeableConcept;
    location: Reference;
    manufacturer: Reference;
    lotNumber: string;
    expirationDate: string;
    site: CodeableConcept;
    route: CodeableConcept;
    doseQuantity: Coding;
    practitioner: PractitionerForImmunization;
    note: Annotation[];
    reaction: ImmunizationReaction[];
    vaccinationProtocol: VaccinationProtocol[];

    deserialize(jsonObject: any): Immunization {
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

export class CommunicationRequest extends Resource implements Serializable<CommunicationRequest> {

    identifier: Identifier[];
    basedOn: Reference[];
    replaces: Reference[];
    groupIdentifier: Identifier;
    status: string;
    category: CodeableConcept[];
    priority: string;
    medium: CodeableConcept[];
    subject: Reference;
    recipent: Reference[];
    topic: Reference[];
    context: Reference[];
    payload: Payload[];
    occurrenceDateTime: Date;
    occurrencePeriod: Period;
    authoredOn: Date;
    sender: Reference;
    requester: Requester;
    reasonCode: CodeableConcept[];
    reasonReference: Reference[];
    note: Annotation[];

    deserialize(jsonObject: any): CommunicationRequest {
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


export class AuditEvent extends Resource implements Serializable<AuditEvent> {

    type: Coding;
    subtype: Coding[];
    action: string;
    recorded: Date;
    outcome: string;
    outcomeDesc: string;
    purposeOfEvent: CodeableConcept[];
    /**
     * (Required) Actor involved in the event
     */
    agent: Agent[];
    source: Source;
    entity: Entity[];


    deserialize(jsonObject: any): AuditEvent {
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

export class Bundle extends Resource implements Serializable<Bundle> {

    type: Code;


    deserialize(jsonObject: any): Bundle {
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

