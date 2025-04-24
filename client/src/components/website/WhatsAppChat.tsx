import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WebsiteConfig } from "@shared/schema";
import { FaWhatsapp } from "react-icons/fa";
import { useUI } from "@/contexts/UIContext";

// Definindo a animação de bounce para o botão de WhatsApp
const WhatsAppBounceAnimation = `
  @keyframes whatsapp-bounce {
    0%, 100% { transform: translateY(0); }
    25% { transform: translateY(-6px); }
    50% { transform: translateY(0); }
    75% { transform: translateY(-3px); }
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-in-out forwards;
  }
`;

// Componente simplificado de WhatsApp Chat
export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showInitialMessage, setShowInitialMessage] = useState(true);
  const [showButtonTooltip, setShowButtonTooltip] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Obtém o estado global do modal de propriedade
  const { isPropertyModalOpen } = useUI();
  
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
  
  // Se não tiver configuração, o chat não estiver habilitado ou o modal de propriedade estiver aberto, não mostre nada
  if (!config || config.whatsappChatEnabled === false || isPropertyModalOpen) {
    return null;
  }
  
  // Determina a posição do botão
  const buttonPosition = config.whatsappButtonPosition === 'left' ? 'left-5' : 'right-5';
  
  return (
    <>
      {/* Adiciona os estilos CSS no DOM */}
      <style>{WhatsAppBounceAnimation}</style>
      
      {/* Botão flutuante com caixa de mensagem */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        {/* Caixa de mensagem */}
        {showInitialMessage && !isOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-3 max-w-xs animate-fade-in relative">
            {/* Indicador "Online" */}
            <div className="absolute top-4 left-4 flex items-center">
              <div className="h-3 w-3 bg-[#25D366] rounded-full mr-2"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">Online</span>
            </div>
            
            {/* Botão de fechar */}
            <button 
              onClick={() => setShowInitialMessage(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-300"
              style={{
                color: config.whatsappChatTextColor || "#333333",
              }}
            >
              <X className="h-4 w-4" />
            </button>
            
            {/* Mensagem */}
            <div 
              className="mt-6 text-center px-4"
              style={{
                backgroundColor: config.whatsappChatBackgroundColor || "#ffffff",
                color: config.whatsappChatTextColor || "#333333",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <p className="text-sm font-medium" style={{ color: config.whatsappChatTextColor || "#333333" }}>
                {config.whatsappInitialMessage || "Está com dificuldades para achar o imóvel dos seus sonhos? De Imóveis Populares a de Alto Padrão, CHAME O CAPITÃO!!"}
              </p>
              
              <button
                onClick={handleButtonClick}
                className="mt-4 py-2 px-5 rounded-full font-medium text-sm transition-all duration-200 w-full shadow-sm"
                style={{
                  backgroundColor: config.whatsappButtonBackgroundColor || '#25D366',
                  color: config.whatsappButtonTextColor || '#ffffff',
                }}
              >
                Fale com um corretor
              </button>
            </div>
          </div>
        )}
        
        {/* Botão do WhatsApp */}
        <button
          onClick={handleButtonClick}
          className="rounded-full p-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
          aria-label={config.whatsappButtonText || "Falar com corretor"}
          style={{
            backgroundColor: config.whatsappButtonBackgroundColor || '#25D366',
            color: config.whatsappButtonTextColor || '#ffffff',
            boxShadow: `0 4px 12px ${config.whatsappButtonBackgroundColor || '#25D366'}66`,
            animation: showInitialMessage ? '' : 'whatsapp-bounce 2.5s ease-in-out infinite'
          }}
          onMouseEnter={() => !showInitialMessage && setShowButtonTooltip(true)}
          onMouseLeave={() => setShowButtonTooltip(false)}
        >
          {!isOpen ? (
            <FaWhatsapp className="h-7 w-7 animate-pulse" style={{ color: config.whatsappButtonTextColor || '#ffffff' }} />
          ) : (
            <X className="h-6 w-6" style={{ color: config.whatsappButtonTextColor || '#ffffff' }} />
          )}
        </button>
        
        {/* Tooltip ao passar o mouse */}
        {showButtonTooltip && !showInitialMessage && !isOpen && (
          <div className="absolute bottom-14 right-0 bg-white shadow-md rounded-lg p-2 text-sm text-gray-700 animate-fade-in whitespace-nowrap">
            {config.whatsappButtonText || "Falar com corretor"}
          </div>
        )}
      </div>

      {/* Modal do formulário */}
      {isOpen && config.whatsappFormEnabled && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={formRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative overflow-hidden animate-fade-in"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-10 rounded-full p-1 transition-all duration-200"
              style={{
                backgroundColor: `${config.whatsappButtonBackgroundColor || '#25D366'}30`,
                color: config.whatsappButtonTextColor || '#ffffff',
              }}
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-white p-6 pb-7 relative" style={{
              backgroundColor: config.whatsappButtonBackgroundColor || '#25D366',
              color: config.whatsappButtonTextColor || '#ffffff',
            }}>
              {/* Ícone decorativo */}
              <div className="absolute right-4 top-4 opacity-10">
                <FaWhatsapp 
                  className="h-20 w-20" 
                  style={{ color: config.whatsappButtonTextColor || '#ffffff' }}
                />
              </div>
              
              <h2 className="text-2xl font-bold relative z-[1]" style={{ color: config.whatsappButtonTextColor || '#ffffff' }}>
                {config.whatsappFormTitle || "Entre em contato com um corretor"}
              </h2>
              <p className="text-sm mt-2 max-w-[80%] relative z-[1]" style={{ color: config.whatsappButtonTextColor || '#ffffff', opacity: 0.9 }}>
                {config.whatsappFormMessage || "Preencha seus dados para que um de nossos corretores possa lhe atender da melhor forma."}
              </p>
              
              {/* Onda decorativa */}
              <div className="absolute -bottom-5 left-0 right-0 h-10 bg-white" style={{ 
                borderTopLeftRadius: '50%', 
                borderTopRightRadius: '50%',
                transform: 'scaleX(1.5)'
              }}></div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
              {errorMessage && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border-l-4 border-red-500 shadow-sm">
                  {errorMessage}
                </div>
              )}
              
              <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#25D366] focus:border-transparent shadow-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telefone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 0 0000-0000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#25D366] focus:border-transparent shadow-sm"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-6 py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center shadow-md
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'transform hover:translate-y-[-2px]'}`}
                style={{
                  backgroundColor: config.whatsappButtonBackgroundColor || '#25D366',
                  color: config.whatsappButtonTextColor || '#ffffff',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Enviando...</span>
                  </>
                ) : (
                  <>
                    <FaWhatsapp className="h-5 w-5 mr-2" />
                    <span className="font-medium">Continuar para WhatsApp</span>
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4 px-2">
                Ao clicar em "Continuar para WhatsApp", você será redirecionado para o WhatsApp para iniciar uma conversa com nossos corretores.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}