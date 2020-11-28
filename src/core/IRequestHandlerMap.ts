import {IRequestHandler} from "./IRequestHandler";

export interface IRequestHandlerMap {
    [key:string]: IRequestHandler;
}