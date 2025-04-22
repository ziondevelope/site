import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WebsiteConfig } from "@shared/schema";
import { FaWhatsapp } from "react-icons/fa";

// Componente simplificado de WhatsApp Chat
export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  
  // Consulta para obter a configuração do site
  const { data: config, isLoading } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config']
  });
  
  // Fechar formulário ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Formatar número de telefone para o padrão brasileiro
  const formatPhone = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    cleaned = cleaned.slice(0, 11);
    
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    } else if (cleaned.length > 0) {
      formatted = `(${cleaned}`;
    }
    
    return formatted;
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };
  
  const validateForm = () => {
    if (!name.trim()) {
      setErrorMessage("Por favor, digite seu nome.");
      return false;
    }
    
    const phoneNumbers = phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      setErrorMessage("Por favor, digite um número de telefone válido.");
      return false;
    }
    
    setErrorMessage("");
    return true;
  };
  
  const createLeadMutation = useMutation({
    mutationFn: async (data: { name: string, phone: string }) => {
      return apiRequest('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          phone: data.phone.replace(/\D/g, ''),
          source: 'whatsapp-chat',
          status: 'new'
        })
      });
    },
    onSuccess: () => {
      openWhatsApp();
    },
    onError: () => {
      openWhatsApp();
    }
  });
  
  const openWhatsApp = () => {
    if (!config) return;
    
    setIsSubmitting(false);
    
    const phoneNumber = config.whatsappNumber?.replace(/\D/g, '') || "";
    const message = encodeURIComponent(config.whatsappMessage || "Olá! Gostaria de mais informações sobre um imóvel.");
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    setIsOpen(false);
    setName("");
    setPhone("");
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !config) {
      return;
    }
    
    setIsSubmitting(true);
    
    if (!config.whatsappFormEnabled) {
      openWhatsApp();
      return;
    }
    
    createLeadMutation.mutate({
      name,
      phone
    });
  };
  
  const handleButtonClick = () => {
    if (!config) return;
    
    if (!config.whatsappFormEnabled) {
      openWhatsApp();
    } else {
      setIsOpen(true);
    }
  };
  
  // Se estiver carregando, não mostra nada
  if (isLoading) {
    return null;
  }
  
  // Se não tiver configuração ou o chat não estiver habilitado, não mostre nada
  if (!config || config.whatsappChatEnabled === false) {
    return null;
  }
  
  // Determina a posição do botão
  const buttonPosition = config.whatsappButtonPosition === 'left' ? 'left-5' : 'right-5';
  
  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={handleButtonClick}
        className={`fixed bottom-5 ${buttonPosition} z-50 bg-[#25D366] text-white rounded-full p-3 shadow-lg hover:bg-[#128C7E] transition-all`}
        aria-label={config.whatsappButtonText || "Falar com corretor"}
      >
        {!isOpen ? (
          <div className="flex items-center justify-center">
            <FaWhatsapp className="h-6 w-6" />
            <span className="ml-2 whitespace-nowrap">{config.whatsappButtonText || "Falar com corretor"}</span>
          </div>
        ) : (
          <X className="h-6 w-6" />
        )}
      </button>

      {/* Modal do formulário */}
      {isOpen && config.whatsappFormEnabled && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={formRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="bg-[#25D366] text-white p-4 rounded-t-lg">
              <h2 className="text-xl font-bold">
                {config.whatsappFormTitle || "Entre em contato com um corretor"}
              </h2>
              <p className="text-sm mt-1 text-white text-opacity-90">
                {config.whatsappFormMessage || "Preencha seus dados para que um de nossos corretores possa lhe atender da melhor forma."}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {errorMessage}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 0 0000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[#25D366] text-white py-2 px-4 rounded-md hover:bg-[#128C7E] transition-colors flex items-center justify-center
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaWhatsapp className="h-4 w-4 mr-2" />
                    Continuar para WhatsApp
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Ao clicar em "Continuar para WhatsApp", você será redirecionado para o aplicativo do WhatsApp para iniciar uma conversa com um de nossos corretores.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}