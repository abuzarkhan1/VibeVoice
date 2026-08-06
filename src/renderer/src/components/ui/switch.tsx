import * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}): React.JSX.Element {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer relative inline-flex shrink-0 items-center rounded-full transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'data-[state=unchecked]:bg-white/15 data-[state=checked]:bg-brand',
        'disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-4 w-7' : 'h-[22px] w-[36px]',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block rounded-full bg-white shadow-sm transition-transform',
          size === 'sm'
            ? 'size-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0.5'
            : 'size-[18px] data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-0.5'
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
