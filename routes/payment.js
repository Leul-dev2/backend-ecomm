import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import * as customerController from '../controllers/customerController.js';

const router = express.Router();

router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/create-setup-intent', paymentController.createSetupIntent);
router.get('/list-payment-methods', paymentController.listPaymentMethods);
router.post('/create-customer', customerController.createOrGetCustomer);

export default router;
