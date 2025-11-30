import express from "express";
import reagentRoutes from "./v1/reagent/reagent.routes.js";
import instrumentRoutes from "./v1/instrument/instrument.routes.js";

const router = express.Router();

router.use(
  "/warehouse/reagents",
  /*
  #swagger.tags = ['Reagents']
  #swagger.description = 'Retrieve a list of all reagents in the system, including available, low stock, and expired ones.'
  */
  reagentRoutes
);

router.use(
  "/warehouse/instruments",
  /*
  #swagger.tags = ['Instruments']
  #swagger.description = 'Inventory instrument endpoints'
  */
  instrumentRoutes
);

export default router;
