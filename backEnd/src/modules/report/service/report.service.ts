import { ReservationDTO } from '../../reservation/data/dtos/reservation.dto';
import { ReservationPaymentDTO, PaymentStatus } from '../../reservation/data/dtos/reservationPayment.dto';
import { ParkingAreaDTO } from '../../parkingArea/data/dtos/parkingArea.dto';
import { ProvinceDTO } from '../../location/data/dtos/province.dto';
import { CityDTO } from '../../location/data/dtos/city.dto';
import { DistrictDTO } from '../../location/data/dtos/district.dto';
import { UserDTO } from '../../user/data/dtos/user.dto';
import { SubscriptionPaymentDTO } from '../../parkingSubscriptionFee/data/dtos/subscriptionPayment.dto';
import { RevenueByRegionResponse, RevenueByRegionData } from '../controller/response/revenue.by.region.response';
import { ReservationsRevenueByCityResponse, ReservationsRevenueByCityData } from '../controller/response/reservations.revenue.by.city.response';
import { RevenueByParkingOwnersResponse, ParkingOwnerData } from '../controller/response/revenue.by.parking.owners.response';
import { SubscriptionPaymentsResponse, SubscriptionPaymentData } from '../controller/response/subscription.payments.response';
import { ParkingOwnerDetailedResponse, ParkingOwnerProfile, ReservationPaymentData, ParkingAreaSummary, ParkingOwnerMetrics } from '../controller/response/parking.owner.detailed.response';
import { ReportType } from '../controller/request/generate.report.request';

export const generateRevenueByRegionReport = async (
  startDate: Date,
  endDate: Date,
  provinceId?: string
): Promise<RevenueByRegionResponse> => {
  try {
    // Calculate previous month dates
    const previousMonthStart = new Date(startDate);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    const previousMonthEnd = new Date(endDate);
    previousMonthEnd.setMonth(previousMonthEnd.getMonth() - 1);

    // Use aggregation pipeline for better performance
    const pipeline = [
      // Match provinces
      {
        $match: {
          isDeleted: false,
          ...(provinceId ? { _id: new (require('mongoose').Types.ObjectId)(provinceId) } : {})
        }
      },
      // Lookup parking areas
      {
        $lookup: {
          from: 'parkingareas',
          localField: '_id',
          foreignField: 'province',
          as: 'parkingAreas',
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $lookup: {
                from: 'reservations',
                localField: '_id',
                foreignField: 'parkingArea',
                as: 'reservations',
                pipeline: [
                  {
                    $match: {
                      isDeleted: false,
                      status: { $in: ['confirmed', 'completed'] },
                      $or: [
                        { startDateAndTime: { $gte: startDate, $lte: endDate } },
                        { startDateAndTime: { $gte: previousMonthStart, $lte: previousMonthEnd } }
                      ]
                    }
                  },
                  {
                    $lookup: {
                      from: 'reservationpayments',
                      localField: '_id',
                      foreignField: 'reservation',
                      as: 'payments',
                      pipeline: [
                        {
                          $match: {
                            isDeleted: false,
                            paymentStatus: PaymentStatus.PAID
                          }
                        }
                      ]
                    }
                  },
                  {
                    $addFields: {
                      hasPaidPayments: { $gt: [{ $size: '$payments' }, 0] },
                      totalPaymentAmount: {
                        $sum: '$payments.paymentAmount'
                      }
                    }
                  },
                  {
                    $match: {
                      hasPaidPayments: true
                    }
                  }
                ]
              }
            },
            {
              $addFields: {
                currentMonthReservations: {
                  $filter: {
                    input: '$reservations',
                    as: 'reservation',
                    cond: {
                      $and: [
                        { $gte: ['$$reservation.startDateAndTime', startDate] },
                        { $lte: ['$$reservation.startDateAndTime', endDate] }
                      ]
                    }
                  }
                },
                previousMonthReservations: {
                  $filter: {
                    input: '$reservations',
                    as: 'reservation',
                    cond: {
                      $and: [
                        { $gte: ['$$reservation.startDateAndTime', previousMonthStart] },
                        { $lte: ['$$reservation.startDateAndTime', previousMonthEnd] }
                      ]
                    }
                  }
                }
              }
            },
            {
              $addFields: {
                currentMonthRevenue: {
                  $sum: '$currentMonthReservations.totalPaymentAmount'
                },
                previousMonthRevenue: {
                  $sum: '$previousMonthReservations.totalPaymentAmount'
                },
                currentMonthBookings: { $size: '$currentMonthReservations' },
                previousMonthBookings: { $size: '$previousMonthReservations' }
              }
            }
          ]
        }
      },
      {
        $addFields: {
          totalRevenue: { $sum: '$parkingAreas.currentMonthRevenue' },
          totalBookings: { $sum: '$parkingAreas.currentMonthBookings' },
          totalParkingAreas: { $size: '$parkingAreas' },
          previousMonthRevenue: { $sum: '$parkingAreas.previousMonthRevenue' },
          previousMonthBookings: { $sum: '$parkingAreas.previousMonthBookings' }
        }
      },
      {
        $addFields: {
          growthPercentage: {
            $cond: {
              if: { $gt: ['$previousMonthRevenue', 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$totalRevenue', '$previousMonthRevenue'] },
                      '$previousMonthRevenue'
                    ]
                  },
                  100
                ]
              },
              else: 0
            }
          },
          averageRevenuePerBooking: {
            $cond: {
              if: { $gt: ['$totalBookings', 0] },
              then: { $divide: ['$totalRevenue', '$totalBookings'] },
              else: 0
            }
          },
          averageRevenuePerParkingArea: {
            $cond: {
              if: { $gt: ['$totalParkingAreas', 0] },
              then: { $divide: ['$totalRevenue', '$totalParkingAreas'] },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          provinceId: '$_id',
          provinceName: '$name',
          totalRevenue: 1,
          totalBookings: 1,
          totalParkingAreas: 1,
          currentMonthRevenue: '$totalRevenue',
          previousMonthRevenue: 1,
          growthPercentage: { $round: ['$growthPercentage', 2] },
          averageRevenuePerBooking: { $round: ['$averageRevenuePerBooking', 2] },
          averageRevenuePerParkingArea: { $round: ['$averageRevenuePerParkingArea', 2] }
        }
      }
    ];

    const reportData = await ProvinceDTO.aggregate(pipeline);

    // Calculate summary
    const summary = {
      totalRevenue: reportData.reduce((sum, item) => sum + item.totalRevenue, 0),
      totalBookings: reportData.reduce((sum, item) => sum + item.totalBookings, 0),
      totalParkingAreas: reportData.reduce((sum, item) => sum + item.totalParkingAreas, 0),
      averageGrowthPercentage: reportData.length > 0 
        ? reportData.reduce((sum, item) => sum + item.growthPercentage, 0) / reportData.length 
        : 0
    };

    return {
      status: true,
      message: 'Revenue by region report generated successfully',
      data: reportData,
      summary: {
        ...summary,
        averageGrowthPercentage: Math.round(summary.averageGrowthPercentage * 100) / 100
      },
      generatedAt: new Date()
    };

  } catch (error: any) {
    throw new Error(`Failed to generate revenue by region report: ${error.message}`);
  }
};

export const generateReservationsRevenueByCityReport = async (
  startDate: Date,
  endDate: Date,
  cityId?: string
): Promise<ReservationsRevenueByCityResponse> => {
  try {
    // Use aggregation pipeline for better performance
    const pipeline = [
      // Match cities
      {
        $match: {
          isDeleted: false,
          isActive: true,
          ...(cityId ? { _id: new (require('mongoose').Types.ObjectId)(cityId) } : {})
        }
      },
      // Lookup district information
      {
        $lookup: {
          from: 'districts',
          localField: 'districtId',
          foreignField: '_id',
          as: 'district',
          pipeline: [
            { $match: { isDeleted: false, isActive: true } },
            {
              $lookup: {
                from: 'provinces',
                localField: 'provinceId',
                foreignField: '_id',
                as: 'province',
                pipeline: [
                  { $match: { isDeleted: false } }
                ]
              }
            },
            {
              $addFields: {
                province: { $arrayElemAt: ['$province', 0] }
              }
            }
          ]
        }
      },
      {
        $addFields: {
          district: { $arrayElemAt: ['$district', 0] }
        }
      },
      // Lookup parking areas in this city
      {
        $lookup: {
          from: 'parkingareas',
          localField: '_id',
          foreignField: 'city',
          as: 'parkingAreas',
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $lookup: {
                from: 'reservations',
                localField: '_id',
                foreignField: 'parkingArea',
                as: 'reservations',
                pipeline: [
                  {
                    $match: {
                      isDeleted: false,
                      status: { $in: ['confirmed', 'completed'] },
                      startDateAndTime: { $gte: startDate, $lte: endDate }
                    }
                  },
                  {
                    $lookup: {
                      from: 'reservationpayments',
                      localField: '_id',
                      foreignField: 'reservation',
                      as: 'payments',
                      pipeline: [
                        {
                          $match: {
                            isDeleted: false,
                            paymentStatus: PaymentStatus.PAID
                          }
                        }
                      ]
                    }
                  },
                  {
                    $addFields: {
                      hasPaidPayments: { $gt: [{ $size: '$payments' }, 0] },
                      totalPaymentAmount: {
                        $sum: '$payments.paymentAmount'
                      }
                    }
                  },
                  {
                    $match: {
                      hasPaidPayments: true
                    }
                  }
                ]
              }
            },
            {
              $addFields: {
                totalReservations: { $size: '$reservations' },
                totalRevenue: {
                  $sum: '$reservations.totalPaymentAmount'
                }
              }
            }
          ]
        }
      },
      {
        $addFields: {
          totalReservations: { $sum: '$parkingAreas.totalReservations' },
          totalRevenue: { $sum: '$parkingAreas.totalRevenue' },
          averageRevenuePerReservation: {
            $cond: {
              if: { $gt: ['$totalReservations', 0] },
              then: { $divide: ['$totalRevenue', '$totalReservations'] },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          cityId: '$_id',
          cityName: '$name',
          districtId: '$district._id',
          districtName: '$district.name',
          provinceId: '$district.province._id',
          provinceName: '$district.province.name',
          totalReservations: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          averageRevenuePerReservation: { $round: ['$averageRevenuePerReservation', 2] }
        }
      },
      {
        $sort: { totalRevenue: -1 as const }
      }
    ];

    const reportData = await CityDTO.aggregate(pipeline);

    // Calculate summary
    const summary = {
      totalReservations: reportData.reduce((sum, item) => sum + item.totalReservations, 0),
      totalRevenue: reportData.reduce((sum, item) => sum + item.totalRevenue, 0),
      averageRevenuePerReservation: reportData.length > 0 
        ? reportData.reduce((sum, item) => sum + item.averageRevenuePerReservation, 0) / reportData.length 
        : 0
    };

    return {
      status: true,
      message: 'Reservations revenue by city report generated successfully',
      data: reportData,
      summary: {
        ...summary,
        averageRevenuePerReservation: Math.round(summary.averageRevenuePerReservation * 100) / 100
      },
      generatedAt: new Date()
    };

  } catch (error: any) {
    throw new Error(`Failed to generate reservations revenue by city report: ${error.message}`);
  }
};

export const generateRevenueByParkingOwnersReport = async (
  startDate: Date,
  endDate: Date,
  ownerId?: string
): Promise<RevenueByParkingOwnersResponse> => {
  try {
    // Use aggregation pipeline for better performance
    const pipeline = [
      // Match parking owners (users with OWNER role)
      {
        $match: {
          isDeleted: false,
          isActive: true,
          ...(ownerId ? { _id: new (require('mongoose').Types.ObjectId)(ownerId) } : {})
        }
      },
      // Lookup user roles to filter only OWNER role
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userData',
          pipeline: [
            {
              $lookup: {
                from: 'roles',
                localField: 'role',
                foreignField: '_id',
                as: 'roles'
              }
            },
            {
              $addFields: {
                hasOwnerRole: {
                  $anyElementTrue: {
                    $map: {
                      input: '$roles',
                      as: 'role',
                      in: { $eq: ['$$role.type', 'PARKING_OWNER'] }
                    }
                  }
                }
              }
            },
            {
              $match: {
                hasOwnerRole: true
              }
            }
          ]
        }
      },
      {
        $match: {
          'userData.0': { $exists: true }
        }
      },
      // Lookup parking areas owned by this user
      {
        $lookup: {
          from: 'parkingareas',
          localField: '_id',
          foreignField: 'ownerId',
          as: 'parkingAreas',
          pipeline: [
            { $match: { isDeleted: false } },
            // Lookup district and province information
            {
              $lookup: {
                from: 'districts',
                localField: 'district',
                foreignField: '_id',
                as: 'district',
                pipeline: [
                  { $match: { isDeleted: false } },
                  {
                    $lookup: {
                      from: 'provinces',
                      localField: 'provinceId',
                      foreignField: '_id',
                      as: 'province',
                      pipeline: [
                        { $match: { isDeleted: false } }
                      ]
                    }
                  },
                  {
                    $addFields: {
                      province: { $arrayElemAt: ['$province', 0] }
                    }
                  }
                ]
              }
            },
            {
              $addFields: {
                district: { $arrayElemAt: ['$district', 0] }
              }
            },
            // Lookup reservations for this parking area
            {
              $lookup: {
                from: 'reservations',
                localField: '_id',
                foreignField: 'parkingArea',
                as: 'reservations',
                pipeline: [
                  {
                    $match: {
                      isDeleted: false,
                      status: { $in: ['confirmed', 'completed'] },
                      startDateAndTime: { $gte: startDate, $lte: endDate }
                    }
                  },
                  {
                    $lookup: {
                      from: 'reservationpayments',
                      localField: '_id',
                      foreignField: 'reservation',
                      as: 'payments',
                      pipeline: [
                        {
                          $match: {
                            isDeleted: false,
                            paymentStatus: PaymentStatus.PAID
                          }
                        }
                      ]
                    }
                  },
                  {
                    $addFields: {
                      hasPaidPayments: { $gt: [{ $size: '$payments' }, 0] },
                      totalPaymentAmount: {
                        $sum: '$payments.paymentAmount'
                      }
                    }
                  },
                  {
                    $match: {
                      hasPaidPayments: true
                    }
                  }
                ]
              }
            },
            {
              $addFields: {
                revenue: {
                  $sum: '$reservations.totalPaymentAmount'
                },
                bookings: { $size: '$reservations' }
              }
            },
            {
              $project: {
                parkingAreaId: '$_id',
                parkingAreaName: '$name',
                districtName: '$district.name',
                provinceName: '$district.province.name',
                revenue: { $round: ['$revenue', 2] },
                bookings: 1,
                contactNumber: '$contactNumber'
              }
            }
          ]
        }
      },
      {
        $addFields: {
          totalRevenue: { $sum: '$parkingAreas.revenue' },
          totalBookings: { $sum: '$parkingAreas.bookings' },
          totalParkingAreas: { $size: '$parkingAreas' },
          averageRevenuePerParkingArea: {
            $cond: {
              if: { $gt: ['$totalParkingAreas', 0] },
              then: { $divide: ['$totalRevenue', '$totalParkingAreas'] },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          ownerId: '$_id',
          ownerName: { $concat: ['$firstName', ' ', '$lastName'] },
          ownerEmail: '$email',
          ownerContact: '$phoneNumber',
          parkingAreas: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalBookings: 1,
          totalParkingAreas: 1,
          averageRevenuePerParkingArea: { $round: ['$averageRevenuePerParkingArea', 2] }
        }
      },
      {
        $sort: { totalRevenue: -1 as const }
      }
    ];

    const reportData = await UserDTO.aggregate(pipeline);

    // Calculate summary
    const summary = {
      totalOwners: reportData.length,
      totalRevenue: reportData.reduce((sum: number, item: any) => sum + item.totalRevenue, 0),
      totalBookings: reportData.reduce((sum: number, item: any) => sum + item.totalBookings, 0),
      totalParkingAreas: reportData.reduce((sum: number, item: any) => sum + item.totalParkingAreas, 0),
      averageRevenuePerOwner: reportData.length > 0 
        ? reportData.reduce((sum: number, item: any) => sum + item.totalRevenue, 0) / reportData.length 
        : 0
    };

    return {
      status: true,
      message: 'Revenue by parking owners report generated successfully',
      data: reportData,
      summary: {
        ...summary,
        averageRevenuePerOwner: Math.round(summary.averageRevenuePerOwner * 100) / 100
      },
      generatedAt: new Date()
    };

  } catch (error: any) {
    throw new Error(`Failed to generate revenue by parking owners report: ${error.message}`);
  }
};

export const generateSubscriptionPaymentsReport = async (
  startDate: Date,
  endDate: Date,
  ownerId?: string,
  parkingAreaId?: string
): Promise<SubscriptionPaymentsResponse> => {
  try {
    // Use aggregation pipeline for better performance
    const pipeline = [
      // Match subscription payments within date range
      {
        $match: {
          isDeleted: false,
          paymentDate: { $gte: startDate, $lte: endDate },
          ...(ownerId ? { parkingOwnerId: new (require('mongoose').Types.ObjectId)(ownerId) } : {}),
          ...(parkingAreaId ? { parkingAreaId: new (require('mongoose').Types.ObjectId)(parkingAreaId) } : {})
        }
      },
      // Lookup parking owner information
      {
        $lookup: {
          from: 'users',
          localField: 'parkingOwnerId',
          foreignField: '_id',
          as: 'owner',
          pipeline: [
            { $match: { isDeleted: false } }
          ]
        }
      },
      {
        $addFields: {
          owner: { $arrayElemAt: ['$owner', 0] }
        }
      },
      // Lookup parking area information
      {
        $lookup: {
          from: 'parkingareas',
          localField: 'parkingAreaId',
          foreignField: '_id',
          as: 'parkingArea',
          pipeline: [
            { $match: { isDeleted: false } }
          ]
        }
      },
      {
        $addFields: {
          parkingArea: { $arrayElemAt: ['$parkingArea', 0] }
        }
      },
      // Calculate subscription period
      {
        $addFields: {
          subscriptionPeriod: {
            $cond: {
              if: { $and: ['$subscriptionStartDate', '$subscriptionEndDate'] },
              then: {
                $concat: [
                  {
                    $toString: {
                      $divide: [
                        {
                          $subtract: ['$subscriptionEndDate', '$subscriptionStartDate']
                        },
                        1000 * 60 * 60 * 24 * 30 // Approximate days in a month
                      ]
                    }
                  },
                  ' months'
                ]
              },
              else: 'N/A'
            }
          }
        }
      },
      {
        $project: {
          paymentId: '$_id',
          ownerId: '$parkingOwnerId',
          ownerName: { $concat: ['$owner.firstName', ' ', '$owner.lastName'] },
          ownerEmail: '$owner.email',
          ownerContact: '$owner.phoneNumber',
          parkingAreaId: '$parkingAreaId',
          parkingAreaName: '$parkingArea.name',
          amount: { $round: ['$amount', 2] },
          status: '$paymentStatus',
          paymentMethod: '$paymentMethod',
          paymentDate: 1,
          subscriptionStartDate: 1,
          subscriptionEndDate: 1,
          subscriptionPeriod: 1,
          paymentReference: 1,
          paymentGateway: 1
        }
      },
      {
        $sort: { paymentDate: -1 as const }
      }
    ];

    const reportData = await SubscriptionPaymentDTO.aggregate(pipeline);

    // Calculate summary statistics
    const summary = {
      totalPayments: reportData.length,
      totalAmount: reportData.reduce((sum: number, item: any) => sum + item.amount, 0),
      successfulPayments: reportData.filter((item: any) => item.status === 'SUCCESS').length,
      failedPayments: reportData.filter((item: any) => item.status === 'FAILED').length,
      pendingPayments: reportData.filter((item: any) => item.status === 'PENDING').length,
      averageAmount: reportData.length > 0 
        ? reportData.reduce((sum: number, item: any) => sum + item.amount, 0) / reportData.length 
        : 0
    };

    return {
      status: true,
      message: 'Subscription payments report generated successfully',
      data: reportData,
      summary: {
        ...summary,
        averageAmount: Math.round(summary.averageAmount * 100) / 100
      },
      generatedAt: new Date()
    };

  } catch (error: any) {
    throw new Error(`Failed to generate subscription payments report: ${error.message}`);
  }
};

export const generateParkingOwnerDetailedReport = async (
  startDate: Date,
  endDate: Date,
  ownerId: string
): Promise<ParkingOwnerDetailedResponse> => {
  try {
    // Get parking owner profile
    const owner = await UserDTO.findById(ownerId).lean();
    if (!owner) {
      throw new Error('Parking owner not found');
    }

    // Get parking areas owned by this owner
    const parkingAreas = await ParkingAreaDTO.find({ 
      ownerId: ownerId,
      isDeleted: false 
    }).lean();

    // Get reservation payments for this owner's parking areas
    const reservationPaymentsPipeline = [
      {
        $match: {
          isDeleted: false,
          paymentStatus: { $in: ['paid', 'SUCCESS'] } // Only successful payments
        }
      },
      {
        $lookup: {
          from: 'reservations',
          localField: 'reservation',
          foreignField: '_id',
          as: 'reservation',
          pipeline: [
            { $match: { isDeleted: false } }
          ]
        }
      },
      {
        $addFields: {
          reservation: { $arrayElemAt: ['$reservation', 0] }
        }
      },
      {
        $lookup: {
          from: 'parkingareas',
          localField: 'reservation.parkingArea',
          foreignField: '_id',
          as: 'parkingArea',
          pipeline: [
            { $match: { isDeleted: false } }
          ]
        }
      },
      {
        $addFields: {
          parkingArea: { $arrayElemAt: ['$parkingArea', 0] }
        }
      },
      {
        $match: {
          'parkingArea.ownerId': new (require('mongoose').Types.ObjectId)(ownerId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer',
          pipeline: [
            { $match: { isDeleted: false } }
          ]
        }
      },
      {
        $addFields: {
          customer: { $arrayElemAt: ['$customer', 0] }
        }
      },
      {
        $match: {
          'reservation.startDateAndTime': { $gte: startDate, $lte: endDate }
        }
      },
      {
        $project: {
          paymentId: '$_id',
          reservationId: '$reservation._id',
          paymentAmount: { $round: ['$paymentAmount', 2] },
          paymentDate: 1,
          paymentMethod: 1,
          referenceNumber: 1,
          bankName: 1,
          branch: 1,
          cardPaymentDetails: 1,
          paymentStatus: 1,
          customerName: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] },
          parkingAreaName: '$parkingArea.name',
          parkingSlot: '$reservation.parkingSlot'
        }
      },
      {
        $sort: { paymentDate: -1 as const }
      }
    ];

    const reservationPayments = await ReservationPaymentDTO.aggregate(reservationPaymentsPipeline);

    // Get subscription payments for this owner
    const subscriptionPaymentsPipeline = [
      {
        $match: {
          isDeleted: false,
          parkingOwnerId: new (require('mongoose').Types.ObjectId)(ownerId),
          paymentDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'parkingareas',
          localField: 'parkingAreaId',
          foreignField: '_id',
          as: 'parkingArea',
          pipeline: [
            { $match: { isDeleted: false } }
          ]
        }
      },
      {
        $addFields: {
          parkingArea: { $arrayElemAt: ['$parkingArea', 0] }
        }
      },
      {
        $project: {
          paymentId: '$_id',
          ownerId: '$parkingOwnerId',
          ownerName: { $concat: ['$owner.firstName', ' ', '$owner.lastName'] },
          ownerEmail: '$owner.email',
          ownerContact: '$owner.phoneNumber',
          parkingAreaId: '$parkingAreaId',
          parkingAreaName: '$parkingArea.name',
          amount: { $round: ['$amount', 2] },
          status: '$paymentStatus',
          paymentMethod: '$paymentMethod',
          paymentDate: 1,
          subscriptionStartDate: 1,
          subscriptionEndDate: 1,
          subscriptionPeriod: 1,
          paymentReference: 1,
          paymentGateway: 1
        }
      },
      {
        $sort: { paymentDate: -1 as const }
      }
    ];

    const subscriptionPayments = await SubscriptionPaymentDTO.aggregate(subscriptionPaymentsPipeline);

    // Calculate parking area summaries
    const parkingAreaSummaries: ParkingAreaSummary[] = [];
    
    for (const area of parkingAreas) {
      // Get bookings and revenue for this area using reservation payments
      const areaBookings = await ReservationPaymentDTO.aggregate([
        {
          $match: {
            isDeleted: false,
            paymentStatus: { $in: ['paid', 'SUCCESS'] } // Only successful payments
          }
        },
        {
          $lookup: {
            from: 'reservations',
            localField: 'reservation',
            foreignField: '_id',
            as: 'reservation',
            pipeline: [
              { $match: { isDeleted: false } }
            ]
          }
        },
        {
          $addFields: {
            reservation: { $arrayElemAt: ['$reservation', 0] }
          }
        },
        {
          $match: {
            'reservation.parkingArea': area._id,
            'reservation.startDateAndTime': { $gte: startDate, $lte: endDate }
          }
        }
      ]);

      const totalBookings = areaBookings.length;
      const totalRevenue = areaBookings.reduce((sum, payment) => sum + (payment.paymentAmount || 0), 0);
      const successfulPayments = areaBookings.filter(payment => 
        payment.paymentStatus === 'paid' || payment.paymentStatus === 'SUCCESS'
      ).length;

      // Calculate monthly revenue (current month)
      const currentMonthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const monthlyPayments = areaBookings.filter(payment => 
        new Date(payment.paymentDate) >= currentMonthStart
      );
      const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.paymentAmount, 0);

      // Calculate growth (simplified - could be enhanced)
      const previousMonthStart = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
      const previousMonthEnd = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
      const previousMonthPayments = await ReservationPaymentDTO.aggregate([
        {
          $match: {
            isDeleted: false,
            paymentStatus: { $in: ['paid', 'SUCCESS'] } // Only successful payments
          }
        },
        {
          $lookup: {
            from: 'reservations',
            localField: 'reservation',
            foreignField: '_id',
            as: 'reservation',
            pipeline: [
              { $match: { isDeleted: false } }
            ]
          }
        },
        {
          $addFields: {
            reservation: { $arrayElemAt: ['$reservation', 0] }
          }
        },
        {
          $match: {
            'reservation.parkingArea': area._id,
            'reservation.startDateAndTime': { $gte: previousMonthStart, $lte: previousMonthEnd }
          }
        }
      ]);

      const previousMonthRevenue = previousMonthPayments.reduce((sum, payment) => sum + (payment.paymentAmount || 0), 0);
      const growth = previousMonthRevenue > 0 
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;

      // Get ratings (simplified - would need rating system implementation)
      const averageRating = 4.5; // Mock data
      const totalReviews = totalBookings;
      const ratingBreakdown = {
        fiveStar: Math.floor(totalReviews * 0.7),
        fourStar: Math.floor(totalReviews * 0.2),
        threeStar: Math.floor(totalReviews * 0.08),
        twoStar: Math.floor(totalReviews * 0.015),
        oneStar: Math.floor(totalReviews * 0.005)
      };

      parkingAreaSummaries.push({
        areaId: area._id.toString(),
        areaName: area.name,
        totalBookings,
        totalRevenue,
        averageRating,
        location: `${area.city}, ${area.province}`,
        monthlyRevenue,
        growth: Math.round(growth * 100) / 100,
        totalReviews,
        ratingBreakdown
      });
    }

    // Calculate overall metrics
    const totalRevenue = reservationPayments.reduce((sum, payment) => sum + (payment.paymentAmount || 0), 0);
    const successfulPayments = reservationPayments.filter(payment => 
      payment.paymentStatus === 'paid' || payment.paymentStatus === 'SUCCESS'
    ).length;
    const failedPayments = reservationPayments.filter(payment => 
      payment.paymentStatus === 'failed' || payment.paymentStatus === 'FAILED'
    ).length;
    const pendingPayments = reservationPayments.filter(payment => 
      payment.paymentStatus === 'pending' || payment.paymentStatus === 'PENDING'
    ).length;
    const activeSubscriptions = subscriptionPayments.filter(payment => payment.status === 'SUCCESS').length;
    const totalSlots = parkingAreas.reduce((sum, area) => sum + ((area as any).totalSlots || 0), 0);
    const averageRating = parkingAreaSummaries.length > 0 
      ? parkingAreaSummaries.reduce((sum, area) => sum + area.averageRating, 0) / parkingAreaSummaries.length 
      : 0;

    const metrics: ParkingOwnerMetrics = {
      totalRevenue,
      monthlyRevenue: parkingAreaSummaries.reduce((sum, area) => sum + area.monthlyRevenue, 0),
      totalPayments: reservationPayments.length,
      successfulPayments,
      failedPayments,
      pendingPayments,
      activeSubscriptions,
      totalParkingAreas: parkingAreas.length,
      totalSlots,
      averageRating: Math.round(averageRating * 100) / 100
    };

    // Generate revenue trend data (last 6 months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() - i, 1);
      const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() - i + 1, 0);
      
      const monthPayments = reservationPayments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });
      
      const monthRevenue = monthPayments.reduce((sum, payment) => sum + (payment.paymentAmount || 0), 0);
      
      revenueData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      });
    }

    // Generate payment status data
    const paymentStatusCounts = {
      paid: reservationPayments.filter(p => p.paymentStatus === 'paid' || p.paymentStatus === 'SUCCESS').length,
      pending: reservationPayments.filter(p => p.paymentStatus === 'pending' || p.paymentStatus === 'PENDING').length,
      failed: reservationPayments.filter(p => p.paymentStatus === 'failed' || p.paymentStatus === 'FAILED').length
    };

    const paymentStatusData = [
      { name: 'Paid', value: paymentStatusCounts.paid, fill: '#10B981' },
      { name: 'Pending', value: paymentStatusCounts.pending, fill: '#F59E0B' },
      { name: 'Failed', value: paymentStatusCounts.failed, fill: '#EF4444' }
    ];

    // Generate most booked areas data
    const mostBookedAreas = parkingAreaSummaries
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .slice(0, 4)
      .map(area => ({
        areaId: area.areaId,
        areaName: area.areaName,
        totalBookings: area.totalBookings,
        totalRevenue: area.totalRevenue,
        averageRating: area.averageRating,
        location: area.location,
        ownerName: `${owner.firstName} ${owner.lastName}`
      }));

    // Create owner profile
    const profile: ParkingOwnerProfile = {
      ownerId: owner._id.toString(),
      firstName: owner.firstName,
      lastName: owner.lastName,
      email: owner.email,
      phoneNumber: owner.phoneNumber || '',
      nic: owner.nic || '',
      line1: owner.line1 || '',
      line2: owner.line2,
      city: owner.city || '',
      district: owner.district || '',
      province: owner.province || '',
      profileImage: owner.profileImage,
      isActive: owner.isActive || false,
      approvalStatus: owner.approvalStatus || false
    };

    return {
      status: true,
      message: 'Parking owner detailed report generated successfully',
      data: {
        profile,
        reservationPayments,
        subscriptionPayments,
        parkingAreas: parkingAreaSummaries,
        metrics,
        revenueData,
        paymentStatusData,
        mostBookedAreas
      },
      generatedAt: new Date()
    };

  } catch (error: any) {
    throw new Error(`Failed to generate parking owner detailed report: ${error.message}`);
  }
};

export const generateReport = async (
  reportType: ReportType,
  startDate: Date,
  endDate: Date,
  filters?: {
    provinceId?: string;
    parkingAreaId?: string;
    userId?: string;
    cityId?: string;
    ownerId?: string;
  }
) => {
  switch (reportType) {
    case ReportType.REVENUE_BY_REGION:
      return await generateRevenueByRegionReport(startDate, endDate, filters?.provinceId);
    
    case ReportType.RESERVATIONS_REVENUE_BY_CITY:
      return await generateReservationsRevenueByCityReport(startDate, endDate, filters?.cityId);
    
    case ReportType.REVENUE_BY_PARKING_OWNERS:
      return await generateRevenueByParkingOwnersReport(startDate, endDate, filters?.ownerId);
    
    case ReportType.SUBSCRIPTION_PAYMENTS_REPORT:
      return await generateSubscriptionPaymentsReport(startDate, endDate, filters?.ownerId, filters?.parkingAreaId);
    
    case ReportType.PARKING_OWNER_DETAILED_REPORT:
      return await generateParkingOwnerDetailedReport(startDate, endDate, filters?.ownerId || '');
    
    // Add other report types here as needed
    // case ReportType.RESERVATION_REPORT:
    //   return await generateReservationReport(startDate, endDate, filters);
    
    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }
};

// CSV Export functions
const convertToCSV = (data: any[], headers: string[]): string => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma or newline
      const escapedValue = String(value).replace(/"/g, '""');
      return escapedValue.includes(',') || escapedValue.includes('\n') || escapedValue.includes('"') 
        ? `"${escapedValue}"` 
        : escapedValue;
    }).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
};

export const generateRevenueByRegionCSV = async (
  startDate: Date,
  endDate: Date,
  provinceId?: string
): Promise<string> => {
  const report = await generateRevenueByRegionReport(startDate, endDate, provinceId);
  
  const headers = [
    'Province Name',
    'Total Revenue',
    'Total Bookings',
    'Total Parking Areas',
    'Previous Month Revenue',
    'Growth Percentage',
    'Average Revenue Per Booking',
    'Average Revenue Per Parking Area'
  ];

  const csvData = report.data.map((item: any) => ({
    'Province Name': item.provinceName,
    'Total Revenue': item.totalRevenue,
    'Total Bookings': item.totalBookings,
    'Total Parking Areas': item.totalParkingAreas,
    'Previous Month Revenue': item.previousMonthRevenue,
    'Growth Percentage': `${item.growthPercentage}%`,
    'Average Revenue Per Booking': item.averageRevenuePerBooking,
    'Average Revenue Per Parking Area': item.averageRevenuePerParkingArea
  }));

  return convertToCSV(csvData, headers);
};

export const generateReservationsRevenueByCityCSV = async (
  startDate: Date,
  endDate: Date,
  cityId?: string
): Promise<string> => {
  const report = await generateReservationsRevenueByCityReport(startDate, endDate, cityId);
  
  const headers = [
    'City Name',
    'District Name',
    'Province Name',
    'Total Reservations',
    'Total Revenue',
    'Average Revenue Per Reservation'
  ];

  const csvData = report.data.map((item: any) => ({
    'City Name': item.cityName,
    'District Name': item.districtName,
    'Province Name': item.provinceName,
    'Total Reservations': item.totalReservations,
    'Total Revenue': item.totalRevenue,
    'Average Revenue Per Reservation': item.averageRevenuePerReservation
  }));

  return convertToCSV(csvData, headers);
};

export const generateRevenueByParkingOwnersCSV = async (
  startDate: Date,
  endDate: Date,
  ownerId?: string
): Promise<string> => {
  const report = await generateRevenueByParkingOwnersReport(startDate, endDate, ownerId);
  
  const headers = [
    'Owner ID',
    'Owner Name',
    'Owner Email',
    'Owner Contact',
    'Total Revenue',
    'Total Bookings',
    'Total Parking Areas',
    'Average Revenue Per Parking Area'
  ];

  const csvData = report.data.map((item: any) => ({
    'Owner ID': item.ownerId,
    'Owner Name': item.ownerName,
    'Owner Email': item.ownerEmail,
    'Owner Contact': item.ownerContact,
    'Total Revenue': item.totalRevenue,
    'Total Bookings': item.totalBookings,
    'Total Parking Areas': item.totalParkingAreas,
    'Average Revenue Per Parking Area': item.averageRevenuePerParkingArea
  }));

  return convertToCSV(csvData, headers);
};

export const generateSubscriptionPaymentsCSV = async (
  startDate: Date,
  endDate: Date,
  ownerId?: string,
  parkingAreaId?: string
): Promise<string> => {
  const report = await generateSubscriptionPaymentsReport(startDate, endDate, ownerId, parkingAreaId);
  
  const headers = [
    'Payment ID',
    'Owner ID',
    'Owner Name',
    'Owner Email',
    'Owner Contact',
    'Parking Area ID',
    'Parking Area Name',
    'Amount',
    'Status',
    'Payment Method',
    'Payment Date',
    'Subscription Start Date',
    'Subscription End Date',
    'Subscription Period',
    'Payment Reference',
    'Payment Gateway'
  ];

  const csvData = report.data.map((item: any) => ({
    'Payment ID': item.paymentId,
    'Owner ID': item.ownerId,
    'Owner Name': item.ownerName,
    'Owner Email': item.ownerEmail,
    'Owner Contact': item.ownerContact,
    'Parking Area ID': item.parkingAreaId,
    'Parking Area Name': item.parkingAreaName,
    'Amount': item.amount,
    'Status': item.status,
    'Payment Method': item.paymentMethod,
    'Payment Date': new Date(item.paymentDate).toLocaleDateString(),
    'Subscription Start Date': new Date(item.subscriptionStartDate).toLocaleDateString(),
    'Subscription End Date': new Date(item.subscriptionEndDate).toLocaleDateString(),
    'Subscription Period': item.subscriptionPeriod,
    'Payment Reference': item.paymentReference,
    'Payment Gateway': item.paymentGateway
  }));

  return convertToCSV(csvData, headers);
}; 

export const generateParkingOwnerDetailedCSV = async (
  startDate: Date,
  endDate: Date,
  ownerId: string
): Promise<string> => {
  const report = await generateParkingOwnerDetailedReport(startDate, endDate, ownerId);
  
  // Create multiple CSV sections for different data types
  const sections = [];
  
  // 1. Owner Profile
  const profileHeaders = [
    'Owner ID',
    'First Name',
    'Last Name',
    'Email',
    'Phone Number',
    'NIC',
    'Address Line 1',
    'Address Line 2',
    'City',
    'District',
    'Province',
    'Is Active',
    'Approval Status'
  ];

  const profileData = [{
    'Owner ID': report.data.profile.ownerId,
    'First Name': report.data.profile.firstName,
    'Last Name': report.data.profile.lastName,
    'Email': report.data.profile.email,
    'Phone Number': report.data.profile.phoneNumber,
    'NIC': report.data.profile.nic,
    'Address Line 1': report.data.profile.line1,
    'Address Line 2': report.data.profile.line2 || '',
    'City': report.data.profile.city,
    'District': report.data.profile.district,
    'Province': report.data.profile.province,
    'Is Active': report.data.profile.isActive ? 'Yes' : 'No',
    'Approval Status': report.data.profile.approvalStatus ? 'Approved' : 'Pending'
  }];

  sections.push('OWNER PROFILE');
  sections.push(convertToCSV(profileData, profileHeaders));
  sections.push('');

  // 2. Reservation Payments
  if (report.data.reservationPayments.length > 0) {
    const paymentHeaders = [
      'Payment ID',
      'Reservation ID',
      'Payment Amount',
      'Payment Date',
      'Payment Method',
      'Reference Number',
      'Bank Name',
      'Branch',
      'Card Number',
      'Payment Status',
      'Customer Name',
      'Parking Area Name',
      'Parking Slot'
    ];

    const paymentData = report.data.reservationPayments.map((payment: any) => ({
      'Payment ID': payment.paymentId,
      'Reservation ID': payment.reservationId,
      'Payment Amount': payment.paymentAmount,
      'Payment Date': new Date(payment.paymentDate).toLocaleDateString(),
      'Payment Method': payment.paymentMethod,
      'Reference Number': payment.referenceNumber,
      'Bank Name': payment.bankName || '',
      'Branch': payment.branch || '',
      'Card Number': payment.cardNumber || '',
      'Payment Status': payment.paymentStatus,
      'Customer Name': payment.customerName,
      'Parking Area Name': payment.parkingAreaName,
      'Parking Slot': payment.parkingSlot
    }));

    sections.push('RESERVATION PAYMENTS');
    sections.push(convertToCSV(paymentData, paymentHeaders));
    sections.push('');
  }

  // 3. Parking Areas Summary
  if (report.data.parkingAreas.length > 0) {
    const areaHeaders = [
      'Area ID',
      'Area Name',
      'Total Bookings',
      'Total Revenue',
      'Average Rating',
      'Location',
      'Monthly Revenue',
      'Growth %',
      'Total Reviews'
    ];

    const areaData = report.data.parkingAreas.map((area: any) => ({
      'Area ID': area.areaId,
      'Area Name': area.areaName,
      'Total Bookings': area.totalBookings,
      'Total Revenue': area.totalRevenue,
      'Average Rating': area.averageRating,
      'Location': area.location,
      'Monthly Revenue': area.monthlyRevenue,
      'Growth %': `${area.growth}%`,
      'Total Reviews': area.totalReviews
    }));

    sections.push('PARKING AREAS SUMMARY');
    sections.push(convertToCSV(areaData, areaHeaders));
    sections.push('');
  }

  // 4. Overall Metrics
  const metricsHeaders = [
    'Metric',
    'Value'
  ];

  const metricsData = [
    { 'Metric': 'Total Revenue', 'Value': report.data.metrics.totalRevenue },
    { 'Metric': 'Monthly Revenue', 'Value': report.data.metrics.monthlyRevenue },
    { 'Metric': 'Total Payments', 'Value': report.data.metrics.totalPayments },
    { 'Metric': 'Successful Payments', 'Value': report.data.metrics.successfulPayments },
    { 'Metric': 'Failed Payments', 'Value': report.data.metrics.failedPayments },
    { 'Metric': 'Pending Payments', 'Value': report.data.metrics.pendingPayments },
    { 'Metric': 'Active Subscriptions', 'Value': report.data.metrics.activeSubscriptions },
    { 'Metric': 'Total Parking Areas', 'Value': report.data.metrics.totalParkingAreas },
    { 'Metric': 'Total Slots', 'Value': report.data.metrics.totalSlots },
    { 'Metric': 'Average Rating', 'Value': report.data.metrics.averageRating }
  ];

  sections.push('OVERALL METRICS');
  sections.push(convertToCSV(metricsData, metricsHeaders));

  return sections.join('\n');
}; 