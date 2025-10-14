"use client";

import { ArrowDown, ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { useBreakpoint } from "@/app/hooks/use-breakpoint";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LanguageContent } from "./language-content";

type LanguageTriggerProps = {
  selectedCountry: {
    code: string;
    name: string;
    flag: string;
  };
  onCountryChange: (country: { code: string; name: string; flag: string }) => void;
  onOpenChange?: (open: boolean) => void;
};

export function LanguageTrigger({ 
  selectedCountry, 
  onCountryChange, 
  onOpenChange 
}: LanguageTriggerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useBreakpoint(768);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
  };

  const handleCountrySelect = (country: { code: string; name: string; flag: string }) => {
    onCountryChange(country);
    setOpen(false);
  };

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => setOpen(true)}
          aria-expanded={open}
        >
          <span className="text-lg mr-2">{selectedCountry.flag}</span>
          <span className="text-sm mr-2">{selectedCountry.name}</span>
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </Button>
        
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-lg">Select Language</h4>
              </div>
              <LanguageContent 
                selectedCountry={selectedCountry}
                onCountrySelect={handleCountrySelect}
                isDrawer
              />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => setOpen(true)}
          aria-expanded={open}
        >
          <span className="text-lg mr-2">{selectedCountry.flag}</span>
          <span className="text-sm mr-2">{selectedCountry.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex h-auto min-h-[400px] w-full flex-col gap-0 p-0 sm:max-w-[480px]">
          <DialogHeader className="border-border border-b px-6 py-4">
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Select Language & Region
            </DialogTitle>
          </DialogHeader>
          <LanguageContent
            selectedCountry={selectedCountry}
            onCountrySelect={handleCountrySelect}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}