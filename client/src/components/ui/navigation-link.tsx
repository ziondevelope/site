import React from 'react';
import { Link } from 'wouter';
import { useLoading } from '../../contexts/LoadingContext';

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function NavigationLink({ href, children, className = '', onClick }: NavigationLinkProps) {
  const { startLoading } = useLoading();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Se o link for interno (não externo e não âncora), inicie o carregamento
    if (!href.startsWith('http') && !href.startsWith('#')) {
      startLoading();
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link href={href}>
      <a className={className} onClick={handleClick}>
        {children}
      </a>
    </Link>
  );
}