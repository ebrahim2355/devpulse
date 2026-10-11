import app from "./app";
import config from "./config";

app.listen(config.port, () => {
    console.log(`DevPulse server is running on port ${config.port}`);
});
