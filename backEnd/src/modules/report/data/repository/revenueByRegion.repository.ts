import BaseRepository from '../../../base/data/repository/base.repository';
import { RevenueByRegionDTO, RevenueByRegionModel } from '../dtos/revenueByRegion.dto';

class RevenueByRegionRepository {
  async findRevenueByProvince(provinceId: string, limit: number = 10, offset: number = 0) {
    return await BaseRepository.findAll(
      RevenueByRegionDTO,
      { provinceId, isDeleted: false },
      limit,
      offset,
      { reportDate: -1 }
    );
  }

  async findLatestRevenueByProvince(provinceId: string) {
    const result = await BaseRepository.findAll(
      RevenueByRegionDTO,
      { provinceId, isDeleted: false },
      1,
      0,
      { reportDate: -1 }
    );
    return result.items.length > 0 ? result.items[0] : null;
  }

  async findRevenueByDateRange(startDate: Date, endDate: Date, limit: number = 10, offset: number = 0) {
    return await BaseRepository.findAll(
      RevenueByRegionDTO,
      {
        reportDate: { $gte: startDate, $lte: endDate },
        isDeleted: false
      },
      limit,
      offset,
      { reportDate: -1 }
    );
  }

  async findTopRevenueProvinces(limit: number = 10) {
    return await BaseRepository.findAll(
      RevenueByRegionDTO,
      { isDeleted: false },
      limit,
      0,
      { totalRevenue: -1 }
    );
  }

  async findRevenueStatistics() {
    const pipeline: any[] = [
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          totalBookings: { $sum: '$totalBookings' },
          totalParkingAreas: { $sum: '$totalParkingAreas' },
          averageGrowthPercentage: { $avg: '$growthPercentage' }
        }
      }
    ];
    
    return await RevenueByRegionDTO.aggregate(pipeline);
  }

  async findRevenueByProvinceAndDate(provinceId: string, startDate: Date, endDate: Date) {
    return await BaseRepository.findAll(
      RevenueByRegionDTO,
      {
        provinceId,
        reportDate: { $gte: startDate, $lte: endDate },
        isDeleted: false
      },
      100,
      0,
      { reportDate: 1 }
    );
  }

  async findLatestRevenueForAllProvinces() {
    const pipeline: any[] = [
      { $match: { isDeleted: false } },
      {
        $sort: { reportDate: -1 }
      },
      {
        $group: {
          _id: '$provinceId',
          latestData: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latestData' }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ];
    
    return await RevenueByRegionDTO.aggregate(pipeline);
  }

  async updateRevenueData(id: string, revenueData: Partial<RevenueByRegionModel>) {
    return await BaseRepository.updateById(RevenueByRegionDTO, id, revenueData);
  }

  async findRevenueGrowthByProvince(provinceId: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    return await BaseRepository.findAll(
      RevenueByRegionDTO,
      {
        provinceId,
        reportDate: { $gte: startDate },
        isDeleted: false
      },
      100,
      0,
      { reportDate: 1 }
    );
  }

  async createRevenueData(data: Partial<RevenueByRegionModel>) {
    return await BaseRepository.create(RevenueByRegionDTO, data);
  }

  async findById(id: string) {
    return await BaseRepository.findById(RevenueByRegionDTO, id);
  }
}

export default new RevenueByRegionRepository(); 