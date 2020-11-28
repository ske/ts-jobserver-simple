import {IWorkerMap} from "./IWorkerMap";
import {IWorker} from "./IWorker";

export interface IWorkersAccess {
    getWorker(name:string):IWorker|undefined;
    addWorker(workerId:string, name:string, file:string):void;
    removeWorker(name:string):boolean;
}