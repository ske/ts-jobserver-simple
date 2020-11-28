import {IncomingMessage, ServerResponse} from "http";
import {ParsedUrlQuery} from "querystring";

export interface IDispatchData {
    id: string,
    request: IncomingMessage,
    response: ServerResponse,
    query: ParsedUrlQuery,
    serial: number;
}