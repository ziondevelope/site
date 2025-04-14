import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

// Componente de slider de preço com dois pinos (thumbs)
const PriceRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full" style={{backgroundColor: 'var(--range-bg, var(--primary))'}} />
    </SliderPrimitive.Track>
    
    {/* Primeiro pino (thumb) - mínimo */}
    <SliderPrimitive.Thumb 
      className="block h-5 w-5 rounded-full border-2 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      style={{borderColor: 'var(--thumb-bg, var(--primary))'}}
    >
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        Min
      </div>
    </SliderPrimitive.Thumb>
    
    {/* Segundo pino (thumb) - máximo */}
    <SliderPrimitive.Thumb 
      className="block h-5 w-5 rounded-full border-2 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" 
      style={{borderColor: 'var(--thumb-bg, var(--primary))'}}
    >
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        Max
      </div>
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
))

PriceRangeSlider.displayName = SliderPrimitive.Root.displayName

export { PriceRangeSlider }