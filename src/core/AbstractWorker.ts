import {IWorker} from "./IWorker";
import {IJob} from "./IJob";
import {JobStatus} from "./JobStatus";
import {IConfiguration} from "./IConfiguration";
import {Logger} from "tslog";

export abstract class AbstractWorker implements IWorker {
    protected id: string;
    protected job: IJob;
    protected logger: Logger;

    constructor(id: string, name: string, inputFile: string, config: IConfiguration) {
        if (config['logger'] === undefined) {
            throw new Error("Missing required argument 'logger'");
        }
        this.logger = config.logger.getChildLogger({name: 'worker'});
        this.id = id;
        this.job = <IJob>{
            name: name,
            inputFile: inputFile,
            outputFile: inputFile + "_",
            status: JobStatus.New,
            workDir: [config['workdir'], id + '-work'].join("/")
        };
    }

    getId(): string {
        return this.id;
    }

    getJob(): IJob {
        return this.job;
    }

    getStatus(): JobStatus {
        return this.job.status;
    }

    abstract do(): Promise<IWorker>;
    abstract getOutputContentType(): string;
    abstract getInputContentType(): string;
}