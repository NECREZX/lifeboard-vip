import React from 'react';
import {
  Wallet,
  Utensils,
  Car,
  Coffee,
  Zap,
  ShoppingBag,
  Briefcase,
  Laptop,
  TrendingUp,
  CircleDollarSign,
  Landmark,
  CreditCard,
  PiggyBank,
  BadgeDollarSign
} from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className }) => {
  const icons: Record<string, React.FC<any>> = {
    Wallet,
    Utensils,
    Car,
    Coffee,
    Zap,
    ShoppingBag,
    Briefcase,
    Laptop,
    TrendingUp,
    CircleDollarSign,
    Landmark,
    CreditCard,
    PiggyBank,
    BadgeDollarSign
  };

  const IconComponent = icons[name] || Wallet;
  
  return <IconComponent className={className || "w-5 h-5"} />;
};
