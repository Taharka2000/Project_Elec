"use client"

import React from 'react'

import { usePathname } from 'next/navigation';

import {
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar";
import {  Ellipsis } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CollapseMenuButton } from './collapse-menu-button';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { getPages } from '@/lib/page';

const SidebarMenuContent = ({ currentUser }: { currentUser?: User}) => {
    const {  open } = useSidebar()
    const pathname = usePathname();
    const role= currentUser?.role === ' actionnaire ' ? "admin" : currentUser?.role
    const pages = getPages(pathname, role);

  return (
    <SidebarContent>
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
        {pages.map(({ groupLabel, menus }, index) => (
          <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
            {(open && groupLabel) || open === undefined ? (
              <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                {groupLabel}
              </p>
            ) : !open && open !== undefined && groupLabel ? (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger className="w-full">
                    <div className="w-full flex justify-center items-center">
                      <Ellipsis className="h-5 w-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{groupLabel}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <p className="pb-2"></p>
            )}
            {menus.map(({ href, label, icon: Icon, active, submenus }, index) =>
              submenus.length === 0 ? (
                
                <div className="w-full" key={index}>
                  <TooltipProvider disableHoverableContent>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={active ? "default" : "ghost"}
                          className={cn("w-full justify-start h-10 mb-1", active && "text-[18px]")}
                          asChild
                        >
                          <Link href={href}>
                            <span
                              className={cn( "mr-4")}
                            >
                              <Icon size={18} />
                            </span>
                            <p
                              className={cn(
                                "max-w-[200px] truncate",
                                open === false
                                  ? "-translate-x-96 opacity-0"
                                  : "translate-x-0 opacity-100"
                              )}
                            >
                              {label}
                            </p>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {open === false && (
                        <TooltipContent side="right">{label}</TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <div className="w-full" key={index}>
                  <CollapseMenuButton
                    icon={Icon}
                    label={label}
                    active={active}
                    submenus={submenus}
                    isOpen={open}
                  />
                </div>
              )
            )}
          </li>
        ))}
      
      </ul>
  </SidebarContent>
  )
}

export default SidebarMenuContent