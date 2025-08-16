import React from 'react'

interface LogoProps {
  variant?: 'default' | 'white' | 'icon'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'default', 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  }

  const getLogoSrc = () => {
    switch (variant) {
      case 'white':
        return '/logo-white.svg'
      case 'icon':
        return '/favicon.svg'
      default:
        return '/logo.svg'
    }
  }

  return (
    <img 
      src={getLogoSrc()} 
      alt="RealtyTopper" 
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  )
}

export default Logo
