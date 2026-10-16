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
  BadgeDollarSign,
  Smartphone,
  Banknote,
  // Additional icons for complete category & income support
  Tv,
  HeartPulse,
  GraduationCap,
  Home,
  Plane,
  Gift,
  HelpCircle,
  DollarSign,
  Coins,
  Building,
  Building2,
  Smile,
  Tag,
  ShoppingCart,
  Shirt,
  Droplets,
  Wifi,
  Pill,
  Stethoscope,
  BookOpen,
  Gamepad2,
  Film,
  Music,
  Dumbbell,
  Fuel,
  Pizza,
  Apple,
  Wine,
  Scissors,
  ShieldAlert,
  Activity,
  Package,
  Flame,
  Ticket,
  Trophy,
  Sparkles,
  Award,
  Gem,
  Percent,
  Layers,
  Bus,
  Bike
} from 'lucide-react';
import { BRAND_LOGOS_MAP } from './BankLogos';

interface IconRendererProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className, style }) => {
  // 1. Check if name matches real Bank / E-Wallet brand logo
  if (name && BRAND_LOGOS_MAP[name]) {
    const BrandLogoComponent = BRAND_LOGOS_MAP[name];
    return <BrandLogoComponent className={className || "w-5 h-5"} style={style} />;
  }

  // 2. Lucide Icon Dictionary with all category and source icons
  const icons: Record<string, React.FC<any>> = {
    // Dompet & Keuangan Klasik
    Wallet,
    CreditCard,
    Banknote,
    PiggyBank,
    Landmark,
    Smartphone,
    Coins,
    CircleDollarSign,
    DollarSign,
    BadgeDollarSign,
    TrendingUp,
    Percent,
    Gem,
    Layers,

    // Kategori Pengeluaran
    Utensils,
    Coffee,
    Pizza,
    Apple,
    Wine,
    Car,
    Bus,
    Fuel,
    Plane,
    Bike,
    ShoppingBag,
    ShoppingCart,
    Shirt,
    Tag,
    Package,
    Zap,
    Home,
    Droplets,
    Wifi,
    Tv,
    Flame,
    HeartPulse,
    Pill,
    Stethoscope,
    Activity,
    GraduationCap,
    BookOpen,
    Briefcase,
    Laptop,
    Gamepad2,
    Film,
    Music,
    Ticket,
    Dumbbell,
    Scissors,
    ShieldAlert,
    Gift,
    HelpCircle,
    Smile,

    // Sumber Pendapatan
    Building,
    Building2,
    Award,
    Trophy,
    Sparkles
  };

  const IconComponent = icons[name] || Wallet;
  
  return <IconComponent className={className || "w-5 h-5"} style={style} />;
};
