import {IRequestHandler} from "./IRequestHandler";
import {IWorkersAccess} from "./IWorkersAccess";
import {IDispatchData} from "./IDispatchData";
import {IConfiguration} from "./IConfiguration";
import {Logger} from "tslog";

export abstract class AbstractRequestHandler implements IRequestHandler {
    protected logger:Logger;
    protected config:IConfiguration;

    constructor(config:IConfiguration) {
        this.config = config;
        if (config['logger'] === undefined) {
            throw new Error("Missing required argument 'logger'");
        }
        this.logger = config.logger;
    }
    abstract async handle(data: IDispatchData, registry: IWorkersAccess): Promise<boolean>;
}