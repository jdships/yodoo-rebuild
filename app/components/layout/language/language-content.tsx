"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Countries data
const countries = [
  { code: "US", name: "English", flag: "🇺🇸" },
  { code: "GB", name: "English", flag: "🇬🇧" },
  { code: "ES", name: "Español", flag: "🇪🇸" },
  { code: "FR", name: "Français", flag: "🇫🇷" },
  { code: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "IT", name: "Italiano", flag: "🇮🇹" },
  { code: "PT", name: "Português", flag: "🇵🇹" },
  { code: "RU", name: "Русский", flag: "🇷🇺" },
  { code: "CN", name: "中文", flag: "🇨🇳" },
  { code: "JP", name: "日本語", flag: "🇯🇵" },
];

type LanguageContentProps = {
  selectedCountry: {
    code: string;
    name: string;
    flag: string;
  };
  onCountrySelect: (country: { code: string; name: string; flag: string }) => void;
  isDrawer?: boolean;
};

export function LanguageContent({ 
  selectedCountry, 
  onCountrySelect, 
  isDrawer = false 
}: LanguageContentProps) {
  return (
    <div className={cn("p-6", isDrawer && "p-0")}>
      <div className="space-y-2">
        {countries.map((country) => {
          const isSelected = selectedCountry.code === country.code;
          
          return (
            <Button
              key={country.code}
              variant={isSelected ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3",
                isSelected && "bg-primary/10 border border-primary/20"
              )}
              onClick={() => onCountrySelect(country)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{country.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">{country.name}</div>
                    <div className="text-xs text-muted-foreground">{country.code}</div>
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </Button>
          );
        })}
      </div>
      
      {isDrawer && (
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Language settings will be applied to the interface
          </p>
        </div>
      )}
    </div>
  );
}