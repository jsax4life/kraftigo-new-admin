import { ChevronDown, Globe } from 'lucide-react'
import React from 'react'

const Footer = () => {
    return (
        <footer className="md:flex hidden items-center justify-between bg-white px-[12px] py-[18px] text-[14px] font-medium text-[#0B0B0BCC]">
            <div className="flex space-x-2">
                <span>© 2026 Kraftigo</span>
                <span>·</span>
                <a href="#" className="hover:text-slate-800 transition-colors">Contact Admin</a>
                <span>·</span>
                <a href="#" className="hover:text-slate-800 transition-colors">Report a problem</a>
                <span>·</span>
            </div>
            <div className='flex items-center gap-4'>
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800 transition-colors">
                    Help & Resources
                    <ChevronDown className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800 transition-colors">
                    <Globe className="h-4 w-4" />
                    English (UK)
                </div>
            </div>
        </footer>
    )
}

export default Footer 