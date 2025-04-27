import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WebsiteConfig } from '@shared/schema';
// Using plain footer HTML elements instead of an imported component
import Header from '../components/website/Header';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { data: config } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
  });

  const bgColor = config?.primaryColor || '#7f651e';
  const textColor = '#ffffff';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSending(true);
    setError('');

    try {
      // Simulating API call - in a real application, you would post data to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSubject('');
      setSent(true);
      
      setTimeout(() => {
        setSent(false);
      }, 5000);
    } catch (error) {
      setError('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div 
          className="w-full bg-cover bg-center h-64 md:h-80 flex items-center justify-center"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${config?.contactBanner || '/images/contact-bg.jpg'})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Entre em Contato</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto px-4">
              Estamos aqui para ajudar. Entre em contato conosco e responderemos o mais breve possível.
            </p>
          </div>
        </div>

        {/* Contact Details & Form Section */}
        <div className="container mx-auto py-16 px-4 md:px-8">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4" style={{ color: bgColor }}>
                  Informações de Contato
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: bgColor }} />
                    <div>
                      <h4 className="font-medium">Nosso Endereço</h4>
                      <p className="text-gray-600 mt-1">
                        {config?.address || 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-000'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: bgColor }} />
                    <div>
                      <h4 className="font-medium">Telefone</h4>
                      <p className="text-gray-600 mt-1">
                        {config?.phone || '(11) 9999-9999'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: bgColor }} />
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p className="text-gray-600 mt-1">
                        {config?.email || 'contato@imobiliaria.com.br'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: bgColor }} />
                    <div>
                      <h4 className="font-medium">Horário de Funcionamento</h4>
                      <p className="text-gray-600 mt-1">
                        {config?.businessHours || 'Segunda à Sexta: 9h às 18h'}<br />
                        {config?.businessHoursSat || 'Sábado: 9h às 13h'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              {(config?.facebookUrl || config?.instagramUrl || config?.linkedinUrl) && (
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: bgColor }}>
                    Redes Sociais
                  </h3>
                  <div className="flex space-x-4">
                    {config?.facebookUrl && (
                      <a 
                        href={config.facebookUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: bgColor }}
                        aria-label="Facebook"
                      >
                        <i className="fab fa-facebook-f text-white"></i>
                      </a>
                    )}
                    
                    {config?.instagramUrl && (
                      <a 
                        href={config.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: bgColor }}
                        aria-label="Instagram"
                      >
                        <i className="fab fa-instagram text-white"></i>
                      </a>
                    )}
                    
                    {config?.linkedinUrl && (
                      <a 
                        href={config.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: bgColor }}
                        aria-label="LinkedIn"
                      >
                        <i className="fab fa-linkedin-in text-white"></i>
                      </a>
                    )}

                    {config?.youtubeUrl && (
                      <a 
                        href={config.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: bgColor }}
                        aria-label="YouTube"
                      >
                        <i className="fab fa-youtube text-white"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Contact Form */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: bgColor }}>
                Envie sua mensagem
              </h3>
              
              {sent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-700 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Mensagem enviada com sucesso! Entraremos em contato em breve.
                  </p>
                </div>
              ) : null}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo*
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none focus:ring-[#7f651e]"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      placeholder="Seu email"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      placeholder="Seu telefone"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Assunto
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      placeholder="Assunto da mensagem"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem*
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none resize-none"
                    placeholder="Como podemos ajudar?"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={sending}
                    style={{ backgroundColor: bgColor, color: textColor }}
                    className="flex items-center justify-center w-full md:w-auto px-8 py-3 rounded-lg font-medium transition-transform hover:shadow-md active:scale-[0.98] disabled:opacity-70"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar mensagem
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="w-full h-[400px] bg-gray-100">
          {config?.mapEmbedUrl ? (
            <iframe
              src={config.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização no mapa"
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">Mapa não configurado</p>
                <p className="text-sm">Configure o endereço do Google Maps no painel administrativo</p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;