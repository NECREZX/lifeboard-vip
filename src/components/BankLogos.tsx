import React from 'react';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export const BrandBadge: React.FC<{
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ src, alt, className = 'w-6 h-6', style }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`rounded-2xl object-cover shadow-2xs select-none pointer-events-none ${className}`}
      style={style}
      loading="lazy" 
    />
  );
};

// 1. Bank Mandiri / Livin' Mandiri (Official Play Store App Icon)
export const MandiriLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/mandiri.png" alt="Livin' by Mandiri" {...props} />
);

// 2. Bank BCA / myBCA / Blu (Official Play Store App Icon)
export const BCALogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/bca.png" alt="BCA Mobile" {...props} />
);

// 3. Bank BNI Mobile (Official Play Store App Icon)
export const BNILogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/bni.png" alt="BNI Mobile Banking" {...props} />
);

// 4. Bank BRI / BRImo (Official Play Store App Icon)
export const BRILogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/bri.png" alt="BRImo BRI" {...props} />
);

// 5. Bank Syariah Indonesia (BSI) (Official Play Store App Icon)
export const BSILogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/bsi.png" alt="BSI Mobile" {...props} />
);

// 6. Bank Jago (Official Play Store App Icon)
export const JagoLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/jago.png" alt="Bank Jago" {...props} />
);

// 7. SeaBank (Official Play Store App Icon)
export const SeaBankLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/seabank.png" alt="SeaBank" {...props} />
);

// 8. Bank Jenius / BTPN (Official Play Store App Icon)
export const JeniusLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/jenius.png" alt="Jenius BTPN" {...props} />
);

// 9. CIMB Niaga / OCTO (Official Play Store App Icon)
export const CIMBLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/cimb.png" alt="OCTO Mobile CIMB Niaga" {...props} />
);

// 10. Bank Permata (Official Play Store App Icon)
export const PermataLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/permata.png" alt="PermataMobile X" {...props} />
);

// 11. Bank Danamon (Official Play Store App Icon)
export const DanamonLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/danamon.png" alt="D-Bank PRO Danamon" {...props} />
);

// 12. Bank Neo Commerce / Neobank (Official Play Store App Icon)
export const NeoLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/neo.png" alt="neobank Bank Neo Commerce" {...props} />
);

// 13. GoPay (Official Play Store App Icon)
export const GoPayLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/gopay.png" alt="GoPay" {...props} />
);

// 14. OVO (Official Play Store App Icon)
export const OVOLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/ovo.png" alt="OVO" {...props} />
);

// 15. DANA (Official Play Store App Icon)
export const DANALogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/dana.png" alt="DANA" {...props} />
);

// 16. ShopeePay (Official Play Store App Icon)
export const ShopeePayLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/shopeepay.png" alt="ShopeePay" {...props} />
);

// 17. LinkAja (Official Play Store App Icon)
export const LinkAjaLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/linkaja.png" alt="LinkAja" {...props} />
);

// 18. AstraPay (Official Play Store App Icon)
export const AstraPayLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/astrapay.png" alt="AstraPay" {...props} />
);

// 19. PayPal (Official Play Store App Icon)
export const PayPalLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/paypal.png" alt="PayPal" {...props} />
);

// 20. Bibit (Investasi Reksadana) (Official Play Store App Icon)
export const BibitLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/bibit.png" alt="Bibit" {...props} />
);

// 21. Crypto / Bitcoin
export const CryptoLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/crypto.png" alt="Bitcoin / Crypto" {...props} />
);

// 22. Cash (Uang Tunai)
export const CashLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/cash.svg" alt="Cash Tunai" {...props} />
);

// 23. Sedekah (Amal / Donasi)
export const SedekahLogo: React.FC<LogoProps> = (props) => (
  <BrandBadge src="/brand-logos/sedekah.svg" alt="Sedekah Donasi" {...props} />
);

// Brand definition registry for picker and auto-detect
export interface BrandWalletItem {
  id: string;
  name: string;
  category: 'bank' | 'ewallet' | 'investasi' | 'klasik' | 'lainnya';
  defaultColor: string;
  keywords: string[];
}

export const BRAND_WALLETS: BrandWalletItem[] = [
  // Bank Populer
  { id: 'BankMandiri', name: 'Livin by Mandiri', category: 'bank', defaultColor: '#003D79', keywords: ['mandiri', 'livin', 'livin mandiri', 'bank mandiri'] },
  { id: 'BankBCA', name: 'BCA / myBCA', category: 'bank', defaultColor: '#005BAA', keywords: ['bca', 'mybca', 'klikbca', 'blu', 'bank bca'] },
  { id: 'BankBNI', name: 'BNI Mobile', category: 'bank', defaultColor: '#005E6A', keywords: ['bni', 'bni mobile', 'wondr', 'bni 46', 'bank bni'] },
  { id: 'BankBRI', name: 'BRI / BRImo', category: 'bank', defaultColor: '#00529C', keywords: ['bri', 'brimo', 'bank bri'] },
  { id: 'BankBSI', name: 'BSI Mobile', category: 'bank', defaultColor: '#00A39D', keywords: ['bsi', 'syariah', 'bank syariah', 'bank bsi'] },
  { id: 'BankJago', name: 'Bank Jago', category: 'bank', defaultColor: '#6F2DBD', keywords: ['jago', 'bank jago'] },
  { id: 'SeaBank', name: 'SeaBank', category: 'bank', defaultColor: '#FF5722', keywords: ['seabank', 'sea bank', 'sea'] },
  { id: 'BankJenius', name: 'Jenius (BTPN)', category: 'bank', defaultColor: '#00A9E0', keywords: ['jenius', 'btpn', 'bank btpn', 'bank jenius'] },
  { id: 'BankCIMB', name: 'OCTO by CIMB', category: 'bank', defaultColor: '#ED1B24', keywords: ['cimb', 'octo', 'cimb niaga'] },
  { id: 'BankPermata', name: 'PermataMobile', category: 'bank', defaultColor: '#0C2340', keywords: ['permata', 'permata bank', 'permatanet'] },
  { id: 'BankDanamon', name: 'D-Bank Danamon', category: 'bank', defaultColor: '#0072CE', keywords: ['danamon', 'bank danamon', 'd-bank'] },
  { id: 'BankNeo', name: 'neobank (BNC)', category: 'bank', defaultColor: '#FCD535', keywords: ['neo', 'bnc', 'neobank', 'bank neo'] },

  // E-Wallet & Dompet Digital
  { id: 'GoPay', name: 'GoPay', category: 'ewallet', defaultColor: '#00AED6', keywords: ['gopay', 'gojek', 'go-pay'] },
  { id: 'OVO', name: 'OVO', category: 'ewallet', defaultColor: '#4C3494', keywords: ['ovo', 'ovo cash'] },
  { id: 'DANA', name: 'DANA', category: 'ewallet', defaultColor: '#118EEA', keywords: ['dana', 'dana dompet'] },
  { id: 'ShopeePay', name: 'ShopeePay', category: 'ewallet', defaultColor: '#EE4D2D', keywords: ['shopee', 'shopeepay', 'spay'] },
  { id: 'LinkAja', name: 'LinkAja', category: 'ewallet', defaultColor: '#E31E25', keywords: ['linkaja', 'link aja', 'tcash'] },
  { id: 'AstraPay', name: 'AstraPay', category: 'ewallet', defaultColor: '#004098', keywords: ['astrapay', 'astra pay', 'astra'] },
  { id: 'PayPal', name: 'PayPal', category: 'ewallet', defaultColor: '#003087', keywords: ['paypal', 'pay pal'] },

  // Lainnya (Cash & Sedekah)
  { id: 'Cash', name: 'Cash / Tunai', category: 'lainnya', defaultColor: '#10B981', keywords: ['cash', 'tunai', 'uang tunai', 'dompet tunai', 'uang fisik', 'uang kertas'] },
  { id: 'Sedekah', name: 'Sedekah / Amal', category: 'lainnya', defaultColor: '#D97706', keywords: ['sedekah', 'amal', 'donasi', 'infak', 'infaq', 'zakat', 'kotak amal', 'masjid', 'wakaf'] },

  // Investasi & Crypto
  { id: 'Bibit', name: 'Bibit Reksadana', category: 'investasi', defaultColor: '#10B981', keywords: ['bibit', 'reksadana bibit'] },
  { id: 'Crypto', name: 'Crypto / Bitcoin', category: 'investasi', defaultColor: '#F59E0B', keywords: ['crypto', 'kripto', 'bitcoin', 'btc', 'indodax', 'tokocrypto', 'binance', 'pintu'] }
];

export const BRAND_LOGOS_MAP: Record<string, React.FC<LogoProps>> = {
  BankMandiri: MandiriLogo,
  BankBCA: BCALogo,
  BankBNI: BNILogo,
  BankBRI: BRILogo,
  BankBSI: BSILogo,
  BankJago: JagoLogo,
  SeaBank: SeaBankLogo,
  BankJenius: JeniusLogo,
  BankCIMB: CIMBLogo,
  BankPermata: PermataLogo,
  BankDanamon: DanamonLogo,
  BankNeo: NeoLogo,
  GoPay: GoPayLogo,
  OVO: OVOLogo,
  DANA: DANALogo,
  ShopeePay: ShopeePayLogo,
  LinkAja: LinkAjaLogo,
  AstraPay: AstraPayLogo,
  PayPal: PayPalLogo,
  Cash: CashLogo,
  cash: CashLogo,
  Sedekah: SedekahLogo,
  sedekah: SedekahLogo,
  Bibit: BibitLogo,
  Crypto: CryptoLogo
};

/**
 * Intelligent helper to auto-detect matching brand icon & brand color
 * from user typing wallet name (e.g. "Livin Mandiri" -> MandiriLogo + #003D79)
 */
export function detectBrandFromWalletName(name: string): { icon: string; color: string; label: string } | null {
  if (!name || !name.trim()) return null;
  const clean = name.toLowerCase().trim();

  for (const item of BRAND_WALLETS) {
    if (item.keywords.some(kw => clean.includes(kw))) {
      return { icon: item.id, color: item.defaultColor, label: item.name };
    }
  }

  // Common cash / physical wallet keywords
  if (clean.includes('tunai') || clean.includes('cash') || clean.includes('uang tunai')) {
    return { icon: 'Cash', color: '#10b981', label: 'Uang Tunai (Cash)' };
  }
  if (clean.includes('sedekah') || clean.includes('amal') || clean.includes('donasi') || clean.includes('infak') || clean.includes('zakat') || clean.includes('kotak amal')) {
    return { icon: 'Sedekah', color: '#D97706', label: 'Sedekah / Amal' };
  }
  if (clean.includes('dompet') || clean.includes('fisik') || clean.includes('kantong')) {
    return { icon: 'Wallet', color: '#6366f1', label: 'Dompet Fisik' };
  }
  if (clean.includes('kartu kredit') || clean.includes('credit card') || clean.includes('cc')) {
    return { icon: 'CreditCard', color: '#ef4444', label: 'Kartu Kredit' };
  }
  if (clean.includes('tabungan') || clean.includes('celengan')) {
    return { icon: 'PiggyBank', color: '#ec4899', label: 'Celengan' };
  }

  return null;
}
