import { authenticateJWT, canAccessTheApi } from "@middlewares";
import { AWSParamsLoader } from "@n-oms/multi-tenant-shared";
import { registerRoutes } from '@routing';
import cors from 'cors';
import express from 'express';
import correlator from 'express-correlation-id';
import morgan from 'morgan';
const awsParamsLoader = new AWSParamsLoader();
const app = express();
app.use(cors());
app.use(correlator());
app.use(express.json());
app.use('/v2/health', (req, res) => { res.status(200).send() });
app.use(authenticateJWT);
awsParamsLoader.loadParams(`/${process.env.ORG_NAME}`).then(() => {
  console.log('set params using AWS SSM');
  app.use(canAccessTheApi);
  registerRoutes(app);
});
const port = process.env.PORT || 8002;
app.use(morgan('[:date[clf]] :method :url :status :res[content-length] - :response-time ms'));
app.listen(port, () => {
  console.log(`Multi tenant N-OMS backend is running on port ${port}.`);
});
