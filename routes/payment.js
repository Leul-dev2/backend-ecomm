import express from 'express';
import asyncHandler from 'express-async-handler'; // if using

import * as paymentController from '../controllers/paymentController.js';
import * as customerController from '../controllers/customerController.js';

const router = express.Router();

router.post(
  '/create-payment-intent',
  asyncHandler(paymentController.createPaymentIntent)
);

router.post(
  '/create-setup-intent',
  asyncHandler(paymentController.createSetupIntent)
);

router.get(
  '/list-payment-methods',
  asyncHandler(paymentController.listPaymentMethods)
);

router.post(
  '/create-customer',
  asyncHandler(customerController.createOrGetCustomer)
);

export default router;
