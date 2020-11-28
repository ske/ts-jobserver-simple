import {AbstractWorker} from "./core/AbstractWorker";
import {IWorker} from "./core/IWorker";
import {readFile, writeFile} from "fs/promises";
import {JobStatus} from "./core/JobStatus";

/**
 * The example worker takes a text input file and converts it to uppercase
 */
export class ExampleWorker extends AbstractWorker {
    async do(): Promise<IWorker> {
        this.logger.info("start");
        this.job.status = JobStatus.Running;

        let input = this.getJob().inputFile;
        let output = this.getJob().outputFile;

        const txt = await readFile(input);

        if (txt === undefined || txt.length == 0) {
            this.logger.info("end");
            this.job.status = JobStatus.Error;
        } else {
            const converted = txt.toString().toUpperCase();
            await writeFile(output, converted);

            this.job.status = JobStatus.Finished;
            this.logger.info("end");
        }

        return this;
    }

    getInputContentType(): string {
        return "application/text";
    }

    getOutputContentType(): string {
        return "application/text";
    }

}