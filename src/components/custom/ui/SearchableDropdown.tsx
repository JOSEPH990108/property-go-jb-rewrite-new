// src\components\custom\ui\SearchableDropdown.tsx
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
export interface DropdownOption {
  id: string;
  label: string;
  imageUrl?: string;
}

interface QuickSelectAction {
  label: string;
  actionText: string;
  optionId: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  selected: DropdownOption | null;
  onSelect: (option: DropdownOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  quickAction?: QuickSelectAction;
  /** * Controls the "Window Size".
   * Example: If set to 5, the dropdown height will match 5 items.
   * You can still scroll to see the rest.
   * @default 5
   */
  maxVisibleItems?: number;
}

// Fixed height per item (48px) ensures smooth math for the window size
const ITEM_HEIGHT = 48;

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  selected,
  onSelect,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  quickAction,
  maxVisibleItems = 5,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
    setQuery("");
  };

  const handleQuickAction = () => {
    if (!quickAction) return;
    const found = options.find((o) => o.id === quickAction.optionId);
    if (found) handleSelect(found);
  };

  // 1. Calculate the maximum height the list is allowed to take.
  // This sets the "Window Size".
  const listMaxHeight = maxVisibleItems * ITEM_HEIGHT;

  return (
    <div className="text-foreground relative z-50 w-80 font-sans" ref={containerRef}>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground));
        }
      `}</style>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-popover flex w-full items-center justify-between rounded-lg border p-3 transition-all duration-200 ${
          isOpen
            ? "border-ring ring-ring/20 rounded-b-none border-b-0 ring-2"
            : "border-input hover:border-ring/50"
        } `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selected ? (
            <>
              {selected.imageUrl && (
                <img
                  src={selected.imageUrl}
                  alt=""
                  className="border-border h-6 w-6 shrink-0 rounded-full border object-cover"
                />
              )}
              <span className="text-foreground truncate text-lg font-medium">{selected.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`text-muted-foreground h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            // Removed overflow-hidden here to fix the "clipping" bug you saw before
            className="bg-popover border-ring absolute top-full right-0 left-0 rounded-b-lg border border-t-0 shadow-xl"
          >
            {/* Search (Fixed at top) */}
            <div className="border-border border-b p-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="bg-background border-input focus:border-ring text-foreground w-full rounded-md border py-2 pr-3 pl-9 text-sm focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Action (Fixed at top) */}
            {quickAction && (
              <div className="border-border bg-muted/50 border-b px-4 py-2">
                <p className="text-muted-foreground text-sm">
                  {quickAction.label}{" "}
                  <button
                    type="button"
                    onClick={handleQuickAction}
                    className="text-primary ml-1 cursor-pointer border-none bg-transparent p-0 font-semibold hover:underline"
                  >
                    {quickAction.actionText}
                  </button>
                </p>
              </div>
            )}

            {/* Scrollable List Area */}
            <ul
              data-lenis-prevent
              className="custom-scrollbar overflow-y-auto"
              // 2. Apply max height here. If list is longer, scrollbar appears.
              style={{ maxHeight: `${listMaxHeight}px` }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selected?.id === option.id;
                  return (
                    <li
                      key={option.id}
                      onClick={() => handleSelect(option)}
                      // 3. Fixed height (h-12 / 48px) ensures the calculation matches exactly.
                      className={`flex h-12 cursor-pointer items-center justify-between px-4 transition-colors ${isSelected ? "bg-accent/20" : "hover:bg-muted"} `}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {option.imageUrl && (
                          <img
                            src={option.imageUrl}
                            alt=""
                            className="border-border h-6 w-6 shrink-0 rounded-full border object-cover shadow-sm"
                          />
                        )}
                        <span
                          className={`truncate text-base ${isSelected ? "text-foreground font-medium" : "text-muted-foreground"}`}
                        >
                          {option.label}
                        </span>
                      </div>
                      {isSelected && <Check className="text-primary h-5 w-5 shrink-0" />}
                    </li>
                  );
                })
              ) : (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  No results found
                </div>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableDropdown;
