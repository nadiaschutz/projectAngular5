export interface Item {
    linkId: string;
    text: string;
    answer: any;
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
