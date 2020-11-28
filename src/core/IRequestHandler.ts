import {IncomingMessage, ServerResponse} from "http";
import {ParsedUrlQuery} from "querystring";
import {IDispatchData} from "./IDispatchData";
import {IWorkersAccess} from "./IWorkersAccess";

export interface IRequestHandler {
    handle(data: IDispatchData, registry: IWorkersAccess): Promise<boolean>;
}

export function jsonResponse(response: ServerResponse, statusCode: number, data: any) {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(data));
}