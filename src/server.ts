import app from "./app";
import config from "./config";
import initDB from "./config/db";

const startServer = async () => {
    try {
        await initDB();

        app.listen(config.port, () => {
            console.log(`DevPulse server is running on port ${config.port}`);
        });
    } catch (error) {
        console.error("Failed to start the server", error);
        process.exit(1);
    }
};

startServer();

export default app;
