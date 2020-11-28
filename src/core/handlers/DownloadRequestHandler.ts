import {IRequestHandler, jsonResponse} from "../IRequestHandler";
import {IDispatchData} from "../IDispatchData";
import {IWorkersAccess} from "../IWorkersAccess";
import {JobStatus} from "../JobStatus";
import {statSync} from "fs";
import fs from "fs";
import {AbstractRequestHandler} from "../AbstractRequestHandler";

export class DownloadRequestHandler extends AbstractRequestHandler {
    async handle(data: IDispatchData, registry: IWorkersAccess): Promise<boolean> {
        const worker = registry.getWorker(data.id);

        if (worker===undefined) {
            this.logger.info(`[${data.serial}] [404] ${data.request.url} [${data.request.socket.remoteAddress}]`);
            jsonResponse(data.response, 404,{'error': 'no job found by id'});
            return true;
        }
        if (worker.getStatus() != JobStatus.Finished) {
            this.logger.info(`[${data.serial}] [404] ${data.request.url} [${data.request.socket.remoteAddress}]`);
            jsonResponse(data.response, 404,{'error': 'no job found by id'});
            return true;
        }

        let outputFile = worker.getJob().outputFile;
        let send = new Promise((resolve, reject) => {
            let fstat = statSync(outputFile);
            data.response.statusCode = 200;
            data.response.setHeader('Content-Length', fstat.size);
            data.response.setHeader('Content-Type', worker.getOutputContentType());
            fs.createReadStream(outputFile)
                .on('end', () => {
                    this.logger.info("download completed");
                    resolve();
                })
                .on('error', (e) => {
                    this.logger.error("download-error", e);
                    reject(e);
                })
                .pipe(data.response);
        });

        await send;

        return true;
    }
}