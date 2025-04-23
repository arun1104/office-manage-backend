export interface IActivity{
    id: string;
    env: string;
    correlationId: string;
    functionName: string;
    context: string;
    type: string;
    docType: string;
    timestamp: number;
    resource: string;
    resourceName: string;
    resourceId: string;
    operation: string;
    initialResourceState?:any;
    finalResourceState?:any;
    change?: string;
    newValues: string[];
    addedValues: string[];
    removedValues: string[];
    uploaded?:string
    downloaded?:string
}