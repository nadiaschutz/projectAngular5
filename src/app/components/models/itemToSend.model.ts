export interface ItemToSend {
  resourceType: string;
  status: string;
  subject?: {
    reference: string;
    display: string;
  };
  questionnaire: {
    reference: string;
  };
  identifier?: any;
  authored: any;
  author: any;
  item: any[];
}
