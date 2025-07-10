import {
  createSubscriptionPaymentService,
  getSubscriptionPaymentsService,
  getSubscriptionPaymentByIdService,
  updateSubscriptionPaymentService,
  softDeleteSubscriptionPaymentService,
  deleteSubscriptionPaymentService,
  getSubscriptionPaymentByParkingAreaIdService,
  generateHashService,
  notifyPaymentService
} from '../subscriptionPayment.service';
import * as subscriptionPaymentRepo from '../../data/repositories/subscriptionPayment.repository';
import * as parkingAreaRepo from '../../../parkingArea/repository/parkingArea.repository';
import { PaymentMethod, PaymentStatus, PaymentGateway } from '../../data/dtos/subscriptionPayment.dto';

// Mock dependencies
jest.mock('../../data/repositories/subscriptionPayment.repository');
jest.mock('../../../parkingArea/repository/parkingArea.repository');

const mockSubscriptionPaymentRepo = subscriptionPaymentRepo as jest.Mocked<typeof subscriptionPaymentRepo>;
const mockParkingAreaRepo = parkingAreaRepo as jest.Mocked<typeof parkingAreaRepo>;

// Helper to mock crypto.createHash chain
function mockCryptoHash(returnValue: string) {
  const toUpperCase = jest.fn().mockReturnValue(returnValue);
  const toString = jest.fn().mockReturnValue(returnValue);
  const digest = jest.fn().mockReturnValue({ toString, toUpperCase });
  const update = jest.fn().mockReturnValue({ digest });
  const createHash = jest.fn().mockReturnValue({ update });
  return { createHash, update, digest, toString, toUpperCase };
}

describe('Subscription Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.MERCHANT_SECRET = 'test_secret';
    process.env.MERCHANT_ID = 'test_merchant_id';
  });

  describe('createSubscriptionPaymentService', () => {
    const mockRawPayment = {
      parkingOwnerId: '507f1f77bcf86cd799439011',
      parkingAreaId: '507f1f77bcf86cd799439012',
      amount: 1000,
      paymentReference: 'REF123',
      bankName: 'Test Bank',
      branch: 'Test Branch',
      referenceNumber: 'REF456',
      images: ['image1.jpg', 'image2.jpg']
    };

    const mockCreatedPayment = {
      _id: '507f1f77bcf86cd799439013',
      ...mockRawPayment,
      paymentStatus: PaymentStatus.PENDING,
      paymentDate: new Date(),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentDetails: {
        bankName: 'Test Bank',
        branch: 'Test Branch',
        referenceNumber: 'REF456',
        images: ['image1.jpg', 'image2.jpg']
      },
      createdBy: '507f1f77bcf86cd799439011'
    };

    it('should create subscription payment successfully', async () => {
      mockSubscriptionPaymentRepo.createSubscriptionPayment.mockResolvedValue(mockCreatedPayment as any);

      const result = await createSubscriptionPaymentService(mockRawPayment);

      expect(mockSubscriptionPaymentRepo.createSubscriptionPayment).toHaveBeenCalledWith({
        parkingOwnerId: '507f1f77bcf86cd799439011',
        parkingAreaId: '507f1f77bcf86cd799439012',
        amount: 1000,
        paymentStatus: PaymentStatus.PENDING,
        paymentDate: expect.any(Date),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentReference: 'REF123',
        paymentDetails: {
          bankName: 'Test Bank',
          branch: 'Test Branch',
          referenceNumber: 'REF456',
          images: ['image1.jpg', 'image2.jpg']
        },
        createdBy: '507f1f77bcf86cd799439011'
      });
      expect(result).toEqual(mockCreatedPayment);
    });

    it('should create payment with default values when optional fields are missing', async () => {
      const minimalPayment = {
        parkingOwnerId: '507f1f77bcf86cd799439011',
        parkingAreaId: '507f1f77bcf86cd799439012',
        amount: 1000
      };

      mockSubscriptionPaymentRepo.createSubscriptionPayment.mockResolvedValue(mockCreatedPayment as any);

      await createSubscriptionPaymentService(minimalPayment);

      expect(mockSubscriptionPaymentRepo.createSubscriptionPayment).toHaveBeenCalledWith({
        parkingOwnerId: '507f1f77bcf86cd799439011',
        parkingAreaId: '507f1f77bcf86cd799439012',
        amount: 1000,
        paymentStatus: PaymentStatus.PENDING,
        paymentDate: expect.any(Date),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentReference: undefined,
        paymentDetails: {
          bankName: undefined,
          branch: undefined,
          referenceNumber: undefined,
          images: undefined
        },
        createdBy: '507f1f77bcf86cd799439011'
      });
    });
  });

  describe('getSubscriptionPaymentsService', () => {
    it('should get all subscription payments', async () => {
      const mockPayments = [
        { _id: '507f1f77bcf86cd799439013', amount: 1000 },
        { _id: '507f1f77bcf86cd799439014', amount: 2000 }
      ];
      mockSubscriptionPaymentRepo.getSubscriptionPayments.mockResolvedValue(mockPayments as any);

      const result = await getSubscriptionPaymentsService({});

      expect(mockSubscriptionPaymentRepo.getSubscriptionPayments).toHaveBeenCalledWith({});
      expect(result).toEqual(mockPayments);
    });
  });

  describe('getSubscriptionPaymentByIdService', () => {
    it('should get subscription payment by id', async () => {
      const mockPayment = { _id: '507f1f77bcf86cd799439013', amount: 1000 };
      mockSubscriptionPaymentRepo.getSubscriptionPaymentById.mockResolvedValue(mockPayment as any);

      const result = await getSubscriptionPaymentByIdService('507f1f77bcf86cd799439013');

      expect(mockSubscriptionPaymentRepo.getSubscriptionPaymentById).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(result).toEqual(mockPayment);
    });
  });

  describe('updateSubscriptionPaymentService', () => {
    it('should update subscription payment', async () => {
      const mockPayment = { _id: '507f1f77bcf86cd799439013', amount: 1500 };
      const updateData = { amount: 1500 };
      mockSubscriptionPaymentRepo.updateSubscriptionPayment.mockResolvedValue(mockPayment as any);

      const result = await updateSubscriptionPaymentService('507f1f77bcf86cd799439013', updateData as any);

      expect(mockSubscriptionPaymentRepo.updateSubscriptionPayment).toHaveBeenCalledWith('507f1f77bcf86cd799439013', updateData);
      expect(result).toEqual(mockPayment);
    });
  });

  describe('softDeleteSubscriptionPaymentService', () => {
    it('should soft delete subscription payment', async () => {
      const mockDeletedPayment = { _id: '507f1f77bcf86cd799439013', isDeleted: true };
      mockSubscriptionPaymentRepo.softDeleteSubscriptionPayment.mockResolvedValue(mockDeletedPayment as any);

      const result = await softDeleteSubscriptionPaymentService('507f1f77bcf86cd799439013');

      expect(mockSubscriptionPaymentRepo.softDeleteSubscriptionPayment).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(result).toEqual(mockDeletedPayment);
    });
  });

  describe('deleteSubscriptionPaymentService', () => {
    it('should delete subscription payment', async () => {
      const mockDeletedPayment = { _id: '507f1f77bcf86cd799439013' };
      mockSubscriptionPaymentRepo.deleteSubscriptionPayment.mockResolvedValue(mockDeletedPayment as any);

      const result = await deleteSubscriptionPaymentService('507f1f77bcf86cd799439013');

      expect(mockSubscriptionPaymentRepo.deleteSubscriptionPayment).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(result).toEqual(mockDeletedPayment);
    });
  });

  describe('getSubscriptionPaymentByParkingAreaIdService', () => {
    it('should get subscription payments by parking area id', async () => {
      const mockPayments = [
        { _id: '507f1f77bcf86cd799439013', parkingAreaId: '507f1f77bcf86cd799439012' }
      ];
      mockSubscriptionPaymentRepo.getSubscriptionPayments.mockResolvedValue(mockPayments as any);

      const result = await getSubscriptionPaymentByParkingAreaIdService('507f1f77bcf86cd799439012');

      expect(mockSubscriptionPaymentRepo.getSubscriptionPayments).toHaveBeenCalledWith({
        parkingAreaId: '507f1f77bcf86cd799439012',
        isDeleted: false
      });
      expect(result).toEqual(mockPayments);
    });
  });

  describe('generateHashService', () => {
    it('should generate hash successfully', async () => {
      const mockBody = {
        order_id: 'ORDER123',
        amount: '1000.00',
        currency: 'LKR'
      };
      const { createHash } = mockCryptoHash('MOCKED_HASH');
      const crypto = require('crypto');
      jest.spyOn(crypto, 'createHash').mockImplementation(createHash);
      const result = await generateHashService(mockBody);
      expect(result).toEqual({
        hash: 'MOCKED_HASH',
        merchant_id: 'test_merchant_id'
      });
    });
  });

  describe('notifyPaymentService', () => {
    const mockSuccessBody = {
      merchant_id: 'test_merchant_id',
      order_id: 'ORDER123',
      payhere_amount: '1000.00',
      payhere_currency: 'LKR',
      status_code: '2',
      md5sig: 'MOCKED_HASH', // Match the mocked hash
      custom_1: '507f1f77bcf86cd799439011', // parkingOwnerId
      custom_2: '507f1f77bcf86cd799439012', // parkingAreaId
      payment_id: 'PAY123',
      card_no: '1234567890123456',
      card_holder_name: 'John Doe',
      card_exp: '12/25'
    };
    const mockFailedBody = {
      ...mockSuccessBody,
      status_code: '0',
      md5sig: 'INVALID_SIGNATURE'
    };
    it('should process successful payment notification', async () => {
      const { createHash } = mockCryptoHash('MOCKED_HASH');
      const crypto = require('crypto');
      jest.spyOn(crypto, 'createHash').mockImplementation(createHash);
      const mockCreatedPayment = {
        _id: '507f1f77bcf86cd799439013',
        parkingOwnerId: '507f1f77bcf86cd799439011',
        parkingAreaId: '507f1f77bcf86cd799439012'
      };
      mockSubscriptionPaymentRepo.createSubscriptionPayment.mockResolvedValue(mockCreatedPayment as any);
      mockParkingAreaRepo.updateParkingArea.mockResolvedValue({} as any);
      const result = await notifyPaymentService(mockSuccessBody);
      expect(result).toEqual({
        success: true,
        message: 'Payment successful'
      });
    });
    it('should process failed payment notification', async () => {
      const { createHash } = mockCryptoHash('DIFFERENT_SIGNATURE');
      const crypto = require('crypto');
      jest.spyOn(crypto, 'createHash').mockImplementation(createHash);
      const mockCreatedPayment = {
        _id: '507f1f77bcf86cd799439013'
      };
      mockSubscriptionPaymentRepo.createSubscriptionPayment.mockResolvedValue(mockCreatedPayment as any);
      const result = await notifyPaymentService(mockFailedBody);
      expect(result).toEqual({
        success: false,
        message: 'Payment verification failed'
      });
    });
    it('should handle payment creation failure', async () => {
      const { createHash } = mockCryptoHash('MOCKED_HASH');
      const crypto = require('crypto');
      jest.spyOn(crypto, 'createHash').mockImplementation(createHash);
      mockSubscriptionPaymentRepo.createSubscriptionPayment.mockResolvedValue(undefined as any);
      const result = await notifyPaymentService(mockSuccessBody);
      expect(result).toEqual({
        success: false,
        message: 'Payment verification failed'
      });
    });
    it('should handle missing card expiry date', async () => {
      const { createHash } = mockCryptoHash('MOCKED_HASH');
      const crypto = require('crypto');
      jest.spyOn(crypto, 'createHash').mockImplementation(createHash);
      const bodyWithoutCardExp = {
        ...mockSuccessBody,
        card_exp: undefined
      };
      const mockCreatedPayment = {
        _id: '507f1f77bcf86cd799439013'
      };
      mockSubscriptionPaymentRepo.createSubscriptionPayment.mockResolvedValue(mockCreatedPayment as any);
      mockParkingAreaRepo.updateParkingArea.mockResolvedValue({} as any);
      await notifyPaymentService(bodyWithoutCardExp);
      expect(mockSubscriptionPaymentRepo.createSubscriptionPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentDetails: {
            cardNumber: '1234567890123456',
            cardHolderName: 'John Doe',
            cardExpiryMonth: '',
            cardExpiryYear: ''
          }
        })
      );
    });
  });
}); 