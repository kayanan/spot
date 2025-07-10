import express, { Request, Response, Application, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import router from "./routes";
import mongoConnect from "./dbs/mongo/index";
import logger from "./dbs/logger/logger";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const appMiddleware = (app: Application) => {
  app.use(cors({
  //origin: 'http://192.168.8.130:5173', 
   origin: true,  // Allow from any origin
    credentials: true, // Allow cookies & authentication headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  }));
  // app.use(cors(
  //   {
  //     //origin: 'http://192.168.8.130:5173', 
  //     origin: true,
  //     credentials: true, // Allow cookies & authentication headers
  //     //methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowed HTTP methods
  //     //allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  //   }
  // ));

  app.use(express.json({ limit: "10mb" }));

  app.use(
    express.urlencoded({
      extended: true,
      parameterLimit: 100,
      limit: "10mb",
    })
  );

  app.use(helmet());

  //app.use(compression({ threshold: 2048 }));

  // Logging HTTP requests using Morgan
  //app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
  app.use(morgan("dev"))
  app.use(cookieParser());
  mongoConnect();

  app.use("/ping", (req: Request, res: Response) => {
    res.status(200).send({ message: "Pong" }).end();
  });

  router(app);

  // Handle 404 errors
  app.use((req: Request, res: Response, next: NextFunction) => {
    const error: any = new Error("Page not found!");
    error.status = 404;
    next(error);
  });

  // Handle other errors
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error: ${error.message} | Status: ${error.status || 500}`);

    res.status(error.status || 500).json({
      message: error.message,
    });
  });
};

export default appMiddleware;
