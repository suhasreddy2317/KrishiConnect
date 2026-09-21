import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileStack } from '@/components/layout/MobileStack';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/status/StatusBadge';
import { DataFreshness } from '@/components/status/DataFreshness';
import { LoadingState } from '@/components/data-display/LoadingState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { User, Phone, Mail, MapPin, Building2, Calendar, ShieldCheck } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { UserRole } from '@/config/navigation';

interface BackendFarmer {
  id: number;
  name: string;
  phone: string;
  village: string | null;
  district: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  user_id: number | null;
}

interface BackendBuyer {
  id: number;
  business_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  business_type: string | null;
  location: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  farmer: 'Farmer',
  fpo_manager: 'FPO Manager',
  buyer: 'Buyer',
  field_agent: 'Field Agent',
  admin: 'Admin',
};

const ROLE_BADGE_STATUS: Record<string, 'active' | 'kyc-verified' | 'verified-buyer' | 'suspended'> = {
  farmer: 'active',
  fpo_manager: 'kyc-verified',
  buyer: 'verified-buyer',
  field_agent: 'active',
  admin: 'active',
};

const BACKEND_TO_FRONTEND_ROLE: Record<string, UserRole> = {
  farmer: 'farmer',
  fpo_manager: 'fpo',
  buyer: 'buyer',
  field_agent: 'field-agent',
  admin: 'admin',
};

export const ProfilePage: React.FC = () => {
  const { user, token } = useAuth();
  const [farmerProfile, setFarmerProfile] = useState<BackendFarmer | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<BackendBuyer | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const frontendRole = user ? (BACKEND_TO_FRONTEND_ROLE[user.role] || 'farmer') : 'farmer';
  const roleLabel = user ? (ROLE_LABELS[user.role] || user.role) : 'User';
  const badgeStatus = user ? (ROLE_BADGE_STATUS[user.role] || 'active') : 'active';
  const profilePath = `/${frontendRole}/profile`;

  useEffect(() => {
    if (!token || !user) return;
    setProfileLoading(true);
    setProfileError(null);

    const fetchProfile = async () => {
      try {
        if (user.role === 'farmer') {
          try {
            const data = await apiRequest<BackendFarmer[]>('/farmers/', { method: 'GET' }, token);
            const myFarmer = data.find(f => f.user_id === user.id) || data[0];
            if (myFarmer) setFarmerProfile(myFarmer);
          } catch {
            // farmers endpoint may not return personal profile; use demo fallback
          }
        } else if (user.role === 'buyer') {
          try {
            const data = await apiRequest<BackendBuyer>('/buyers/me', { method: 'GET' }, token);
            setBuyerProfile(data);
          } catch {
            // use demo fallback
          }
        }
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [token, user]);

  if (!user) return null;

  const getField = (value: string | null | undefined, fallback: string) => value || fallback;

  const farmerFields = farmerProfile ? [
    { label: 'Village', value: getField(farmerProfile.village, 'Not set'), icon: MapPin },
    { label: 'District', value: getField(farmerProfile.district, 'Not set'), icon: MapPin },
    { label: 'State', value: getField(farmerProfile.state, 'Not set'), icon: MapPin },
  ] : [
    { label: 'Village', value: 'Nashik', icon: MapPin },
    { label: 'District', value: 'Nashik', icon: MapPin },
    { label: 'State', value: 'Maharashtra', icon: MapPin },
  ];

  const buyerFields = buyerProfile ? [
    { label: 'Business', value: buyerProfile.business_name, icon: Building2 },
    { label: 'Contact Person', value: buyerProfile.contact_person || 'Not set', icon: User },
    { label: 'Business Type', value: buyerProfile.business_type || 'Not set', icon: Building2 },
    { label: 'Location', value: buyerProfile.location || 'Not set', icon: MapPin },
    { label: 'Status', value: buyerProfile.status, icon: ShieldCheck },
  ] : [
    { label: 'Business', value: 'Agro Procurement Co.', icon: Building2 },
    { label: 'Contact Person', value: user.name, icon: User },
    { label: 'Business Type', value: 'Processor', icon: Building2 },
    { label: 'Location', value: 'Nashik', icon: MapPin },
    { label: 'Status', value: 'verified', icon: ShieldCheck },
  ];

  const fpoFields = [
    { label: 'Organization', value: 'Krishi Mitra FPO', icon: Building2 },
    { label: 'Registration', value: 'MH-FPO-0001', icon: ShieldCheck },
    { label: 'District', value: 'Nashik', icon: MapPin },
    { label: 'State', value: 'Maharashtra', icon: MapPin },
    { label: 'Collection Center', value: 'Nashik APMC', icon: MapPin },
  ];

  const agentFields = [
    { label: 'Assigned Region', value: 'North Maharashtra', icon: MapPin },
    { label: 'District Coverage', value: 'Nashik, Dhule, Jalgaon', icon: MapPin },
    { label: 'Assigned Farmers', value: '12 active', icon: User },
    { label: 'Join Date', value: 'Jan 2026', icon: Calendar },
  ];

  const adminFields = [
    { label: 'Access Level', value: 'Full Platform Admin', icon: ShieldCheck },
    { label: 'Managed Regions', value: 'All Maharashtra', icon: MapPin },
    { label: 'Admin Since', value: 'Jan 2026', icon: Calendar },
  ];

  let detailFields;
  if (user.role === 'farmer') detailFields = farmerFields;
  else if (user.role === 'buyer') detailFields = buyerFields;
  else if (user.role === 'fpo_manager') detailFields = fpoFields;
  else if (user.role === 'field_agent') detailFields = agentFields;
  else detailFields = adminFields;

  return (
    <AppShell forcedRole={frontendRole} activeSubTab={profilePath}>
      <MobileStack spacing="md">
        <PageHeader
          title="Profile"
          subtitle={`${roleLabel} account details and settings`}
          roleBadge={<StatusBadge status={badgeStatus} label={roleLabel} size="sm" />}
          statusBadge={<DataFreshness timestamp="Account active" isLive />}
        />

        {profileLoading && (
          <Card variant="default" padding="md">
            <LoadingState message="Loading profile..." />
          </Card>
        )}

        {profileError && (
          <ErrorState title="Unable to load profile" message={profileError} onRetry={() => window.location.reload()} />
        )}

        {!profileLoading && !profileError && (
          <>
            <Card variant="raised" padding="md" className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-2xl font-bold text-accent">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-text-main">{user.name}</h2>
                  <div className="flex items-center space-x-2">
                    <Badge variant="lime" size="sm">{roleLabel}</Badge>
                    <StatusBadge status={badgeStatus} label={user.is_active ? 'Active' : 'Inactive'} size="sm" />
                  </div>
                </div>
              </div>
            </Card>

            <Section title="Contact Information" description="Your registered contact details on KrishiConnect.">
              <Card variant="default" padding="none">
                <div className="divide-y divide-border">
                  {[
                    { label: 'Full Name', value: user.name, icon: User },
                    { label: 'Phone Number', value: user.phone, icon: Phone },
                    { label: 'Email Address', value: user.email || 'Not provided', icon: Mail },
                    { label: 'Role', value: roleLabel, icon: ShieldCheck },
                    { label: 'Account Status', value: user.is_active ? 'Active' : 'Inactive', icon: ShieldCheck },
                  ].map((field, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-muted shrink-0">
                          <field.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-text-muted font-medium">{field.label}</span>
                      </div>
                      <span className="text-sm text-text-main font-medium text-right">{field.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>

            <Section title="Role Details" description={`${roleLabel}-specific information and preferences.`}>
              <Card variant="default" padding="none">
                <div className="divide-y divide-border">
                  {detailFields.map((field, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-muted shrink-0">
                          <field.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-text-muted font-medium">{field.label}</span>
                      </div>
                      <span className="text-sm text-text-main font-medium text-right">{field.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>

            <Card variant="default" padding="md" className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-text-muted" />
                <h3 className="text-sm font-semibold text-text-main">Account Timeline</h3>
              </div>
              <div className="text-xs text-text-muted space-y-1">
                <p>Member since: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                <p>Last login: Today</p>
                <p>Platform: KrishiConnect Trust Ledger OS</p>
              </div>
            </Card>
          </>
        )}
      </MobileStack>
    </AppShell>
  );
};
