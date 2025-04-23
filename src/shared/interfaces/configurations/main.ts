export interface ITaskStatusConfiguration {
    id: string;
    parentId: string;
    parentName: string;
    name: string;
    isActive: boolean;
    canBeDeleted: boolean;
    isFirstStatus?: boolean;
    isFinalStatus?: boolean;
    isDelayed?: boolean;
  }
  
  export interface IConfig {
    name: string;
    description: string;
    id: string;
    configuration: ITaskStatusConfiguration[];
  }