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

        authored: string;
        item: any [];
      }
