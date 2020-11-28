import {Server} from "./src/core/Server";
import {Logger} from "tslog";
import {ExampleWorker} from "./src/ExampleWorker";

const logger = new Logger({name: "example-job-server"});
try {
    logger.info("starting");
    const jobServer = new Server({
        logger: logger,
        workdir: '/tmp',
        port: 8080
    });
    process.on('SIGINT', async () => {
        logger.info("SIGINT received, shutting down.");
        await jobServer.shutdown();
    });

    jobServer.registerWorkerType(ExampleWorker);

    Promise.all([jobServer.start()]).then(() => {
        logger.info("started");
    }).catch((e) => {
        logger.error("cannot start", e);
    });
} catch (error) {
    logger.error("error during initialization", error);
}