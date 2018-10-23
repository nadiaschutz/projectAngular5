export namespace PSOHPService {
    export interface Text {
        status: string;
        div: string;
    }

    export interface Code {
        system: string;
        code: string;
    }

    export interface Code2 {
        system: string;
        code: string;
    }

    export interface Options {
        reference: string;
    }

    export interface Code3 {
        system: string;
        code: string;
        display: string;
    }

    export interface AnswerCoding {
        system: string;
        code: string;
    }

    export interface EnableWhen {
        question: string;
        answerCoding: AnswerCoding;
    }

    export interface Code4 {
        system: string;
        code: string;
    }

    export interface Options2 {
        reference: string;
    }

    export interface Code5 {
        system: string;
        code: string;
        display: string;
    }

    export interface Options3 {
        reference: string;
    }

    export interface Item5 {
        linkId: string;
        code: Code5[];
        prefix: string;
        type: string;
        options: Options3;
    }

    export interface Item4 {
        linkId: string;
        code: Code4[];
        prefix: string;
        type: string;
        options: Options2;
        item: Item5[];
    }

    export interface Item3 {
        linkId: string;
        code: Code3[];
        type: string;
        enableWhen: EnableWhen[];
        item: Item4[];
    }

    export interface Item2 {
        linkId: string;
        code: Code2[];
        prefix: string;
        type: string;
        options: Options;
        item: Item3[];
    }

    export interface Item {
        linkId: string;
        code: Code[];
        type: string;
        item: Item2[];
    }

    export interface RootObject {
        resourceType: string;
        id: string;
        text: Text;
        url: string;
        title: string;
        status: string;
        date: string;
        subjectType: string[];
        item: Item[];
    }



}