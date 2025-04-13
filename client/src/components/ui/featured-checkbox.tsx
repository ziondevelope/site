import { FormControl, FormItem, FormLabel } from "@/components/ui/form";

interface FeaturedCheckboxProps {
  field: {
    value: boolean;
    onChange: (value: boolean) => void;
  };
}

export function FeaturedCheckbox({ field }: FeaturedCheckboxProps) {
  return (
    <FormItem className="pt-6">
      <div className={`border rounded-lg p-4 ${field.value ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200'} transition-colors duration-200`}>
        <div className="flex items-center">
          <FormControl>
            <input
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </FormControl>
          <div className="ml-3">
            <FormLabel className="text-base font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-indigo-500"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              Destacar na página inicial
            </FormLabel>
            <div className="text-sm text-gray-500 mt-1">
              Este imóvel será exibido em destaque na página inicial do site e terá maior visibilidade.
            </div>
          </div>
        </div>
      </div>
    </FormItem>
  );
}