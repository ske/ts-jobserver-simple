import {IJob} from "./IJob";
import {JobStatus} from "./JobStatus";
import {IConfiguration} from "./IConfiguration";

export function createWorker(ctor: IWorkerConstructor,
                      id: string,
                      name: string,
                      inputFile: string,
                      config: IConfiguration) {
    return new ctor(id, name, inputFile, config);
}

export interface IWorkerConstructor {
    new(id: string, name: string, inputFile: string, config:IConfiguration) : IWorker;
}

export interface IWorker {
    getId(): string;
    getJob(): IJob;
    getStatus(): JobStatus;
    do(): Promise<IWorker>;
    getInputContentType(): string;
    getOutputContentType(): string;
}