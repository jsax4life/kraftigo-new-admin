"use client";

import React, { useState, useEffect } from "react";
import { Search, User, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import { CreateCategoryModal } from "@/components/ui/create-category-modal";
import { SubCategoryModal } from "@/components/ui/sub-category-modal";
import {
  useKraftHub,
  useTopPerformingKrafts,
  useCustomKrafts,
  useCustomKraftsSummary,
  useUpdateCategory,
  useDeleteCategory
} from "@/hooks/useKrafts";
import { CustomKraftDetailModal } from "@/components/ui/custom-kraft-detail-modal";
import { ActionModal } from "@/components/ui/action-modal";
import type { CategorySubKraft, KraftCategoryItem } from "@/types/krafts";

const fallbackTopPerforming = [
  {
    id: "1",
    name: "Electrical Wiring",
    description: "Installation and certification for residential and industrial smart-gr...",
    registeredKraftersCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&q=80"
  },
  {
    id: "2",
    name: "House Cleaning",
    description: "Installation and certification for residential and industrial smart-gr...",
    registeredKraftersCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80"
  },
  {
    id: "3",
    name: "Lawn Management",
    description: "Installation and certification for residential and industrial smart-gr...",
    registeredKraftersCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23961?w=500&q=80"
  }
];

export default function KraftManagementPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<KraftCategoryItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<KraftCategoryItem | null>(null);
  const [selectedCustomKraftId, setSelectedCustomKraftId] = useState<string | null>(null);
  const [subModalConfig, setSubModalConfig] = useState<{
    isOpen: boolean;
    categoryId?: string;
    categoryName?: string;
    kraft?: CategorySubKraft | null;
  }>({
    isOpen: false
  });

  // Custom Krafts Accordion and Tabs
  const [isCustomKraftsExpanded, setIsCustomKraftsExpanded] = useState(true);
  const [customKraftsTab, setCustomKraftsTab] = useState<
    "New" | "Under Review" | "Rejected"
  >("New");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Main Landing Hub Query
  const { data: hubData, isLoading: isHubLoading } = useKraftHub(debouncedSearch);

  // Dedicated Top Performing Query (GET /api/admin/kraft-management/top-performing)
  const { data: topPerformingData } = useTopPerformingKrafts(3);

  // Dedicated Custom Krafts Summary (GET /api/admin/kraft-management/custom-krafts/summary)
  const { data: customKraftsSummary } = useCustomKraftsSummary();

  // Map UI tab to backend status
  const statusParam =
    customKraftsTab === "New"
      ? "NEW"
      : customKraftsTab === "Under Review"
      ? "UNDER_REVIEW"
      : "REJECTED";

  // Custom Krafts List Query
  const { data: customKraftsData, isLoading: isCustomLoading } = useCustomKrafts({
    status: statusParam,
    search: debouncedSearch
  });

  // Mutations
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Accordion toggles
  const toggleAccordion = (id: string) => {
    setExpandedCats((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleToggleActive = async (
    e: React.MouseEvent,
    category: KraftCategoryItem
  ) => {
    e.stopPropagation();
    try {
      await updateCategoryMutation.mutateAsync({
        categoryId: category.id,
        dto: { isActive: !category.isActive }
      });
    } catch (err) {
      console.error("Failed to toggle category active status:", err);
    }
  };

  const handleRename = (
    e: React.MouseEvent,
    category: KraftCategoryItem
  ) => {
    e.stopPropagation();
    setActiveMenu(null);
    setCategoryToEdit(category);
    setIsCreateModalOpen(true);
  };

  const handleRemove = (
    e: React.MouseEvent,
    category: KraftCategoryItem
  ) => {
    e.stopPropagation();
    setActiveMenu(null);
    setCategoryToDelete(category);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Failed to remove category:", err);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // Compute top performing list (prioritize dedicated endpoint, then hub, then fallback)
  const topPerforming =
    topPerformingData && topPerformingData.length > 0
      ? topPerformingData
      : hubData?.topPerforming && hubData.topPerforming.length > 0
      ? hubData.topPerforming
      : fallbackTopPerforming;

  // Categories list
  const categories = hubData?.categories?.categories ?? [];
  const customKraftsEntry = hubData?.categories?.customKraftsEntry;
  const customTabsCounts =
    customKraftsSummary?.tabs ?? hubData?.customKrafts?.tabs;
  const customKraftsList = customKraftsData?.data ?? [];

  return (
    <div className="w-full max-w-5xl space-y-12 pb-16 font-sans text-black">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h1 className="text-3xl font-garet font-[850]">Kraft Management</h1>
          <p className="mt-2 text-[13px] font-medium leading-relaxed">
            To build a comprehensive admin dashboard for Kraftigo, the interface needs to bridge the gap
            between high-level business health and granular operational control.
          </p>
        </div>
        <button
          onClick={() => {
            setCategoryToEdit(null);
            setIsCreateModalOpen(true);
          }}
          className="whitespace-nowrap rounded-lg bg-[#FF6600] px-4 py-3 text-sm font-semibold text-white hover:bg-[#E65C00] transition-colors shadow-sm"
        >
          Create a new category
        </button>
      </div>

      {/* --- Top Performing Kraft --- */}
      <section className="space-y-6">
        <h2 className="text-[17px] font-garet font-bold">Top performing Kraft</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {isHubLoading && !hubData
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 bg-slate-50 animate-pulse"
                >
                  <div className="h-44 w-full rounded-lg bg-slate-200" />
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-48 bg-slate-200 rounded" />
                </div>
              ))
            : topPerforming.map((kraft) => (
                <div
                  key={kraft.id}
                  className="flex flex-col gap-3 group cursor-pointer"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#0000001A]">
                    <img
                      src={
                        kraft.imageUrl ||
                        "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&q=80"
                      }
                      alt={kraft.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[14px]">{kraft.name}</h3>
                    <p className="text-[#45464D] text-[13px] mt-1 line-clamp-2 pr-4 leading-relaxed">
                      {kraft.description || "Top rated platform Kraft category."}
                    </p>
                    <div className="mt-1 text-[#FF6600] text-[13px] font-semibold">
                      {kraft.registeredKraftersCount ?? 0} registered Krafters
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* --- Kraft Categories --- */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[17px] font-garet font-bold">Kraft Categories</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00000066]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category name or description"
              className="w-full rounded-lg border-none bg-[#F6F6F6] py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-[#00000066] focus:ring-2 focus:ring-[#FF6600]/20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#00000066]">
              /
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Custom Krafts (Expandable Container) */}
          <div className="flex flex-col rounded-xl bg-[#F6F6F6] border border-[#0000001A] shadow-sm overflow-hidden transition-all">
            <div
              className="flex items-center justify-between p-4 cursor-pointer select-none"
              onClick={() => setIsCustomKraftsExpanded(!isCustomKraftsExpanded)}
            >
              <div>
                <h3 className="font-bold text-[14px]">
                  {customKraftsEntry?.title || "Custom Krafts"}
                </h3>
                <p className="text-[12px] font-medium mt-0.5 text-slate-700">
                  {customKraftsEntry?.description ||
                    "See all custom Krafts on the platform"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800">
                <User className="h-4 w-4" />
                {customKraftsEntry?.totalCount ??
                  hubData?.customKrafts?.totalPublished ??
                  0}
              </div>
            </div>

            {isCustomKraftsExpanded && (
              <div className="flex flex-col px-4 pb-4">
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-2">
                  {(
                    [
                      { label: "New", count: customTabsCounts?.new ?? 0 },
                      {
                        label: "Under Review",
                        count: customTabsCounts?.underReview ?? 0
                      },
                      {
                        label: "Rejected",
                        count: customTabsCounts?.rejected ?? 0
                      }
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.label}
                      onClick={() => setCustomKraftsTab(tab.label)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors flex items-center gap-1.5 ${
                        customKraftsTab === tab.label
                          ? "bg-[#FF6600] text-white"
                          : "bg-white text-slate-600 border border-[#0000001A] hover:bg-slate-50"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          customKraftsTab === tab.label
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* List Items */}
                <div className="flex flex-col">
                  {isCustomLoading ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Loading custom krafts…
                    </div>
                  ) : customKraftsList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No custom Krafts in the {customKraftsTab.toLowerCase()} queue.
                    </div>
                  ) : (
                    customKraftsList.map((item, index) => {
                      const customerName =
                        item.customer?.name || item.customerName || "Customer";
                      const customerAvatar =
                        item.customer?.avatarUrl ||
                        item.customerAvatarUrl ||
                        "/images/login.jpg";
                      const timeStr = item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "Recent";
                      const photosCount = item.photos?.length || 0;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedCustomKraftId(item.id)}
                          className={`flex flex-col sm:flex-row gap-3 py-4 cursor-pointer hover:bg-slate-100/60 rounded-xl px-2 transition-colors ${
                            index !== customKraftsList.length - 1
                              ? "border-b border-[#0000001A]"
                              : ""
                          }`}
                        >
                          {/* Left: Avatar & Info */}
                          <div className="flex items-start gap-3 w-[150px] shrink-0">
                            <Image
                              src={customerAvatar}
                              alt={customerName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover bg-[#D9D9D9] shrink-0"
                            />
                            <div className="flex flex-col pt-0.5">
                              <span className="text-[13px] font-bold">
                                {customerName}
                              </span>
                              <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                                {timeStr}
                              </span>
                            </div>
                          </div>

                          {/* Middle: Description */}
                          <div className="flex-1 pr-4">
                            <p className="text-[12px] leading-relaxed line-clamp-3 text-slate-800">
                              {item.description}
                            </p>
                          </div>

                          {/* Right: Price & View */}
                          <div className="flex items-start justify-between shrink-0 gap-6">
                            <div className="text-left">
                              <span className="text-[13px] font-bold block">
                                {item.offerAmount != null
                                  ? `£${item.offerAmount.toLocaleString()}`
                                  : "Flexible"}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {photosCount > 0 ? `${photosCount} Images` : "No photos"}
                              </span>
                            </div>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomKraftId(item.id);
                              }}
                              className="text-[#FF6600] text-[12px] font-bold hover:underline cursor-pointer"
                            >
                              View
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Categories Accordions */}
          {isHubLoading && categories.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Loading categories…
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No categories match your search.
            </div>
          ) : (
            categories.map((cat) => {
              const isExpanded = expandedCats.includes(cat.id);
              const bgClass = cat.isActive
                ? "bg-[#F6F6F6]"
                : "bg-[#B9B9B9] text-[#00000099]";
              const textColorClass = cat.isActive
                ? "text-black"
                : "text-[#00000099]";

              return (
                <div
                  key={cat.id}
                  className={`flex flex-col rounded-xl border border-[#0000001A] overflow-visible transition-colors ${bgClass}`}
                >
                  {/* Accordion Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                    onClick={() => toggleAccordion(cat.id)}
                  >
                    <div className="pr-4">
                      <h3 className={`font-bold text-[14px] ${textColorClass}`}>
                        {cat.name}
                      </h3>
                      <p
                        className={`text-[12px] font-medium mt-0.5 ${
                          cat.isActive ? "text-slate-700" : "text-[#00000066]"
                        }`}
                      >
                        {cat.description || "Platform service category"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 relative">
                      <div
                        className={`flex items-center gap-1.5 text-[13px] font-bold ${textColorClass}`}
                      >
                        <User className="h-4 w-4" />
                        {cat.registeredKraftersCount ?? 0}
                      </div>
                      <button
                        onClick={(e) => toggleMenu(e, cat.id)}
                        className="p-1 hover:bg-[#0000001A] rounded-md transition-colors"
                      >
                        <Image
                          src="/menu.svg"
                          alt="menu"
                          width={18}
                          height={18}
                          className={cat.isActive ? "black" : "#00000066"}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === cat.id && (
                        <div
                          className="absolute right-0 top-10 z-20 w-40 rounded-lg bg-[#F6F6F6] border border-[#0000001A] shadow-lg overflow-hidden flex flex-col text-[12px] font-semibold text-slate-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between px-4 py-2 border-b border-[#0000000D]">
                            <span>Active</span>
                            <button
                              onClick={(e) => handleToggleActive(e, cat)}
                              className={`relative inline-flex h-[20px] w-[36px] items-center rounded-full transition-colors ${
                                cat.isActive ? "bg-[#B34700]" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-[16px] w-[16px] transform rounded-full bg-white transition-transform ${
                                  cat.isActive
                                    ? "translate-x-[18px]"
                                    : "translate-x-[2px]"
                                }`}
                              />
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setActiveMenu(null);
                              toggleAccordion(cat.id);
                            }}
                            className="px-4 py-2 text-left hover:bg-slate-50 border-b border-[#0000000D]"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => handleRename(e, cat)}
                            className="px-4 py-2 text-left hover:bg-slate-50 border-b border-[#0000000D]"
                          >
                            Rename
                          </button>
                          <button
                            onClick={(e) => handleRemove(e, cat)}
                            className="px-4 py-2 text-left hover:bg-slate-50 text-[#C80A0A]"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accordion Body (Sub-items) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      {cat.krafts && cat.krafts.length > 0 ? (
                        cat.krafts.map((subItem) => (
                          <div
                            key={subItem.id}
                            onClick={() =>
                              setSubModalConfig({
                                isOpen: true,
                                categoryId: cat.id,
                                categoryName: cat.name,
                                kraft: subItem
                              })
                            }
                            className={`flex items-center justify-between px-4 py-3 rounded-lg text-[13px] cursor-pointer transition-colors ${
                              subItem.isActive
                                ? "bg-[#FF66001A] hover:bg-[#FF660026]"
                                : "bg-[#91919199] text-[#00000066]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-1.5 w-1.5 rounded-full ${
                                  subItem.isActive
                                    ? "bg-[#FF6600]"
                                    : "bg-[#00000066]"
                                }`}
                              />
                              <span className="font-semibold text-black">
                                {subItem.name}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                              {subItem.registeredKraftersCount ?? 0} Krafters
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-xs text-slate-500">
                          No sub-Krafts added to this category yet.
                        </div>
                      )}

                      {/* Add New Sub-Kraft Button */}
                      <button
                        onClick={() =>
                          setSubModalConfig({
                            isOpen: true,
                            categoryId: cat.id,
                            categoryName: cat.name,
                            kraft: null
                          })
                        }
                        className="flex items-center gap-2 px-4 py-3 w-full rounded-lg text-[13px] font-semibold bg-[#FFF0E5] text-slate-800 hover:bg-[#FFE5D6] transition-colors border border-transparent border-dashed hover:border-[#FF6600]"
                      >
                        <Plus className="h-4 w-4 text-[#FF6600]" />
                        Add new
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Create / Edit Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        categoryToEdit={categoryToEdit}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCategoryToEdit(null);
        }}
      />

      {/* Sub-Kraft Create / Detail Modal */}
      <SubCategoryModal
        isOpen={subModalConfig.isOpen}
        onClose={() => setSubModalConfig({ isOpen: false })}
        categoryId={subModalConfig.categoryId}
        categoryName={subModalConfig.categoryName}
        kraft={subModalConfig.kraft}
      />

      {/* Custom Kraft Detail Modal */}
      <CustomKraftDetailModal
        customKraftId={selectedCustomKraftId}
        isOpen={Boolean(selectedCustomKraftId)}
        onClose={() => setSelectedCustomKraftId(null)}
      />

      {/* Delete Category Confirmation Modal */}
      <ActionModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        title="Remove Kraft Category"
        description={`Are you sure you want to remove the category "${categoryToDelete?.name}"? All nested Krafts will no longer be available under this category.`}
        primaryButtonText="Remove Category"
        primaryButtonClasses="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
        primaryButtonAction={handleConfirmDeleteCategory}
      />
    </div>
  );
}