import {JobStatus} from "./JobStatus";

export interface IJob {
    name: string;
    inputFile: string;
    outputFile: string;
    status: JobStatus;
    workDir: string;
}