export interface Item {
    linkId: string;
    text: string;
    answer: any;
    code?: any;
    system?: any;
}

export interface ServRequest {
    id: string;
    date: string;
    PSOHP_service: string;
    assessmentType: string;
    department: string;
    region: string;
    createdBy: string;
    clientName: string;
    status: string;
}

export interface Client {
    id: string;
    given: string;
    family: string;
    dob: string;
    employeeType: string;
    department: string;
    branch: string;
}
