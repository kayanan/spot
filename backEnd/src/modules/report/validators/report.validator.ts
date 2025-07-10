import { z } from 'zod';
import { ReportType } from '../controller/request/generate.report.request';

export const generateReportSchema = z.object({
  reportType: z.nativeEnum(ReportType),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  provinceId: z.string().optional(),
  parkingAreaId: z.string().optional(),
  userId: z.string().optional(),
  cityId: z.string().optional(),
  ownerId: z.string().optional(),
  format: z.enum(['JSON', 'CSV', 'PDF']).optional().default('JSON')
});

export const validateGenerateReportRequest = (data: any) => {
  return generateReportSchema.safeParse(data);
}; 