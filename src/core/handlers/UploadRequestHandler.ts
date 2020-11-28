import {IRequestHandler, jsonResponse} from "../IRequestHandler";
import {IDispatchData} from "../IDispatchData";
import {IWorkersAccess} from "../IWorkersAccess";
import fs, {writeFile} from "fs";
import {v4} from "uuid";
import {AbstractRequestHandler} from "../AbstractRequestHandler";

export class UploadRequestHandler extends AbstractRequestHandler {
    async handle(data: IDispatchData, registry: IWorkersAccess): Promise<boolean> {
        if (data.request.method!='POST') {
            return false;
        }
        let worker = registry.getWorker(data.id);
        if (worker!==undefined) {
            this.logger.info(`[${data.serial}] [403] ${data.request.url} [${data.request.socket.remoteAddress}]`);
            jsonResponse(data.response, 403,{'error': 'job already exists with the same id'});
            return true;
        }

        let receive = new Promise<void>((resolve, reject) => {
            let buffer = Buffer.from('');
            data.request
                .on('data', (chunk) => { buffer = Buffer.concat([buffer, chunk])})
                .on('error', (e) => { reject(e); })
                .on('end', () => {
                    if (!buffer.length) {
                        this.logger.info(`[${data.serial}] [400] ${data.request.url} [${data.request.socket.remoteAddress}]`);
                        jsonResponse(data.response, 400, {'error': 'empty request'})
                        reject("empty request body");
                    } else {
                        const workerId:string = v4();
                        let workDir = this.config['workdir'];
                        const fileName:string = [workDir, workerId].join("/");
                        writeFile(fileName, buffer, () => {
                            registry.addWorker(workerId, data.id, fileName);
                            this.logger.info(`[${data.serial}] [201] ${data.request.url} [${data.request.socket.remoteAddress}]`);
                            jsonResponse(data.response, 201, {id: data.id});
                            resolve();
                        });
                    }
                });
        });

        await receive;

        return true;
    }
}