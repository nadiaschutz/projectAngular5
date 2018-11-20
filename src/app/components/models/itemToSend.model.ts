export interface ItemToSend {
        resourceType: string;
        extension?: [
          {
            url: string;
            valueCode: string;
          },
          {
            url: string;
            valueDateTime: string;
          }
        ];
        status: string;
        subject?: {
          reference: string;
          display: string;
        };
        authored: string;
        item: any [];
      }
