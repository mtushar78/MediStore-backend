import express from 'express';
import { auth } from '../../app/middlewares/auth';
import { validateRequest } from '../../shared/validations/zodMiddleware';
import { MedicinesController } from './medicines.controller';
import { MedicinesValidation } from './medicines.validation';

export const medicinesRouter = express.Router();

medicinesRouter.get('/', validateRequest(MedicinesValidation.listPublic), MedicinesController.listPublic);
medicinesRouter.get('/:id', validateRequest(MedicinesValidation.getOne), MedicinesController.getOnePublic);

medicinesRouter.post('/', auth('seller'), validateRequest(MedicinesValidation.create), MedicinesController.sellerCreate);
medicinesRouter.get('/seller', auth('seller'), MedicinesController.sellerList);
medicinesRouter.patch(
  '/seller/:id',
  auth('seller'),
  validateRequest(MedicinesValidation.update),
  MedicinesController.sellerUpdate,
);
medicinesRouter.delete(
  '/seller/:id',
  auth('seller'),
  validateRequest(MedicinesValidation.getOne),
  MedicinesController.sellerDelete,
);

medicinesRouter.get('/admin', auth('admin'), MedicinesController.adminList);
medicinesRouter.patch(
  '/admin/:id',
  auth('admin'),
  validateRequest(MedicinesValidation.adminUpdate),
  MedicinesController.adminUpdate,
);
