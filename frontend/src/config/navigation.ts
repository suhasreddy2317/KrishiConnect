import React from 'react';
import {
  TrendingUp,
  Package,
  Clock,
  User,
  Users,
  Layers,
  Building2,
  Coins,
  BarChart3,
  Search,
  CheckCircle,
  Truck,
  CheckSquare,
  AlertTriangle,
  History,
  FileCheck,
  Scale,
  LineChart,
  FileText,
  Activity,
  Home,
} from 'lucide-react';

export type UserRole = 'farmer' | 'fpo' | 'buyer' | 'field-agent' | 'admin';

export interface NavItemConfig {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  description?: string;
}

export interface RolePalette {
  primary: string;
  background: string;
  surface: string;
  raised: string;
  accent: string;
  darkText: string;
  mutedText: string;
  border: string;
}

export interface RoleConfig {
  id: UserRole;
  title: string;
  shortName: string;
  tagline: string;
  basePath: string;
  accentColor: string;
  primaryActionLabel?: string;
  palette: RolePalette;
  navItems: NavItemConfig[];
  bottomNavItems?: NavItemConfig[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  farmer: {
    id: 'farmer',
    title: 'Farmer Workspace',
    shortName: 'Farmer',
    tagline: 'Decision-first crop selling & trust verification',
    basePath: '/farmer',
    accentColor: '#66BB6A',
    primaryActionLabel: 'Check Recommendation',
    palette: {
      primary: '#2E7D32',
      background: '#F3FAF4',
      surface: '#FFFFFF',
      raised: '#E8F5E9',
      accent: '#66BB6A',
      darkText: '#1B2A1D',
      mutedText: '#5F6F61',
      border: '#C8E6C9',
    },
    navItems: [
      { name: 'Home', path: '/farmer', icon: Home, description: 'Daily Decision Overview' },
      { name: 'Market', path: '/farmer/market', icon: TrendingUp, description: 'Mandi Price Benchmarks' },
      { name: 'My Lots', path: '/farmer/lots', icon: Package, description: 'Produce Lots & Grading' },
      { name: 'Offers', path: '/farmer/offers', icon: Clock, description: 'Buyer Negotiations' },
      { name: 'Profile', path: '/farmer/profile', icon: User, description: 'Farm & Bank Details' },
    ],
    bottomNavItems: [
      { name: 'Home', path: '/farmer', icon: Home },
      { name: 'Market', path: '/farmer/market', icon: TrendingUp },
      { name: 'My Lots', path: '/farmer/lots', icon: Package },
      { name: 'Offers', path: '/farmer/offers', icon: Clock },
      { name: 'Profile', path: '/farmer/profile', icon: User },
    ],
  },
  fpo: {
    id: 'fpo',
    title: 'FPO Manager Hub',
    shortName: 'FPO',
    tagline: 'Member harvest aggregation & bulk trade',
    basePath: '/fpo',
    accentColor: '#FF9800',
    primaryActionLabel: 'Pool New Lot',
    palette: {
      primary: '#E65100',
      background: '#FFF7F0',
      surface: '#FFFFFF',
      raised: '#FFF3E0',
      accent: '#FF9800',
      darkText: '#2B211B',
      mutedText: '#6F625A',
      border: '#FFCC80',
    },
    navItems: [
      { name: 'Dashboard', path: '/fpo', icon: Home },
      { name: 'Members', path: '/fpo/members', icon: Users },
      { name: 'Lots', path: '/fpo/lots', icon: Layers },
      { name: 'Demand', path: '/fpo/demand', icon: Building2 },
      { name: 'Offers', path: '/fpo/offers', icon: Coins },
      { name: 'Transactions', path: '/fpo/transactions', icon: CheckCircle },
      { name: 'Analytics', path: '/fpo/analytics', icon: BarChart3 },
    ],
  },
  buyer: {
    id: 'buyer',
    title: 'Buyer Procurement Portal',
    shortName: 'Buyer',
    tagline: 'Source verified-quality commodities at scale',
    basePath: '/buyer',
    accentColor: '#64B5F6',
    primaryActionLabel: 'Post Demand RFQ',
    palette: {
      primary: '#1565C0',
      background: '#F3F8FE',
      surface: '#FFFFFF',
      raised: '#E3F2FD',
      accent: '#64B5F6',
      darkText: '#172033',
      mutedText: '#5C6B7A',
      border: '#BBDEFB',
    },
    navItems: [
      { name: 'Dashboard', path: '/buyer', icon: Home },
      { name: 'Demand', path: '/buyer/demand', icon: Building2 },
      { name: 'Available Lots', path: '/buyer/lots', icon: Package },
      { name: 'Matches', path: '/buyer/matches', icon: Search },
      { name: 'Offers', path: '/buyer/offers', icon: Coins },
      { name: 'Transactions', path: '/buyer/transactions', icon: CheckCircle },
      { name: 'Logistics', path: '/buyer/logistics', icon: Truck },
      { name: 'Disputes', path: '/buyer/disputes', icon: AlertTriangle },
    ],
  },
  'field-agent': {
    id: 'field-agent',
    title: 'Field Agent Terminal',
    shortName: 'Agent',
    tagline: 'Assisted grading, farmer KYC & field assistance',
    basePath: '/field-agent',
    accentColor: '#EF5350',
    primaryActionLabel: 'New Inspection',
    palette: {
      primary: '#C62828',
      background: '#FFF5F5',
      surface: '#FFFFFF',
      raised: '#FFEBEE',
      accent: '#EF5350',
      darkText: '#2B1717',
      mutedText: '#6F5555',
      border: '#FFCDD2',
    },
    navItems: [
      { name: 'Dashboard', path: '/field-agent', icon: Home },
      { name: 'Farmers', path: '/field-agent/farmers', icon: Users },
      { name: 'Lot Assistance', path: '/field-agent/lots', icon: Package },
      { name: 'Tasks', path: '/field-agent/tasks', icon: CheckSquare },
      { name: 'Disputes', path: '/field-agent/disputes', icon: AlertTriangle },
      { name: 'Activity', path: '/field-agent/activity', icon: History },
    ],
  },
  admin: {
    id: 'admin',
    title: 'Admin & Governance Console',
    shortName: 'Admin',
    tagline: 'Platform oversight, buyer KYC & dispute audit',
    basePath: '/admin',
    accentColor: '#8D6E63',
    primaryActionLabel: 'Audit Action',
    palette: {
      primary: '#6D4C41',
      background: '#FAF7F5',
      surface: '#FFFFFF',
      raised: '#EFEBE9',
      accent: '#8D6E63',
      darkText: '#29211E',
      mutedText: '#665A55',
      border: '#D7CCC8',
    },
    navItems: [
      { name: 'Dashboard', path: '/admin', icon: Home },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Buyer Verification', path: '/admin/verification', icon: FileCheck },
      { name: 'Lots', path: '/admin/lots', icon: Layers },
      { name: 'Transactions', path: '/admin/transactions', icon: Scale },
      { name: 'Disputes', path: '/admin/disputes', icon: AlertTriangle },
      { name: 'Market Data', path: '/admin/market-data', icon: LineChart },
      { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
      { name: 'System Health', path: '/admin/system-health', icon: Activity },
    ],
  },
};
