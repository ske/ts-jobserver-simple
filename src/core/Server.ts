import * as http from "http";
import {createServer, IncomingMessage, ServerResponse} from "http";
import {IWorkerMap} from "./IWorkerMap";
import {IRequestHandlerMap} from "./IRequestHandlerMap";
import {IRequestHandler, jsonResponse} from "./IRequestHandler";
import {IWorkersAccess} from "./IWorkersAccess";
import {DownloadRequestHandler} from "./handlers/DownloadRequestHandler";
import {createWorker, IWorker, IWorkerConstructor} from "./IWorker";
import {Logger} from "tslog";
import {DeleteRequestHandler} from "./handlers/DeleteRequestHandler";
import {IDispatchData} from "./IDispatchData";
import {StatusRequestHandler} from "./handlers/StatusRequestHandler";
import {IConfiguration} from "./IConfiguration";
import {UploadRequestHandler} from "./handlers/UploadRequestHandler";
import {parse} from "url";
import {JobStatus} from "./JobStatus";
import {AbstractRequestHandler} from "./AbstractRequestHandler";

export class Server implements IWorkersAccess {

    protected registeredWorkerType:IWorkerConstructor|undefined;
    protected workers:IWorkerMap = <IWorkerMap>{};
    protected handlers:IRequestHandlerMap = {};
    protected instance: http.Server | null = null;
    protected port:number = 8080;
    protected logger: Logger;
    protected serial: number = 0;
    protected config: IConfiguration;

    constructor(config:IConfiguration) {
        this.config = config;
        if (config['logger'] === undefined) {
            throw new Error("Missing required argument 'logger'");
        }
        this.logger = config.logger;

        if (config['workdir'] === undefined) {
            this.config['workdir'] = AbstractRequestHandler.DEFAULT_WORKDIR;
        }

        if (config['port']!==undefined) {
            this.port = config.port;
        }

        this.addRequestHandler('create', new UploadRequestHandler(config));
        this.addRequestHandler('status', new StatusRequestHandler(config));
        this.addRequestHandler('get', new DownloadRequestHandler(config));
        this.addRequestHandler('remove', new DeleteRequestHandler(config));
    }

    getWorker(name: string): IWorker | undefined {
        if (this.workers && this.workers[name]!==undefined) {
            return this.workers[name];
        }
        return undefined;
    }

    removeWorker(name: string): boolean {
        let worker = this.getWorker(name);
        if (worker===undefined) {
            return false;
        }
        if (worker.getStatus() == JobStatus.Running || worker.getStatus() == JobStatus.New) {
            return false;
        }
        delete this.workers[name];
        return true;
    }

    addWorker(workerId:string, name:string, file:string) {
        if (this.registeredWorkerType) {
            // Aad the worker
            this.workers[name] = createWorker(this.registeredWorkerType, workerId, name, file, this.config);
            // Start executing the worker
            Promise.all([this.workers[name].do()]).then((w) => {
                let _worker:IWorker = w[0];
                console.log('worker completed', _worker.getId(), _worker.getJob().name);
            })
        }
    }

    registerWorkerType(type: IWorkerConstructor) {
        this.registeredWorkerType = type;
    }

    addRequestHandler(path: string, handler: IRequestHandler) {
        this.handlers[path] = handler;
    }

    /**
     * Dispatched requests:
     *  -> /create/[id]
     *  -> /status/[id]
     *  -> /get/[id]
     *  -> /remove/[id]
     */
    protected async dispatch(request: IncomingMessage, response: ServerResponse) {
        try {
            this.serial++;
            let path = '', query = {};

            if (request.url) {
                let url = parse(request.url, true);
                path = url.pathname ? url.pathname : '';
                query = url.query;
            }

            let handled = false;
            let r = /^\/(create|status|get|remove)\/(.*)$/;
            let p = path.match(r);
            this.logger.debug("request-path regex-match: ", p?p:'no-match');
            if (p && p.length>=3) {
                let op = p[1];
                let id = p[2];
                if (op && id && this.handlers[op] !== undefined) {
                    let data = <IDispatchData>{
                        id: id,
                        request: request,
                        response: response,
                        query: query,
                        serial: this.serial
                    };
                    this.logger.debug(`[${this.serial}] handler found for op '${op}', id: '${id}'`);
                    handled = await this.handlers[op].handle(data, this);
                }
            }

            if (!handled) {
                // cannot fulfill the request
                this.logger.info(`[${this.serial}] [404] ${request.url} [${request.socket.remoteAddress}]`);
                jsonResponse(response, 404, {"error": "not found"});
            }
        } catch (e) {
            this.logger.error(`[${this.serial}] [500] ${request.url} [${request.socket.remoteAddress}]`, e);
            jsonResponse(response, 500, {"error": "internal server error"});
        }
    }

    start():Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.instance = createServer((request: IncomingMessage, response: ServerResponse) => {
                this.dispatch(request, response)
                    .then(() => {})
                    .catch((e) => {
                        this.logger.error("error during request-dispatch", e);
                    });
            });
            this.instance.on('error', (e) => {
                this.logger.error("error during server-create", e);
                reject(e);
            });
            this.instance.listen(this.port, () => {
                this.logger.info(`listening on port ${this.port}`);
                resolve(true);
            });
        });
    }

    shutdown():Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.instance && this.instance.listening) {
                this.logger.info("shutdown");
                this.instance.close((err:Error|undefined) => {
                    if (err) {
                        this.logger.error("error during shutdown", err);
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            } else {
                resolve(true);
            }
        });
    }
}