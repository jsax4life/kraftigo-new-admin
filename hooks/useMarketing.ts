"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketingService } from "@/services/marketing.service";
import type {
  MarketingSummaryResponse,
  MarketingPeriod,
  CarouselListResponse,
  CarouselBanner,
  CreateCarouselBannerDto,
  UpdateCarouselBannerDto,
  Coupon,
  CreateCouponDto,
  UpdateCouponDto
} from "@/types/marketing";

export function useMarketingSummary(period?: MarketingPeriod | string) {
  return useQuery<MarketingSummaryResponse, Error>({
    queryKey: ["admin", "marketing", "summary", period],
    queryFn: () => marketingService.getSummary(period),
    staleTime: 30_000
  });
}

export function useCarouselBanners() {
  return useQuery<CarouselListResponse, Error>({
    queryKey: ["admin", "marketing", "carousel"],
    queryFn: () => marketingService.getCarousel(),
    staleTime: 15_000
  });
}

export function useCarouselBanner(id: string | null | undefined) {
  return useQuery<CarouselBanner, Error>({
    queryKey: ["admin", "marketing", "carousel", id],
    queryFn: () => marketingService.getCarouselBanner(id!),
    enabled: Boolean(id)
  });
}

export function useCreateCarouselBanner() {
  const queryClient = useQueryClient();
  return useMutation<CarouselBanner, Error, CreateCarouselBannerDto>({
    mutationFn: (dto) => marketingService.createCarouselBanner(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "marketing", "carousel"]
      });
    }
  });
}

export function useUpdateCarouselBanner() {
  const queryClient = useQueryClient();
  return useMutation<
    CarouselBanner,
    Error,
    { id: string; dto: UpdateCarouselBannerDto }
  >({
    mutationFn: ({ id, dto }) => marketingService.updateCarouselBanner(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "marketing", "carousel"]
      });
    }
  });
}

export function useDeleteCarouselBanner() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => marketingService.deleteCarouselBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "marketing", "carousel"]
      });
    }
  });
}

export function useCoupons() {
  return useQuery<Coupon[], Error>({
    queryKey: ["admin", "marketing", "coupons"],
    queryFn: () => marketingService.listCoupons(),
    staleTime: 15_000
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation<Coupon, Error, CreateCouponDto>({
    mutationFn: (dto) => marketingService.createCoupon(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "marketing", "coupons"]
      });
    }
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation<Coupon, Error, { id: string; dto: UpdateCouponDto }>({
    mutationFn: ({ id, dto }) => marketingService.updateCoupon(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "marketing", "coupons"]
      });
    }
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => marketingService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "marketing", "coupons"]
      });
    }
  });
}
