// import * as repo from '../../data/repositories/reservationPayment.repository';
// import * as validator from '../../validators/reservationPayment.validator';
// import * as reservationPaymentService from '../reservationPayment.service';
// import { PaymentStatus, PaymentMethod } from '../../data/dtos/reservationPayment.dto';
// import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// // Mock dependencies
// jest.mock('../../data/repositories/reservationPayment.repository');
// jest.mock('../../validators/reservationPayment.validator');

// beforeEach(() => {
//   jest.clearAllMocks();
//   jest.spyOn(require('../../data/repositories/reservation.repository'), 'updateReservation').mockResolvedValue({});
// });

// const mockRepo = repo as jest.Mocked<typeof repo>;
// const mockValidator = validator.ReservationPaymentValidator as jest.Mocked<typeof validator.ReservationPaymentValidator>;

// describe('Reservation Payment Service', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('createReservationPaymentService', () => {
//     const mockPaymentData = {
//       reservation: '507f1f77bcf86cd799439011',
//       paymentStatus: PaymentStatus.PENDING,
//       paymentAmount: 1000,
//       paymentDate: new Date(),
//       paymentMethod: PaymentMethod.CASH,
//       referenceNumber: 'REF123',
//       bankName: 'Test Bank',
//       branch: 'Test Branch',
//       cardPaymentDetails: {
//         cardNumber: '1234567890123456',
//         cardHolderName: 'John Doe',
//         cardExpiryMonth: '12',
//         cardExpiryYear: '25',
//       },
//       images: ['image1.jpg', 'image2.jpg'],
//       paidBy: '507f1f77bcf86cd799439012',
//       customer: '507f1f77bcf86cd799439013'
//     };

//     it('should create reservation payment successfully', async () => {
//       mockValidator.createReservationPaymentValidator.mockReturnValue({
//         success: true,
//         data: mockPaymentData
//       } as any);
//       mockRepo.createReservationPayment.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', ...mockPaymentData } as any);

//       const result = await reservationPaymentService.createReservationPaymentService(mockPaymentData as any);

//       expect(mockValidator.createReservationPaymentValidator).toHaveBeenCalledWith(mockPaymentData);
//       expect(mockRepo.createReservationPayment).toHaveBeenCalledWith(expect.objectContaining(mockPaymentData));
//       expect(result).toEqual({ _id: '507f1f77bcf86cd799439011', ...mockPaymentData });
//     });

//     it('should throw error when validation fails', async () => {
//       mockValidator.createReservationPaymentValidator.mockReturnValue({
//         success: false,
//         error: { message: 'Validation failed' }
//       } as any);

//       await expect(reservationPaymentService.createReservationPaymentService(mockPaymentData as any))
//         .rejects.toThrow('Failed to create reservation payment: Validation failed');

//       expect(mockValidator.createReservationPaymentValidator).toHaveBeenCalledWith(mockPaymentData);
//       expect(mockRepo.createReservationPayment).not.toHaveBeenCalled();
//     });

//     it('should handle repository errors', async () => {
//       mockValidator.createReservationPaymentValidator.mockReturnValue({
//         success: true,
//         data: mockPaymentData
//       } as any);
//       mockRepo.createReservationPayment.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.createReservationPaymentService(mockPaymentData as any))
//         .rejects.toThrow('Failed to create reservation payment: Database error');
//     });
//   });

//   describe('updateReservationPaymentService', () => {
//     const mockUpdateData = {
//       paymentStatus: PaymentStatus.PAID,
//       paymentAmount: 1500
//     };

//     it('should update reservation payment successfully', async () => {
//       const mockUpdatedPayment = { _id: 'payment1', ...mockUpdateData };
//       mockRepo.updateReservationPayment.mockResolvedValue(mockUpdatedPayment as any);

//       const result = await reservationPaymentService.updateReservationPaymentService('payment1', mockUpdateData);

//       expect(mockRepo.updateReservationPayment).toHaveBeenCalledWith('payment1', mockUpdateData);
//       expect(result).toEqual(mockUpdatedPayment);
//     });

//     it('should throw error when payment not found', async () => {
//       mockRepo.updateReservationPayment.mockResolvedValue(null);

//       await expect(reservationPaymentService.updateReservationPaymentService('payment1', mockUpdateData))
//         .rejects.toThrow('Failed to update reservation payment: Reservation payment not found');
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.updateReservationPayment.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.updateReservationPaymentService('payment1', mockUpdateData))
//         .rejects.toThrow('Failed to update reservation payment: Database error');
//     });
//   });

//   describe('deleteReservationPaymentService', () => {
//     it('should delete reservation payment successfully', async () => {
//       const mockDeletedPayment = { _id: 'payment1', isDeleted: true };
//       mockRepo.deleteReservationPayment.mockResolvedValue(mockDeletedPayment as any);

//       const result = await reservationPaymentService.deleteReservationPaymentService('payment1');

//       expect(mockRepo.deleteReservationPayment).toHaveBeenCalledWith('payment1');
//       expect(result).toEqual(mockDeletedPayment);
//     });

//     it('should throw error when payment not found', async () => {
//       mockRepo.deleteReservationPayment.mockResolvedValue(null);

//       await expect(reservationPaymentService.deleteReservationPaymentService('payment1'))
//         .rejects.toThrow('Failed to delete reservation payment: Reservation payment not found');
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.deleteReservationPayment.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.deleteReservationPaymentService('payment1'))
//         .rejects.toThrow('Failed to delete reservation payment: Database error');
//     });
//   });

//   describe('getReservationPaymentByIdService', () => {
//     it('should get reservation payment by id successfully', async () => {
//       const mockPayment = { _id: 'payment1', paymentAmount: 1000 };
//       mockRepo.findReservationPaymentById.mockResolvedValue(mockPayment as any);

//       const result = await reservationPaymentService.getReservationPaymentByIdService('payment1');

//       expect(mockRepo.findReservationPaymentById).toHaveBeenCalledWith('payment1');
//       expect(result).toEqual(mockPayment);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findReservationPaymentById.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentByIdService('payment1'))
//         .rejects.toThrow('Failed to get reservation payment: Database error');
//     });
//   });

//   //   it('should get all reservation payments successfully', async () => {
//   //     const mockPayments = [
//   //       { _id: 'payment1', paymentAmount: 1000 },
//   //       { _id: 'payment2', paymentAmount: 2000 }
//   //     ];
//   //     mockRepo.findAllReservationPayments.mockResolvedValue(mockPayments as any);

//   //     const result = await reservationPaymentService.getAllReservationPaymentsService();

//   //     expect(mockRepo.findAllReservationPayments).toHaveBeenCalled();
//   //     expect(result).toEqual(mockPayments);
//   //   });

//   //   it('should handle repository errors', async () => {
//   //     mockRepo.findAllReservationPayments.mockRejectedValue(new Error('Database error'));

//   //     await expect(reservationPaymentService.getAllReservationPaymentsService())
//   //       .rejects.toThrow('Failed to get all reservation payments: Database error');
//   //   });
//   // });

//   describe('getReservationPaymentsByReservationService', () => {
//     it('should get reservation payments by reservation successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', reservation: 'res1' }];
//       mockRepo.findReservationPaymentsByReservation.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getReservationPaymentsByReservationService('res1');

//       expect(mockRepo.findReservationPaymentsByReservation).toHaveBeenCalledWith('res1');
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findReservationPaymentsByReservation.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentsByReservationService('res1'))
//         .rejects.toThrow('Failed to get reservation payments by reservation: Database error');
//     });
//   });

//   describe('getReservationPaymentsByCustomerService', () => {
//     it('should get reservation payments by customer successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', customer: 'customer1' }];
//       mockRepo.findReservationPaymentsByCustomer.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getReservationPaymentsByCustomerService('customer1');

//       expect(mockRepo.findReservationPaymentsByCustomer).toHaveBeenCalledWith('customer1');
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findReservationPaymentsByCustomer.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentsByCustomerService('customer1'))
//         .rejects.toThrow('Failed to get reservation payments by customer: Database error');
//     });
//   });

//   describe('getReservationPaymentsByParkingAreaService', () => {
//     it('should get reservation payments by parking area successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', parkingArea: 'area1' }];
//       mockRepo.findReservationPaymentsByParkingArea.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getReservationPaymentsByParkingAreaService('area1');

//       expect(mockRepo.findReservationPaymentsByParkingArea).toHaveBeenCalledWith('area1');
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findReservationPaymentsByParkingArea.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentsByParkingAreaService('area1'))
//         .rejects.toThrow('Failed to get reservation payments by parking area: Database error');
//     });
//   });

//   describe('getReservationPaymentsByParkingSlotService', () => {
//     it('should get reservation payments by parking slot successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', parkingSlot: 'slot1' }];
//       mockRepo.findReservationPaymentsByParkingSlot.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getReservationPaymentsByParkingSlotService('slot1');

//       expect(mockRepo.findReservationPaymentsByParkingSlot).toHaveBeenCalledWith('slot1');
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findReservationPaymentsByParkingSlot.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentsByParkingSlotService('slot1'))
//         .rejects.toThrow('Failed to get reservation payments by parking slot: Database error');
//     });
//   });

//   describe('getReservationPaymentsByPaymentStatusService', () => {
//     it('should get reservation payments by payment status successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', paymentStatus: PaymentStatus.PAID }];
//       mockRepo.findReservationPaymentsByPaymentStatus.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getReservationPaymentsByPaymentStatusService(PaymentStatus.PAID);

//       expect(mockRepo.findReservationPaymentsByPaymentStatus).toHaveBeenCalledWith(PaymentStatus.PAID);
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findReservationPaymentsByPaymentStatus.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentsByPaymentStatusService(PaymentStatus.PAID))
//         .rejects.toThrow('Failed to get reservation payments by payment status: Database error');
//     });
//   });

//   describe('getReservationPaymentsByPaymentMethodService', () => {
//     it('should get reservation payments by payment method successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', paymentMethod: PaymentMethod.CARD }];
//       mockRepo.findReservationPaymentsByPaymentMethod.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getReservationPaymentsByPaymentMethodService(PaymentMethod.CARD);

//       expect(mockRepo.findReservationPaymentsByPaymentMethod).toHaveBeenCalledWith(PaymentMethod.CARD);
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findReservationPaymentsByPaymentMethod.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentsByPaymentMethodService(PaymentMethod.CARD))
//         .rejects.toThrow('Failed to get reservation payments by payment method: Database error');
//     });
//   });

//   describe('getReservationPaymentsByDateRangeService', () => {
//     it('should get reservation payments by date range successfully', async () => {
//       const startDate = new Date('2024-01-01');
//       const endDate = new Date('2024-12-31');
//       const mockPayments = [{ _id: 'payment1', paymentDate: new Date('2024-06-01') }];
//       mockRepo.findReservationPaymentsByDateRange.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getReservationPaymentsByDateRangeService(startDate, endDate);

//       expect(mockRepo.findReservationPaymentsByDateRange).toHaveBeenCalledWith(startDate, endDate);
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       const startDate = new Date('2024-01-01');
//       const endDate = new Date('2024-12-31');
//       mockRepo.findReservationPaymentsByDateRange.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentsByDateRangeService(startDate, endDate))
//         .rejects.toThrow('Failed to get reservation payments by date range: Database error');
//     });
//   });

//   describe('getReservationPaymentByReferenceNumberService', () => {
//     it('should get reservation payment by reference number successfully', async () => {
//       const mockPayment = { _id: 'payment1', referenceNumber: 'REF123' };
//       mockRepo.findReservationPaymentsByReferenceNumber.mockResolvedValue(mockPayment as any);

//       const result = await reservationPaymentService.getReservationPaymentByReferenceNumberService('REF123');

//       expect(mockRepo.findReservationPaymentsByReferenceNumber).toHaveBeenCalledWith('REF123');
//       expect(result).toEqual(mockPayment);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findReservationPaymentsByReferenceNumber.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentByReferenceNumberService('REF123'))
//         .rejects.toThrow('Failed to get reservation payment by reference number: Database error');
//     });
//   });

//   describe('getReservationPaymentsByPaidByService', () => {
//     it('should get reservation payments by paid by successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', paidBy: 'user1' }];
//       mockRepo.findReservationPaymentsByPaidBy.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getReservationPaymentsByPaidByService('user1');

//       expect(mockRepo.findReservationPaymentsByPaidBy).toHaveBeenCalledWith('user1');
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findReservationPaymentsByPaidBy.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentsByPaidByService('user1'))
//         .rejects.toThrow('Failed to get reservation payments by paid by: Database error');
//     });
//   });

//   describe('getReservationPaymentsByAmountRangeService', () => {
//     it('should get reservation payments by amount range successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', paymentAmount: 1500 }];
//       mockRepo.findReservationPaymentsByAmountRange.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getReservationPaymentsByAmountRangeService(1000, 2000);

//       expect(mockRepo.findReservationPaymentsByAmountRange).toHaveBeenCalledWith(1000, 2000);
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findReservationPaymentsByAmountRange.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getReservationPaymentsByAmountRangeService(1000, 2000))
//         .rejects.toThrow('Failed to get reservation payments by amount range: Database error');
//     });
//   });

//   describe('getSuccessfulPaymentsService', () => {
//     it('should get successful payments successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', paymentStatus: PaymentStatus.PAID }];
//       mockRepo.findSuccessfulPayments.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getSuccessfulPaymentsService();

//       expect(mockRepo.findSuccessfulPayments).toHaveBeenCalled();
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findSuccessfulPayments.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getSuccessfulPaymentsService())
//         .rejects.toThrow('Failed to get successful payments: Database error');
//     });
//   });

//   describe('getFailedPaymentsService', () => {
//     it('should get failed payments successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', paymentStatus: PaymentStatus.FAILED }];
//       mockRepo.findFailedPayments.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getFailedPaymentsService();

//       expect(mockRepo.findFailedPayments).toHaveBeenCalled();
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findFailedPayments.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getFailedPaymentsService())
//         .rejects.toThrow('Failed to get failed payments: Database error');
//     });
//   });

//   describe('getPendingPaymentsService', () => {
//     it('should get pending payments successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', paymentStatus: PaymentStatus.PENDING }];
//       mockRepo.findPendingPayments.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getPendingPaymentsService();

//       expect(mockRepo.findPendingPayments).toHaveBeenCalled();
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findPendingPayments.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getPendingPaymentsService())
//         .rejects.toThrow('Failed to get pending payments: Database error');
//     });
//   });

//   describe('getRefundedPaymentsService', () => {
//     it('should get refunded payments successfully', async () => {
//       const mockPayments = [{ _id: 'payment1', paymentStatus: PaymentStatus.REFUNDED }];
//       mockRepo.findRefundedPayments.mockResolvedValue(mockPayments as any);

//       const result = await reservationPaymentService.getRefundedPaymentsService();

//       expect(mockRepo.findRefundedPayments).toHaveBeenCalled();
//       expect(result).toEqual(mockPayments);
//     });

//     it('should handle repository errors', async () => {
//       mockRepo.findRefundedPayments.mockRejectedValue(new Error('Database error'));

//       await expect(reservationPaymentService.getRefundedPaymentsService())
//         .rejects.toThrow('Failed to get refunded payments: Database error');
//     });
//   });
// }); 