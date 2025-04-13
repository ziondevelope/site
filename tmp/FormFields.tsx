// Este arquivo contém os componentes FormField para suites e parkingSpots

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const SuitesFormField = ({ form }) => (
  <FormField
    control={form.control}
    name="suites"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Suítes</FormLabel>
        <FormControl>
          <Input 
            type="number" 
            placeholder="1"
            {...field}
            value={field.value || 0}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const ParkingSpotsFormField = ({ form }) => (
  <FormField
    control={form.control}
    name="parkingSpots"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Vagas de Garagem</FormLabel>
        <FormControl>
          <Input 
            type="number" 
            placeholder="1"
            {...field}
            value={field.value || 0}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);