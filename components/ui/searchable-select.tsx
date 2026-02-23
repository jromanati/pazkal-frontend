'use client'

import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export type SearchableSelectOption<V extends string | number = string> = {
  value: V
  label: string
}

export function SearchableSelect<V extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Sin resultados',
  disabled,
  className,
  triggerClassName,
  contentClassName,
}: {
  value?: V | null
  onChange: (value: V) => void
  options: SearchableSelectOption<V>[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
}) {
  const [open, setOpen] = React.useState(false)

  const selected = React.useMemo(() => {
    if (value === undefined || value === null) return null
    return options.find((o) => o.value === value) ?? null
  }, [options, value])

  return (
    <div className={cn('w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm flex items-center justify-between gap-2 focus:ring-[#2c528c] focus:border-[#2c528c] disabled:opacity-50 disabled:cursor-not-allowed',
              triggerClassName,
            )}
          >
            <span className={cn('truncate', !selected ? 'text-gray-400' : 'text-slate-700 dark:text-gray-200')}>
              {selected ? selected.label : placeholder}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className={cn('w-[--radix-popover-trigger-width] p-0', contentClassName)} align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <CheckIcon className={cn('size-4', selected?.value === option.value ? 'opacity-100' : 'opacity-0')} />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
