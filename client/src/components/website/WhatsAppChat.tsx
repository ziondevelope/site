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
  const [email, setEmail] = useState("");
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

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("Por favor, digite um e-mail válido.");
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
    mutationFn: async (data: { name: string, email: string, phone: string }) => {
      return apiRequest('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
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
    setEmail("");
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
      email,
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
          className="rounded-full p-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center bg-[#25D366] text-white"
          aria-label={config.whatsappButtonText || "Falar com corretor"}
          style={{
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
            animation: showInitialMessage ? '' : 'whatsapp-bounce 2.5s ease-in-out infinite'
          }}
          onMouseEnter={() => !showInitialMessage && setShowButtonTooltip(true)}
          onMouseLeave={() => setShowButtonTooltip(false)}
        >
          {!isOpen ? (
            <FaWhatsapp className="h-7 w-7 animate-pulse text-white" />
          ) : (
            <X className="h-6 w-6 text-white" />
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
            {/* Cabeçalho simplificado */}
            <div className="text-center p-4 pb-3 relative">
              <h2 className="text-2xl font-bold" style={{ color: "#333" }}>
                Fale pelo WhatsApp
              </h2>
              
              <p className="text-sm text-gray-600 mt-2 px-4">
                Preencha seus dados para que um de nossos corretores possa lhe atender da melhor forma.
              </p>
              
              {/* Botão de fechar dentro do modal */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Fundo de padrão de WhatsApp em baixa opacidade */}
            <div 
              className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 0h2v20H9V0zm25.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm-20 20l1.732 1-10 17.32-1.732-1 10-17.32zM58.16 4.134l1 1.732-17.32 10-1-1.732 17.32-10zm-40 40l1 1.732-17.32 10-1-1.732 17.32-10zM80 9v2H60V9h20zM20 69v2H0v-2h20zm79.32-55l-1 1.732-17.32-10L82 4l17.32 10zm-80 80l-1 1.732-17.32-10L2 84l17.32 10zm96.546-75.84l-1.732 1-10-17.32 1.732-1 10 17.32zm-100 100l-1.732 1-10-17.32 1.732-1 10 17.32zM38.16 24.134l1 1.732-17.32 10-1-1.732 17.32-10zM60 29v2H40v-2h20zm19.32 5l-1 1.732-17.32-10L62 24l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM111 40h-2V20h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zM40 49v2H20v-2h20zm19.32 5l-1 1.732-17.32-10L42 44l17.32 10zm-40 40l-1 1.732-17.32-10L2 84l17.32 10zm75.546-75.84l-1.732 1-10-17.32 1.732-1 10 17.32zm-20 20l-1.732 1-10-17.32 1.732-1 10 17.32zM118.16 29.134l1 1.732-17.32 10-1-1.732 17.32-10zm-40 40l1 1.732-17.32 10-1-1.732 17.32-10zM80 49v2H60v-2h20zm-40 40v2H20v-2h20zm39.32-5l-1 1.732-17.32-10L62 64l17.32 10zm-80 80l-1 1.732-17.32-10L2 104l17.32 10zm76.546-75.84l-1.732 1-10-17.32 1.732-1 10 17.32zm56.582 15.84l1 1.732-17.32 10-1-1.732 17.32-10zm-20 20l1 1.732-17.32 10-1-1.732 17.32-10zm-40 40l1 1.732-17.32 10-1-1.732 17.32-10zM60 89v2H40v-2h20zm-20 20v2H0v-2h20zm36.546-15.84l-1.732 1-10-17.32 1.732-1 10 17.32zm-60 60l-1.732 1-10-17.32 1.732-1 10 17.32zM100 89v2H80v-2h20zm19.32 5l-1 1.732-17.32-10L102 84l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM96.66 108.84l-1.732 1-10-17.32 1.732-1 10 17.32zM120 109v2h-20v-2h20z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundSize: '150px 150px'
              }}
            ></div>
                        
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-0 space-y-3 relative z-10">
              {errorMessage && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border-l-4 border-red-500 shadow-sm mb-3">
                  {errorMessage}
                </div>
              )}
              
              {/* Formulário simplificado como na imagem */}
              <div className="grid grid-cols-1 gap-3">
                {/* Campo Nome */}
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome"
                  className="w-full py-3 px-4 rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-[#25D366] focus:border-[#25D366]"
                  required
                />
                
                {/* Campo Email */}
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail (opcional)"
                  className="w-full py-3 px-4 rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-[#25D366] focus:border-[#25D366]"
                />
                
                {/* Campo Telefone */}
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Telefone"
                  className="w-full py-3 px-4 rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-[#25D366] focus:border-[#25D366]"
                  required
                />
              </div>
              
              {/* Botão estilo semelhante à imagem de referência */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-5 py-3 px-4 rounded-full bg-[#25D366] text-white font-medium flex items-center justify-center transition-all duration-300
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#20c15c] transform hover:scale-[1.02]'}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Ir para o WhatsApp</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}