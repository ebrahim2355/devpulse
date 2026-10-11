import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";
import { authRoutes } from "./modules/auth/auth.routes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "DevPulse API is running",
    });
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
