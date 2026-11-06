import { apiClient } from "@/lib/api-client";
import {
  parseEntityResponse,
  unwrapListPayload
} from "@/lib/admin-api";
import {
  MarketingSummaryResponseSchema,
  CarouselBannerSchema,
  CarouselListResponseSchema,
  CouponSchema,
  type MarketingSummaryResponse,
  type MarketingPeriod,
  type CarouselBanner,
  type CarouselListResponse,
  type CreateCarouselBannerDto,
  type UpdateCarouselBannerDto,
  type Coupon,
  type CreateCouponDto,
  type UpdateCouponDto
} from "@/types/marketing";

export const marketingService = {
  async getSummary(
    period?: MarketingPeriod | string
  ): Promise<MarketingSummaryResponse> {
    const res = await apiClient.get("/api/admin/marketing/summary", {
      params: period ? { period } : undefined
    });
    return parseEntityResponse(
      MarketingSummaryResponseSchema,
      res.data,
      "marketing summary"
    );
  },

  async getCarousel(): Promise<CarouselListResponse> {
    const res = await apiClient.get("/api/admin/marketing/carousel");
    return parseEntityResponse(
      CarouselListResponseSchema,
      res.data,
      "carousel banners"
    );
  },

  async createCarouselBanner(
    dto: CreateCarouselBannerDto
  ): Promise<CarouselBanner> {
    const res = await apiClient.post("/api/admin/marketing/carousel", dto);
    return parseEntityResponse(
      CarouselBannerSchema,
      res.data,
      "created carousel banner"
    );
  },

  async getCarouselBanner(id: string): Promise<CarouselBanner> {
    const res = await apiClient.get(`/api/admin/marketing/carousel/${id}`);
    return parseEntityResponse(
      CarouselBannerSchema,
      res.data,
      "carousel banner details"
    );
  },

  async updateCarouselBanner(
    id: string,
    dto: UpdateCarouselBannerDto
  ): Promise<CarouselBanner> {
    const res = await apiClient.patch(
      `/api/admin/marketing/carousel/${id}`,
      dto
    );
    return parseEntityResponse(
      CarouselBannerSchema,
      res.data,
      "updated carousel banner"
    );
  },

  async deleteCarouselBanner(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/marketing/carousel/${id}`);
  },

  async listCoupons(): Promise<Coupon[]> {
    const res = await apiClient.get("/api/admin/marketing/coupons");
    const rawItems = unwrapListPayload(res.data);
    return rawItems
      .map((item) => {
        const parsed = CouponSchema.safeParse(item);
        return parsed.success ? parsed.data : null;
      })
      .filter((c): c is Coupon => c !== null);
  },

  async createCoupon(dto: CreateCouponDto): Promise<Coupon> {
    const res = await apiClient.post("/api/admin/marketing/coupons", dto);
    return parseEntityResponse(CouponSchema, res.data, "created coupon");
  },

  async updateCoupon(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const res = await apiClient.patch(
      `/api/admin/marketing/coupons/${id}`,
      dto
    );
    return parseEntityResponse(CouponSchema, res.data, "updated coupon");
  },

  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/marketing/coupons/${id}`);
  }
};
