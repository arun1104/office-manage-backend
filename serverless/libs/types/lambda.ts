

export interface LambdaResponse {
    statusCode: number;
    headers?: {
      [header: string]: boolean | number | string;
    };
    body: string;
  }
  
  
  