import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Contact {
  id: number;
  name: string;
  message: string;
  date: string;
  avatar?: string;
  phone?: string;
}

interface RecentContactsProps {
  isLoading: boolean;
  contacts?: Contact[];
}

export default function RecentContacts({ isLoading, contacts }: RecentContactsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Contatos Recentes</h3>
          <a href="#" className="text-sm text-primary hover:underline">Ver todos</a>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
        ) : contacts && contacts.length > 0 ? (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                {contact.avatar ? (
                  <img 
                    src={contact.avatar} 
                    alt={contact.name} 
                    className="h-10 w-10 rounded-full object-cover" 
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-sm">
                    {contact.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{contact.name}</p>
                  <p className="text-xs text-gray-500 truncate">{contact.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(contact.date), "PPP 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {contact.phone && (
                  <button className="text-primary hover:text-blue-700">
                    <i className="ri-phone-line"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-gray-500">Nenhum contato recente.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
