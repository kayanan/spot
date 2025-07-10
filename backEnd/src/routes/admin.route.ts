import { Router } from 'express';
import {roleAdminRouter,userAdminRouter} from '@/modules/user/routes/admin/v1';

import locationAdminRouter from '@/modules/location/routes/admin/v1/index';
import parkingSubscriptionFeeAdminRouter from '@/modules/parkingSubscriptionFee/routes/admin/v1/subscriptionFeeAdminRoute';
import vehicleAdminRouter from '@/modules/parkingSubscriptionFee/routes/admin/v1/vehicleAdminRoute';
import parkingAreaAdminRouter from '@/modules/parkingArea/routes/admin/v1/parkingAreaAdminRoute';
import parkingSlotAdminRouter from '@/modules/parkingArea/routes/admin/v1/parkingSlotAdminRoute';
import subscriptionPaymentAdminRouter from '@/modules/parkingSubscriptionFee/routes/admin/v1/subscriptionPaymentAdminRoute';
import reservationAdminRouter from '../modules/reservation/routes/admin/v1/reservation.admin.router';
import reportAdminRouter from '@/modules/report/routes/admin/v1/report.routes';

const adminRouter: Router = Router();
adminRouter.use('/v1/users', userAdminRouter);
adminRouter.use('/v1/roles', roleAdminRouter);
adminRouter.use('/v1/province', locationAdminRouter.provinceAdminRouter);
adminRouter.use('/v1/district', locationAdminRouter.districtAdminRouter);
adminRouter.use('/v1/city', locationAdminRouter.cityAdminRouter);
adminRouter.use('/v1/parking-subscription-fee', parkingSubscriptionFeeAdminRouter);
adminRouter.use('/v1/vehicle', vehicleAdminRouter);
adminRouter.use('/v1/parking-area', parkingAreaAdminRouter);
adminRouter.use('/v1/parking-slot', parkingSlotAdminRouter);
adminRouter.use('/v1/subscription-payment', subscriptionPaymentAdminRouter);
adminRouter.use('/v1/reservation', reservationAdminRouter);
adminRouter.use('/v1/reports', reportAdminRouter);

export default adminRouter;
