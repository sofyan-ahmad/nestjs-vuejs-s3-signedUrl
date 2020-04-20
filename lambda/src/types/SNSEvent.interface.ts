export interface ISNSEvent {
  Records: {
    EventSource: string;
    EventVersion: string;
    EventSubscriptionArn: string;
    Sns: {
      Type: string;
      MessageId: string;
      TopicArn: string;
      Subject: string;
      Message: string;
      Timestamp: string;
      SignatureVersion: string;
      Signature: string;
      SigningCertUrl: string;
      UnsubscribeUrl: string;
      MessageAttributes: {};
    };
  }[];
}
