import {IRequestHandler, jsonResponse} from "../IRequestHandler";
import {IDispatchData} from "../IDispatchData";
import {IWorkersAccess} from "../IWorkersAccess";
import {AbstractRequestHandler} from "../AbstractRequestHandler";
import {promisify} from "util";
import * as fs from "fs";

export class DeleteRequestHandler  extends AbstractRequestHandler {
    async removeFiles(files:string[]) {
        const fstat = promisify(fs.stat);
        const rm = promisify(fs.rm);
        const rmdir = promisify(fs.rmdir);

        for (let file in files) {
            if (file===undefined || file.length==0) {
                continue;
            }
            try {
                let stat = await fstat(file);
                if (stat.isDirectory()) {
                    await rm(file);
                } else if (stat.isFile()) {
                    await rmdir(file);
                }
            } catch (e) {
                this.logger.error("remove-files", e);
            }
        }
    }

    async handle(data: IDispatchData, registry: IWorkersAccess): Promise<boolean> {
        let worker = registry.getWorker(data.id);
        if (worker===undefined) {
            this.logger.info(`[${data.serial}] [404] ${data.request.url} [${data.request.socket.remoteAddress}]`);
            jsonResponse(data.response, 404,{'error': 'no job found by id'});
            return true;
        }

        let filesToRemove = [worker.getJob().inputFile, worker.getJob().outputFile, worker.getJob().workDir];
        this.logger.info(`cleaning up worker '${data.id}'`, filesToRemove);
        await this.removeFiles(filesToRemove);
        registry.removeWorker(data.id);

        return true;
    }
}