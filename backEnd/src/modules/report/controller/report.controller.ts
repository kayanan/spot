import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../../../utils/common.util';
import { 
  generateReport,
  generateRevenueByRegionCSV,
  generateReservationsRevenueByCityCSV,
  generateRevenueByParkingOwnersCSV,
  generateSubscriptionPaymentsCSV,
  generateParkingOwnerDetailedReport,
  generateParkingOwnerDetailedCSV
} from '../service/report.service';
import { GenerateReportRequest, ReportType } from './request/generate.report.request';
import { validateGenerateReportRequest } from '../validators/report.validator';

export const generateReportController = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = validateGenerateReportRequest(req.body);
    if (!validationResult.success) {
      res.status(400).json(errorResponse(validationResult.error.errors[0].message));
      return;
    }

    const { reportType, startDate, endDate, provinceId, parkingAreaId, userId, cityId, ownerId, format } = validationResult.data;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      res.status(400).json(errorResponse('Start date must be before end date'));
      return;
    }

    // Generate report
    const report = await generateReport(reportType, start, end, {
      provinceId,
      parkingAreaId,
      userId,
      cityId,
      ownerId
    });

    // Handle different formats
    if (format === 'CSV') {
      let csvData: string;
      
      switch (reportType) {
        case ReportType.REVENUE_BY_REGION:
          csvData = await generateRevenueByRegionCSV(start, end, provinceId);
          break;
        case ReportType.RESERVATIONS_REVENUE_BY_CITY:
          csvData = await generateReservationsRevenueByCityCSV(start, end, cityId);
          break;
        case ReportType.REVENUE_BY_PARKING_OWNERS:
          csvData = await generateRevenueByParkingOwnersCSV(start, end, ownerId);
          break;
        case ReportType.SUBSCRIPTION_PAYMENTS_REPORT:
          csvData = await generateSubscriptionPaymentsCSV(start, end, ownerId, parkingAreaId);
          break;
        case ReportType.PARKING_OWNER_DETAILED_REPORT:
          if (!ownerId) {
            res.status(400).json(errorResponse('Owner ID is required for parking owner detailed report'));
            return;
          }
          csvData = await generateParkingOwnerDetailedCSV(start, end, ownerId);
          break;
        default:
          res.status(400).json(errorResponse(`CSV export not supported for report type: ${reportType}`));
          return;
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_${startDate}_${endDate}.csv"`);
      res.status(200).send(csvData);
      return;
    } else if (format === 'PDF') {
      // TODO: Implement PDF export
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_${startDate}_${endDate}.pdf"`);
      res.status(200).json(report);
      return;
    }

    // Default JSON response
    res.status(200).json(report);

  } catch (error: any) {
    console.error('Report generation error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const getAvailableReportTypes = async (req: Request, res: Response) => {
  try {
    const reportTypes = Object.values(ReportType).map(type => ({
      value: type,
      label: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }));

    res.status(200).json({
      status: true,
      message: 'Available report types retrieved successfully',
      data: reportTypes
    });

  } catch (error: any) {
    console.error('Error getting report types:', error);
    res.status(500).json(errorResponse(error.message));
  }
}; 