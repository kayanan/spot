// import mongoose, { connect } from 'mongoose';
// import logger from '@/src/dbs/logger';
// import config from '@/config';

// const mongoConnect = async () => {
//   try {
//     await connect(config.mongo.url);
//     logger.info('MongoDB connected');
//     process.on('SIGINT', async (): Promise<void> => {
//       logger.info('Connection Closing Event Triggered');
//       await mongoose.connection
//         .close()
//         .then(() => {
//           logger.info('Mongo Cluster Connection closed');
//           process.exit(0);
//         })
//         .catch((error) => {
//           logger.error('Error in Closing Mongo Connection');
//           process.exit(1);
//         });
//     });
//   } catch (error) {
//     logger.error(error);
//   }
// };

// export default mongoConnect;

// src/db/dbConnection.ts

import { connect } from "mongoose";

const mongoConnect = async () => {
  try {
    const con = await connect(process.env.DB_URI || "");
    console.log(`MongoDB is connected to the host: ${con.connection.host}`);
  } catch (error) {
    console.log("Failed to connect to MongoDB:", error);
  }
};

export default mongoConnect;

