"use client";

import React, { useState } from "react";
import { Search, User, Plus } from "lucide-react";
import Image from "next/image";
import { CreateCategoryModal } from "@/components/ui/create-category-modal";
import { SubCategoryModal } from "@/components/ui/sub-category-modal";

// --- Mock Data ---

const topPerformingKrafts = [
  {
    id: 1,
    title: "Electrical Wiring",
    desc: "Installation and certification for residential and industrial smart-gr...",
    krafters: 124,
    // Using a generic unsplash image of wires to mimic the design
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&q=80",
  },
  {
    id: 2,
    title: "House Cleaning",
    desc: "Installation and certification for residential and industrial smart-gr...",
    krafters: 124,
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&q=80",
  },
  {
    id: 3,
    title: "Lawn Management",
    desc: "Installation and certification for residential and industrial smart-gr...",
    krafters: 124,
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&q=80",
  },
];

const initialKraftCategories = [
  {
    id: "outdoor",
    title: "Outdoor Help",
    desc: "Includes Yard work, Lawn Care, Branch & Hedge Trimming",
    count: 124,
    isActive: true,
    subItems: [
      { id: "yard", name: "Yard work", isActive: true },
      { id: "lawn", name: "Lawn Care", isActive: true },
      { id: "branch", name: "Branch & Hedge Trimming", isActive: true },
      { id: "leaf", name: "Leaf Raking & Removal", isActive: true },
      { id: "garden", name: "Gardening & Weeding", isActive: true },
      { id: "mulch", name: "Mulching", isActive: false },
      { id: "mowing", name: "Lawn Mowing", isActive: false },
    ],
  },
  {
    id: "assembly",
    title: "Assembly",
    desc: "Includes planting, watering, weeding",
    count: 124,
    isActive: true,
    subItems: [],
  },
  {
    id: "mounting",
    title: "Mounting",
    desc: "Includes planting, watering, weeding",
    count: 124,
    isActive: true,
    subItems: [],
  },
  {
    id: "moving",
    title: "Moving",
    desc: "Includes planting, watering, weeding",
    count: 124,
    isActive: true,
    subItems: [],
  },
  {
    id: "cleaning",
    title: "Cleaning",
    desc: "Includes planting, watering, weeding",
    count: 124,
    isActive: true,
    subItems: [],
  },
  {
    id: "repairs",
    title: "Home Repairs",
    desc: "Includes planting, watering, weeding",
    count: 124,
    isActive: false,
    subItems: [],
  },
];

const customKraftsList = [
  {
    id: 1,
    name: "Sarah Chen",
    time: "2 Mins Ago",
    desc: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    price: "$364.00",
    images: "5 Images",
  },
  {
    id: 2,
    name: "Sarah Chen",
    time: "2 Mins Ago",
    desc: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    price: "$364.00",
    images: "5 Images",
  },
  {
    id: 3,
    name: "Sarah Chen",
    time: "2 Mins Ago",
    desc: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    price: "$364.00",
    images: "5 Images",
  },
];

export default function KraftManagementPage() {
  const [categories, setCategories] = useState(initialKraftCategories);
  const [expandedCats, setExpandedCats] = useState<string[]>(["outdoor"]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);

  const [isCustomKraftsExpanded, setIsCustomKraftsExpanded] = useState(true);
  const [customKraftsTab, setCustomKraftsTab] = useState("New");

  const toggleAccordion = (id: string) => {
    setExpandedCats((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleToggleActive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
    // Keep menu open to match interaction, or close it if preferred
    // setActiveMenu(null);
  };

  // Close menus when clicking outside
  React.useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <div className="w-full max-w-5xl space-y-12 pb-16 font-sans text-black">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h1 className="text-3xl font-garet font-[850]">Kraft Management</h1>
          <p className="mt-2 text-[13px] font-medium leading-relaxed">
            To build a comprehensive admin dashboard for Kraftigo, the interface needs to bridge the gap
            between high-level business health and granular operational control
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="whitespace-nowrap rounded-lg bg-[#FF6600] px-4 py-3 text-sm font-semibold text-white hover:bg-[#E65C00] transition-colors shadow-sm"
        >
          Create a new category
        </button>
      </div>

      {/* --- Top Performing Kraft --- */}
      <section className="space-y-6">
        <h2 className="text-[17px] font-garet font-bold">Top performing Kraft</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {topPerformingKrafts.map((kraft) => (
            <div key={kraft.id} className="flex flex-col gap-3 group cursor-pointer">
              <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#0000001A]">
                <img
                  src={kraft.image}
                  alt={kraft.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="font-bold text-[14px]">{kraft.title}</h3>
                <p className="text-[#45464D] text-[13px] mt-1 line-clamp-2 pr-4 leading-relaxed">
                  {kraft.desc}
                </p>
                <div className="mt-1 text-[#FF6600] text-[13px]">
                  {kraft.krafters} registered Krafters
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
              placeholder="Search"
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
                <h3 className="font-bold text-[14px]">Custom Krafts</h3>
                <p className="text-[12px] font-medium mt-0.5">
                  See all custom Krafts on the platform
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800">
                <User className="h-4 w-4" />
                11124
              </div>
            </div>

            {isCustomKraftsExpanded && (
              <div className="flex flex-col px-4 pb-4">
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-2">
                  {["New", "Under Review", "Rejected"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCustomKraftsTab(tab)}
                      className={`px-3 py-2 rounded-full text-[12px] font-semibold transition-colors ${customKraftsTab === tab
                        ? "bg-[#FF6600] text-white"
                        : "bg-white text-slate-600 border border-[#0000001A] hover:bg-slate-50"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* List Items */}
                <div className="flex flex-col">
                  {customKraftsList.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row gap-3 py-6 ${index !== customKraftsList.length - 1 ? "border-b border-[#0000001A]" : ""
                        }`}
                    >
                      {/* Left: Avatar & Info */}
                      <div className="flex items-start gap-3 w-[150px] shrink-0">
                        <div className="h-10 w-10 rounded-full bg-[#D9D9D9] shrink-0" />
                        <div className="flex flex-col pt-0.5">
                          <span className="text-[13px] font-bold">{item.name}</span>
                          <span className="text-[11px] font-medium mt-0.5">{item.time}</span>
                        </div>
                      </div>

                      {/* Middle: Description */}
                      <div className="flex-1 pr-4">
                        <p className="text-[12px] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      {/* Right: Price & View */}
                      <div className="flex items-start justify-between shrink-0 gap-10">
                        <div className="text-left">
                          <span className="text-[13px] font-bold block">{item.price}</span>
                          <span className="text-[12px] text-slate-500 block">{item.images}</span>
                        </div>
                        <button className="text-[#FF6600] text-[12px] font-bold hover:underline mb-1">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accordions */}
          {categories.map((cat) => {
            const isExpanded = expandedCats.includes(cat.id);
            // Different background based on Active state to match design
            const bgClass = cat.isActive ? "bg-[#F6F6F6]" : "bg-[#B9B9B9] text-[#00000099]";
            const textColorClass = cat.isActive ? "text-black" : "text-[#00000099]";

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
                      {cat.title}
                    </h3>
                    <p className={`text-[12px] font-medium mt-0.5 ${cat.isActive ? 'text-black' : 'text-[#00000066]'}`}>
                      {cat.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 relative">
                    <div className={`flex items-center gap-1.5 text-[13px] font-bold ${textColorClass}`}>
                      <User className="h-4 w-4" />
                      {cat.count}
                    </div>
                    <button
                      onClick={(e) => toggleMenu(e, cat.id)}
                      className="p-1 hover:bg-[#0000001A] rounded-md transition-colors"
                    >
                      <Image src="/menu.svg" alt="menu" width={18} height={18} className={cat.isActive ? "black" : "#00000066"} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenu === cat.id && (
                      <div
                        className="absolute right-0 top-10 z-20 w-40 rounded-lg bg-[#F6F6F6] border border-[#0000001A] shadow-lg overflow-hidden flex flex-col text-[12px] font-semibold text-slate-700"
                        onClick={(e) => e.stopPropagation()} // Prevent clicking inside menu from closing or toggling accordion
                      >
                        <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#0000000D]">
                          <span>Active</span>
                          <button
                            onClick={(e) => handleToggleActive(e, cat.id)}
                            className={`relative inline-flex h-[20px] w-[36px] items-center rounded-full transition-colors ${cat.isActive ? "bg-[#B34700]" : "bg-slate-300"
                              }`}
                          >
                            <span
                              className={`inline-block h-[16px] w-[16px] transform rounded-full bg-white transition-transform ${cat.isActive ? "translate-x-[18px]" : "translate-x-[2px]"
                                }`}
                            />
                          </button>
                        </div>
                        <button className="px-4 py-1.5 text-left hover:bg-slate-50 border-b border-[#0000000D]">
                          View
                        </button>
                        <button className="px-4 py-1.5 text-left hover:bg-slate-50 border-b border-[#0000000D]">
                          Rename
                        </button>
                        <button className="px-4 py-1.5 text-left hover:bg-slate-50 text-[#C80A0A]">
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Accordion Body (Sub-items) */}
                {isExpanded && cat.subItems.length > 0 && (
                  <div className="px-4 pb-4 space-y-2">
                    {cat.subItems.map((subItem) => (
                      <div
                        key={subItem.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] border border-transparent ${subItem.isActive
                          ? "bg-[#FF66001A] "
                          : "bg-[#91919199] text-[#00000066]"
                          }`}
                      >
                        <div
                          className={`h-1 w-1 rounded-full ${subItem.isActive ? "bg-[#FF6600]" : "bg-[#00000066]"
                            }`}
                        />
                        {subItem.name}
                      </div>
                    ))}

                    {/* Add New Button */}
                    <button 
                      onClick={() => setIsSubCategoryModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-3 w-full rounded-lg text-[13px] font-semibold bg-[#FFF0E5] text-slate-800 hover:bg-[#FFE5D6] transition-colors border border-transparent border-dashed hover:border-[#FF6600]"
                    >
                      <Plus className="h-4 w-4" />
                      Add new
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <SubCategoryModal 
        isOpen={isSubCategoryModalOpen}
        onClose={() => setIsSubCategoryModalOpen(false)}
      />
    </div>
  );
}