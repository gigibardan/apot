import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { SupportedLanguage } from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-accent/10 transition-colors"
        >
          <Globe className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="sr-only">Switch language / Schimbă limba</span>
          <span className="absolute -top-1 -right-1 text-xs bg-background rounded-full w-5 h-5 flex items-center justify-center border border-border shadow-sm">
            {languages[currentLanguage].flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 animate-fade-in">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Language / Limbă
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(languages).map(([code, { nativeName, flag }]) => {
          const isActive = currentLanguage === code;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => changeLanguage(code as SupportedLanguage)}
              className={cn(
                "cursor-pointer transition-colors",
                isActive && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <span className="mr-2 text-base">{flag}</span>
              <span className="flex-1">{nativeName}</span>
              {isActive && (
                <Check className="h-4 w-4 ml-2 text-primary animate-in fade-in duration-200" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
