import {IRequestHandler, jsonResponse} from "../IRequestHandler";
import {IDispatchData} from "../IDispatchData";
import {IWorkersAccess} from "../IWorkersAccess";
import {AbstractRequestHandler} from "../AbstractRequestHandler";

export class StatusRequestHandler extends AbstractRequestHandler {
    async handle(data: IDispatchData, registry: IWorkersAccess): Promise<boolean> {
        let worker = registry.getWorker(data.id);
        if (worker===undefined) {
            this.logger.info(`[${data.serial}] [404] ${data.request.url} [${data.request.socket.remoteAddress}]`);
            jsonResponse(data.response, 404,{'error': 'no job found by id'});
            return true;
        }

        this.logger.info(`[${data.serial}] [200] ${data.request.url} [${data.request.socket.remoteAddress}]`);
        jsonResponse(data.response, 200,{id: data.id, status: worker.getStatus()});
        return true;
    }
}