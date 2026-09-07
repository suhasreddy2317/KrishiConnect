import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileStack } from '@/components/layout/MobileStack';
import { Section } from '@/components/layout/Section';
import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/status/StatusBadge';
import { SyncStatus } from '@/components/status/SyncStatus';
import { DataFreshness } from '@/components/status/DataFreshness';
import { StatusSteps } from '@/components/status/StatusSteps';
import { AlertBanner } from '@/components/status/AlertBanner';
import { Timeline } from '@/components/status/Timeline';
import { MetricCard } from '@/components/data-display/MetricCard';
import { Table } from '@/components/data-display/Table';
import { ScoreBar } from '@/components/data-display/ScoreBar';
import { LoadingState } from '@/components/data-display/LoadingState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { Building2, Send, ShieldCheck, Activity, Search, FileText, AlertCircle, Truck, Wallet, Scale } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Demand {
  id: string;
  crop: string;
  quantity: string;
  grade: string;
  location: string;
  requiredBy: string;
  status: string;
  updated: string;
  hasNotes: boolean;
}

interface BackendDemand {
  id: number;
  commodity_id: number;
  required_quantity: number;
  unit: string;
  minimum_grade: string | null;
  delivery_location: string | null;
  required_by: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

interface BackendCommodity {
  id: number;
  name: string;
  variety: string | null;
  unit: string;
  is_perishable: boolean;
  perishability_profile: string | null;
  grading_parameters: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Lot {
  id: string;
  crop: string;
  grade: string;
  quantity: string;
  location: string;
  price: string;
  freshness: string;
  matchStatus: string;
}

interface BackendMatchResult {
  demand_id: number;
  buyer_id: number;
  lot_id: number;
  match_score: number;
  grade_compatibility: string;
  commodity_id: number;
  lot_grade: string;
  lot_quantity: number;
  lot_location: string | null;
  quantity_fit: number;
  location_fit: number;
  urgency: number;
  buyer_confidence: number;
  reasons: string[];
  limitations: string[];
}

interface BackendMatchList {
  items: BackendMatchResult[];
  total: number;
}

interface Offer {
  id: string;
  lotId: string;
  crop: string;
  price: string;
  quantity: string;
  status: string;
  expiry: string;
  updated: string;
  round: number;
  parentOfferId: number | null;
  backendId: number;
}

interface BackendBuyer {
  id: number;
  user_id: number;
  business_name: string;
  status: string;
}

interface BackendConfidenceFactor {
  name: string;
  contribution: number;
  weight: number;
  detail: string;
}

interface BackendBuyerConfidence {
  buyer_id: number;
  business_name: string;
  status: string;
  score: number;
  confidence_level: string;
  factors: BackendConfidenceFactor[];
  top_reasons: string[];
  limitations: string[];
  generated_at: string;
}

interface BackendDemandSignal {
  commodity_id: number;
  score: number;
  demand_quantity: number;
  num_demands: number;
  num_buyers: number;
  urgency: number;
  reasons: string[];
  freshness: string;
  limitations: string[];
  generated_at: string;
  location_filter: string | null;
}

interface BackendDemandRadar {
  signals: BackendDemandSignal[];
  total: number;
}

interface BackendOfferResponse {
  id: number;
  demand_id: number;
  lot_id: number;
  buyer_id: number;
  farmer_id: number;
  quantity: number;
  offered_price: number;
  pickup_window: string;
  payment_terms: string;
  message: string | null;
  status: string;
  parent_offer_id: number | null;
  round: number;
  expires_at: string;
  created_at: string;
  updated_at: string | null;
}

interface BackendOfferList {
  items: BackendOfferResponse[];
  total: number;
}

interface BackendOfferHistoryEntry {
  id: number;
  offer_id: number;
  actor_user_id: number;
  action: string;
  from_status: string | null;
  to_status: string | null;
  quantity: number | null;
  offered_price: number | null;
  pickup_window: string | null;
  payment_terms: string | null;
  message: string | null;
  reason: string | null;
  created_at: string;
}

interface BackendOfferHistoryResponse {
  items: BackendOfferHistoryEntry[];
  total: number;
}

interface BackendLotResponse {
  id: number;
  farmer_id: number;
  crop: string;
  commodity_id: number | null;
  quantity_kg: number;
  unit: string;
  quality_grade: string;
  moisture_percent: number | null;
  harvest_date: string | null;
  location: string | null;
  expected_price_per_kg: number | null;
  status: string;
}

interface BackendTransaction {
  id: number;
  offer_id: number;
  lot_id: number;
  buyer_id: number;
  farmer_id: number;
  quantity: number;
  agreed_price: number;
  total_amount: number;
  status: string;
  confirmed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
}

interface BackendShipment {
  id: number;
  transaction_id: number;
  pickup_location: string;
  delivery_location: string;
  transporter_name: string | null;
  vehicle_number: string | null;
  estimated_pickup: string | null;
  estimated_delivery: string | null;
  actual_pickup: string | null;
  actual_delivery: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
}

interface BackendPayment {
  id: number;
  transaction_id: number;
  amount: number;
  payment_method: string | null;
  status: string;
  reference: string | null;
  initiated_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string | null;
}

interface BackendDispute {
  id: number;
  transaction_id: number;
  opened_by_user_id: number;
  reason: string;
  description: string | null;
  priority: string;
  status: string;
  resolution_notes: string | null;
  resolved_by_user_id: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string | null;
}

interface BackendDisputeEvidence {
  id: number;
  dispute_id: number;
  uploaded_by_user_id: number;
  evidence_type: string;
  file_name: string;
  file_path: string | null;
  description: string | null;
  created_at: string;
}

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatExpiry = (expiresAt: string | null, status: string): string => {
  if (!expiresAt || status === 'accepted' || status === 'rejected' || status === 'expired') return '—';
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return 'Expired';
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);
  if (diffHrs >= 24) return `${Math.floor(diffHrs / 24)}d`;
  if (diffHrs >= 1) return `${diffHrs}h ${diffMins}m`;
  return `${diffMins}m`;
};

const mapBackendOffer = (backend: BackendOfferResponse, lotMap: Record<number, BackendLotResponse>): Offer => {
  const lot = lotMap[backend.lot_id];
  const crop = lot?.crop || `Lot #${backend.lot_id}`;
  const unit = lot?.unit || 'kg';
  return {
    id: `OFF-${backend.id}`,
    lotId: `Lot #${backend.lot_id}`,
    crop,
    price: `₹${backend.offered_price}/qtl`,
    quantity: `${backend.quantity} ${unit}`,
    status: backend.status,
    expiry: formatExpiry(backend.expires_at, backend.status),
    updated: formatRelativeTime(backend.updated_at || backend.created_at),
    round: backend.round,
    parentOfferId: backend.parent_offer_id,
    backendId: backend.id,
  };
};

export const BuyerPage: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('/buyer');

  const [buyerId, setBuyerId] = useState<number | null>(null);
  const [confidenceLoading, setConfidenceLoading] = useState(false);
  const [confidenceError, setConfidenceError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<BackendBuyerConfidence | null>(null);

  const [demandRadarLoading, setDemandRadarLoading] = useState(false);
  const [demandRadarError, setDemandRadarError] = useState<string | null>(null);
  const [demandRadar, setDemandRadar] = useState<BackendDemandRadar | null>(null);

  const [demands, setDemands] = useState<Demand[]>([]);
  const [demandsLoading, setDemandsLoading] = useState(false);
  const [demandsError, setDemandsError] = useState<string | null>(null);

  const [commodities, setCommodities] = useState<BackendCommodity[]>([]);

  const [isDemandDialogOpen, setIsDemandDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  const [formCommodityId, setFormCommodityId] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formUnit, setFormUnit] = useState('kg');
  const [formGrade, setFormGrade] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRequiredBy, setFormRequiredBy] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDemandId, setSelectedDemandId] = useState<number | null>(null);
  const [selectedDemandLabel, setSelectedDemandLabel] = useState('');
  const [matchedLotsLoading, setMatchedLotsLoading] = useState(false);
  const [matchedLotsError, setMatchedLotsError] = useState<string | null>(null);
  const [matchedLotsData, setMatchedLotsData] = useState<BackendMatchResult[]>([]);
  const [matchedLotsFreshness, setMatchedLotsFreshness] = useState<string | null>(null);

  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [selectedLotForOffer, setSelectedLotForOffer] = useState<BackendMatchResult | null>(null);
  const [offerFormQuantity, setOfferFormQuantity] = useState('');
  const [offerFormPrice, setOfferFormPrice] = useState('');
  const [offerFormPickupWindow, setOfferFormPickupWindow] = useState('');
  const [offerFormPaymentTerms, setOfferFormPaymentTerms] = useState('');
  const [offerFormMessage, setOfferFormMessage] = useState('');
  const [offerFormErrors, setOfferFormErrors] = useState<Record<string, string>>({});
  const [offerSubmitError, setOfferSubmitError] = useState<string | null>(null);

  const [isCounterDialogOpen, setIsCounterDialogOpen] = useState(false);
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<Offer | null>(null);
  const [selectedOfferForAction, setSelectedOfferForAction] = useState<Offer | null>(null);
  const [counterFormQuantity, setCounterFormQuantity] = useState('');
  const [counterFormPrice, setCounterFormPrice] = useState('');
  const [counterFormPickupWindow, setCounterFormPickupWindow] = useState('');
  const [counterFormPaymentTerms, setCounterFormPaymentTerms] = useState('');
  const [counterFormMessage, setCounterFormMessage] = useState('');
  const [counterFormErrors, setCounterFormErrors] = useState<Record<string, string>>({});
  const [isCounterSubmitting, setIsCounterSubmitting] = useState(false);
  const [counterSubmitError, setCounterSubmitError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'demand' | 'offer' | 'counter' | 'dispute' | 'evidence' | 'accept' | 'reject' | null>(null);

  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedOfferForHistory, setSelectedOfferForHistory] = useState<Offer | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<BackendOfferHistoryEntry[]>([]);

  const availableLots: Lot[] = [
    { id: 'LOT-8821', crop: 'Red Onion', grade: 'Grade A', quantity: '40 Q', location: 'Nashik, 18 km', price: '₹2,480/qtl', freshness: '12m ago', matchStatus: 'Strong Match' },
    { id: 'LOT-8820', crop: 'Tomato', grade: 'Grade A', quantity: '25 Q', location: 'Pune, 34 km', price: '₹2,100/qtl', freshness: '1h ago', matchStatus: 'Partial Match' },
    { id: 'LOT-8819', crop: 'Soybean', grade: 'Grade B', quantity: '60 Q', location: 'Solapur, 52 km', price: '₹4,100/qtl', freshness: '3h ago', matchStatus: 'Review' },
    { id: 'LOT-8818', crop: 'Wheat', grade: 'Grade A', quantity: '80 Q', location: 'Ahmednagar, 45 km', price: '₹2,250/qtl', freshness: '5h ago', matchStatus: 'Strong Match' },
  ];

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<BackendTransaction | null>(null);
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);

  const [shipments, setShipments] = useState<BackendShipment[]>([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [shipmentsError, setShipmentsError] = useState<string | null>(null);

  const [payments, setPayments] = useState<BackendPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  const [disputes, setDisputes] = useState<BackendDispute[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesError, setDisputesError] = useState<string | null>(null);

  const [selectedDispute, setSelectedDispute] = useState<BackendDispute | null>(null);
  const [isDisputeDetailOpen, setIsDisputeDetailOpen] = useState(false);
  const [disputeDetailLoading, setDisputeDetailLoading] = useState(false);
  const [disputeEvidence, setDisputeEvidence] = useState<BackendDisputeEvidence[]>([]);

  const [isCreateDisputeOpen, setIsCreateDisputeOpen] = useState(false);
  const [createDisputeTransactionId, setCreateDisputeTransactionId] = useState<number | null>(null);
  const [createDisputeReason, setCreateDisputeReason] = useState('');
  const [createDisputeDescription, setCreateDisputeDescription] = useState('');
  const [createDisputePriority, setCreateDisputePriority] = useState('medium');
  const [createDisputeErrors, setCreateDisputeErrors] = useState<Record<string, string>>({});

  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [evidenceDisputeId, setEvidenceDisputeId] = useState<number | null>(null);
  const [evidenceType, setEvidenceType] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [evidenceFilePath, setEvidenceFilePath] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceErrors, setEvidenceErrors] = useState<Record<string, string>>({});

  const pendingOffersCount = offers.filter((o) => o.status === 'submitted' || o.status === 'countered').length;

  const getCommodityName = (id: number): string => {
    const commodity = commodities.find(c => c.id === id);
    return commodity?.name || `Commodity #${id}`;
  };

  const mapBackendDemand = (backend: BackendDemand): Demand => ({
    id: `RFQ-${backend.id}`,
    crop: getCommodityName(backend.commodity_id),
    quantity: `${backend.required_quantity.toLocaleString()} ${backend.unit}`,
    grade: backend.minimum_grade || '—',
    location: backend.delivery_location || '—',
    requiredBy: formatDate(backend.required_by),
    status: backend.status.charAt(0).toUpperCase() + backend.status.slice(1),
    updated: formatRelativeTime(backend.updated_at || backend.created_at),
    hasNotes: !!backend.notes,
  });

  const fetchCommodities = async () => {
    if (!token) return;
    try {
      const data = await apiRequest<BackendCommodity[]>('/commodities/', { method: 'GET' }, token);
      setCommodities(data);
    } catch (err) {
      console.error('Failed to load commodities', err);
    }
  };

  const fetchDemands = async () => {
    if (!token) return;
    setDemandsLoading(true);
    setDemandsError(null);
    try {
      const data = await apiRequest<{ items: BackendDemand[]; total: number }>('/demands/', { method: 'GET' }, token);
      const mapped = data.items.map(mapBackendDemand);
      setDemands(mapped);
    } catch (err) {
      setDemandsError(err instanceof Error ? err.message : 'Failed to load demands');
    } finally {
      setDemandsLoading(false);
    }
  };

  const retryDemands = () => {
    fetchDemands();
  };

  const resetForm = () => {
    setFormCommodityId('');
    setFormQuantity('');
    setFormUnit('kg');
    setFormGrade('');
    setFormLocation('');
    setFormRequiredBy('');
    setFormNotes('');
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formCommodityId) errors.commodity = 'Commodity is required';
    if (!formQuantity || isNaN(Number(formQuantity)) || Number(formQuantity) <= 0) errors.quantity = 'Enter a valid quantity greater than 0';
    if (!formUnit.trim()) errors.unit = 'Unit is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDemandDialog = () => {
    resetForm();
    setIsDemandDialogOpen(true);
  };

  const handleCloseDemandDialog = () => {
    setIsDemandDialogOpen(false);
    resetForm();
  };

  const handleReviewSubmit = () => {
    if (!validateForm()) return;
    const commodityName = getCommodityName(Number(formCommodityId));
    setConfirmMessage(`Post RFQ for ${formQuantity} ${formUnit} of ${commodityName}?`);
    setPendingPayload({
      commodity_id: Number(formCommodityId),
      required_quantity: parseFloat(formQuantity),
      unit: formUnit || 'kg',
      minimum_grade: formGrade || null,
      delivery_location: formLocation || null,
      required_by: formRequiredBy || null,
      notes: formNotes || null,
    });
    setIsConfirmOpen(true);
  };

  const handleConfirmDemand = async () => {
    if (!token || !pendingPayload) return;
    setIsSubmitting(true);
    try {
      if (pendingAction === 'counter' && selectedOfferForCounter) {
        await handleConfirmCounter();
        return;
      }
      if (pendingAction === 'accept' && selectedOfferForAction) {
        await handleConfirmAccept();
        return;
      }
      if (pendingAction === 'reject' && selectedOfferForAction) {
        await handleConfirmReject();
        return;
      }
      if (pendingAction === 'dispute') {
        await apiRequest('/disputes/', {
          method: 'POST',
          body: JSON.stringify(pendingPayload),
        }, token);
        setIsCreateDisputeOpen(false);
        setIsConfirmOpen(false);
        setPendingPayload(null);
        setPendingAction(null);
        await fetchDisputes();
        await fetchTransactions();
        return;
      }
      if (pendingAction === 'evidence') {
        await apiRequest(`/disputes/${pendingPayload.dispute_id}/evidence`, {
          method: 'POST',
          body: JSON.stringify({
            evidence_type: pendingPayload.evidence_type,
            file_name: pendingPayload.file_name,
            file_path: pendingPayload.file_path,
            description: pendingPayload.description,
          }),
        }, token);
        setIsAddEvidenceOpen(false);
        setIsConfirmOpen(false);
        setPendingPayload(null);
        setPendingAction(null);
        if (selectedDispute && selectedDispute.id === pendingPayload.dispute_id) {
          await fetchDisputeEvidence(pendingPayload.dispute_id);
        }
        return;
      }
      if (selectedLotForOffer && selectedDemandId) {
        await apiRequest<BackendOfferResponse>('/offers/', {
          method: 'POST',
          body: JSON.stringify(pendingPayload),
        }, token);
        setIsOfferDialogOpen(false);
        resetOfferForm();
        fetchOffers();
      } else {
        await apiRequest<BackendDemand>('/demands/', {
          method: 'POST',
          body: JSON.stringify(pendingPayload),
        }, token);
        resetForm();
        setIsDemandDialogOpen(false);
        fetchDemands();
      }
      setIsConfirmOpen(false);
      setPendingPayload(null);
      setPendingAction(null);
    } catch (err) {
      if (selectedLotForOffer && selectedDemandId) {
        setOfferSubmitError(err instanceof Error ? err.message : 'Failed to create offer');
        setIsConfirmOpen(false);
        setPendingPayload(null);
        setPendingAction(null);
      } else if (pendingAction === 'dispute') {
        setDisputesError(err instanceof Error ? err.message : 'Failed to create dispute');
        setIsConfirmOpen(false);
        setPendingPayload(null);
        setPendingAction(null);
      } else if (pendingAction === 'evidence') {
        setDisputesError(err instanceof Error ? err.message : 'Failed to add evidence');
        setIsConfirmOpen(false);
        setPendingPayload(null);
        setPendingAction(null);
      } else {
        setFormErrors({ submit: err instanceof Error ? err.message : 'Failed to create demand' });
        setIsConfirmOpen(false);
        setPendingPayload(null);
        setPendingAction(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFactor = (name: string) => confidence?.factors.find(f => f.name === name);

  const kycStatusMap: Record<string, { status: import('@/components/status/StatusBadge').StatusType; label: string }> = {
    verified: { status: 'kyc-verified', label: 'Level 2 Verified' },
    pending_review: { status: 'warning', label: 'Pending Review' },
    unverified: { status: 'pending-verification', label: 'Unverified' },
    escalated: { status: 'warning', label: 'Escalated' },
    suspended: { status: 'completed', label: 'Suspended' },
  };

  const paymentFactor = getFactor('On-Time Payment');
  const ratingFactor = getFactor('Seller Rating');

  const retryConfidence = () => {
    if (token && buyerId) {
      setConfidenceLoading(true);
      setConfidenceError(null);
      apiRequest<BackendBuyerConfidence>(`/buyers/${buyerId}/confidence`, { method: 'GET' }, token)
        .then(setConfidence)
        .catch(err => setConfidenceError(err instanceof Error ? err.message : 'Failed to load confidence'))
        .finally(() => setConfidenceLoading(false));
    }
  };

  const retryDemandRadar = () => {
    if (token) {
      setDemandRadarLoading(true);
      setDemandRadarError(null);
      apiRequest<BackendDemandRadar>('/demand-radar/', { method: 'GET' }, token)
        .then(setDemandRadar)
        .catch(err => setDemandRadarError(err instanceof Error ? err.message : 'Failed to load demand radar'))
        .finally(() => setDemandRadarLoading(false));
    }
  };

  const fetchMatchedLots = async (demandId: number) => {
    if (!token) return;
    setMatchedLotsLoading(true);
    setMatchedLotsError(null);
    setMatchedLotsFreshness(null);
    try {
      const data = await apiRequest<BackendMatchList>(`/matches/demands/${demandId}`, { method: 'GET' }, token);
      setMatchedLotsData(data.items);
      setMatchedLotsFreshness(new Date().toISOString());
    } catch (err) {
      setMatchedLotsError(err instanceof Error ? err.message : 'Failed to load matched lots');
      setMatchedLotsData([]);
    } finally {
      setMatchedLotsLoading(false);
    }
  };

  const retryMatchedLots = () => {
    if (selectedDemandId) {
      fetchMatchedLots(selectedDemandId);
    }
  };

  const resetOfferForm = () => {
    setOfferFormQuantity('');
    setOfferFormPrice('');
    setOfferFormPickupWindow('');
    setOfferFormPaymentTerms('');
    setOfferFormMessage('');
    setOfferFormErrors({});
    setOfferSubmitError(null);
    setSelectedLotForOffer(null);
  };

  const validateOfferForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!offerFormQuantity || isNaN(Number(offerFormQuantity)) || Number(offerFormQuantity) <= 0) {
      errors.quantity = 'Enter a valid quantity greater than 0';
    }
    if (!offerFormPrice || isNaN(Number(offerFormPrice)) || Number(offerFormPrice) <= 0) {
      errors.price = 'Enter a valid price greater than 0';
    }
    if (!offerFormPickupWindow.trim()) {
      errors.pickup_window = 'Pickup window is required';
    }
    if (!offerFormPaymentTerms.trim()) {
      errors.payment_terms = 'Payment terms are required';
    }
    setOfferFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenOfferDialog = (match: BackendMatchResult) => {
    if (!selectedDemandId) return;
    resetOfferForm();
    setSelectedLotForOffer(match);
    setOfferFormQuantity(String(match.lot_quantity));
    setOfferFormPrice(String(Math.round(match.lot_quantity * 2.1)));
    setIsOfferDialogOpen(true);
  };

  const handleCloseOfferDialog = () => {
    setIsOfferDialogOpen(false);
    resetOfferForm();
  };

  const handleReviewOfferSubmit = () => {
    if (!validateOfferForm() || !selectedLotForOffer || !selectedDemandId) return;
    const cropName = getCommodityName(selectedLotForOffer.commodity_id);
    setConfirmMessage(`Submit offer for ${offerFormQuantity} kg of ${cropName} at ₹${Number(offerFormPrice).toLocaleString()}?`);
    setPendingPayload({
      demand_id: selectedDemandId,
      lot_id: selectedLotForOffer.lot_id,
      quantity: parseFloat(offerFormQuantity),
      offered_price: parseFloat(offerFormPrice),
      pickup_window: offerFormPickupWindow.trim(),
      payment_terms: offerFormPaymentTerms.trim(),
      message: offerFormMessage.trim() || null,
    });
    setIsConfirmOpen(true);
  };

  const fetchOffers = async () => {
    if (!token) return;
    setOffersLoading(true);
    setOffersError(null);
    try {
      const [lotsData, offersData] = await Promise.all([
        apiRequest<BackendLotResponse[]>('/lots/', { method: 'GET' }, token),
        apiRequest<BackendOfferList>('/offers/', { method: 'GET' }, token),
      ]);
      const lotMap: Record<number, BackendLotResponse> = {};
      lotsData.forEach((lot) => { lotMap[lot.id] = lot; });
      const mapped = offersData.items.map((o) => mapBackendOffer(o, lotMap));
      setOffers(mapped);
    } catch (err) {
      setOffersError(err instanceof Error ? err.message : 'Failed to load offers');
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  const retryOffers = () => {
    fetchOffers();
  };

  const fetchTransactions = async () => {
    if (!token) return;
    setTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const data = await apiRequest<{ items: BackendTransaction[]; total: number }>('/transactions/', { method: 'GET' }, token);
      setTransactions(data.items);
    } catch (err) {
      setTransactionsError(err instanceof Error ? err.message : 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchTransactionById = async (id: number) => {
    if (!token) return;
    try {
      const data = await apiRequest<BackendTransaction>(`/transactions/${id}`, { method: 'GET' }, token);
      setSelectedTransaction(data);
    } catch (err) {
      setTransactionsError(err instanceof Error ? err.message : 'Failed to load transaction details');
    }
  };

  const retryTransactions = () => {
    fetchTransactions();
  };

  const fetchShipments = async () => {
    if (!token) return;
    setShipmentsLoading(true);
    setShipmentsError(null);
    try {
      const data = await apiRequest<BackendShipment[]>('/shipments/', { method: 'GET' }, token);
      setShipments(data);
    } catch (err) {
      setShipmentsError(err instanceof Error ? err.message : 'Failed to load shipments');
      setShipments([]);
    } finally {
      setShipmentsLoading(false);
    }
  };

  const retryShipments = () => {
    fetchShipments();
  };

  const fetchPayments = async () => {
    if (!token) return;
    setPaymentsLoading(true);
    setPaymentsError(null);
    try {
      const data = await apiRequest<BackendPayment[]>('/payments/', { method: 'GET' }, token);
      setPayments(data);
    } catch (err) {
      setPaymentsError(err instanceof Error ? err.message : 'Failed to load payments');
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const retryPayments = () => {
    fetchPayments();
  };

  const fetchDisputes = async () => {
    if (!token) return;
    setDisputesLoading(true);
    setDisputesError(null);
    try {
      const data = await apiRequest<BackendDispute[]>('/disputes/', { method: 'GET' }, token);
      setDisputes(data);
    } catch (err) {
      setDisputesError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setDisputesLoading(false);
    }
  };

  const retryDisputes = () => {
    fetchDisputes();
  };

  const fetchDisputeDetail = async (disputeId: number) => {
    if (!token) return;
    setDisputeDetailLoading(true);
    try {
      const data = await apiRequest<BackendDispute>(`/disputes/${disputeId}`, { method: 'GET' }, token);
      setSelectedDispute(data);
    } catch (err) {
      setDisputesError(err instanceof Error ? err.message : 'Failed to load dispute details');
    } finally {
      setDisputeDetailLoading(false);
    }
  };

  const fetchDisputeEvidence = async (disputeId: number) => {
    if (!token) return;
    try {
      const data = await apiRequest<{ items: BackendDisputeEvidence[] }>(`/disputes/${disputeId}/evidence`, { method: 'GET' }, token);
      setDisputeEvidence(data.items);
    } catch (err) {
      console.error('Failed to load dispute evidence', err);
    }
  };

  const mapPaymentStatus = (status: string): 'active' | 'completed' | 'warning' | 'pending-verification' | 'dispute' => {
    const map: Record<string, 'active' | 'completed' | 'warning' | 'pending-verification' | 'dispute'> = {
      pending: 'pending-verification',
      initiated: 'active',
      processing: 'active',
      completed: 'completed',
      failed: 'dispute',
      cancelled: 'warning',
    };
    return map[status] || 'active';
  };

  const handleTransactionClick = async (tx: BackendTransaction) => {
    setSelectedTransaction(tx);
    setIsTransactionDetailOpen(true);
    await fetchTransactionById(tx.id);
  };

  const handleCloseTransactionDetail = () => {
    setIsTransactionDetailOpen(false);
    setSelectedTransaction(null);
  };

  const handleOpenDisputeDetail = async (dispute: BackendDispute) => {
    setSelectedDispute(dispute);
    setIsDisputeDetailOpen(true);
    await fetchDisputeDetail(dispute.id);
    await fetchDisputeEvidence(dispute.id);
  };

  const handleCloseDisputeDetail = () => {
    setIsDisputeDetailOpen(false);
    setSelectedDispute(null);
    setDisputeEvidence([]);
  };

  const handleOpenCreateDispute = (transactionId?: number) => {
    setCreateDisputeTransactionId(transactionId ?? null);
    setCreateDisputeReason('');
    setCreateDisputeDescription('');
    setCreateDisputePriority('medium');
    setCreateDisputeErrors({});
    setIsCreateDisputeOpen(true);
  };

  const handleCloseCreateDispute = () => {
    setIsCreateDisputeOpen(false);
    setCreateDisputeTransactionId(null);
  };

  const validateCreateDisputeForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (createDisputeTransactionId === null) errors.transaction = 'Transaction ID is required';
    if (!createDisputeReason.trim()) errors.reason = 'Reason is required';
    setCreateDisputeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewCreateDispute = () => {
    if (!validateCreateDisputeForm() || createDisputeTransactionId === null) return;
    setConfirmMessage(`Open dispute for transaction #${createDisputeTransactionId}?`);
    setPendingPayload({
      transaction_id: createDisputeTransactionId,
      reason: createDisputeReason.trim(),
      description: createDisputeDescription.trim() || null,
      priority: createDisputePriority,
    });
    setPendingAction('dispute');
    setIsConfirmOpen(true);
  };

  const handleOpenAddEvidence = (disputeId: number) => {
    setEvidenceDisputeId(disputeId);
    setEvidenceType('');
    setEvidenceFileName('');
    setEvidenceFilePath('');
    setEvidenceDescription('');
    setEvidenceErrors({});
    setIsAddEvidenceOpen(true);
  };

  const handleCloseAddEvidence = () => {
    setIsAddEvidenceOpen(false);
    setEvidenceDisputeId(null);
  };

  const validateEvidenceForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!evidenceType.trim()) errors.evidence_type = 'Evidence type is required';
    if (!evidenceFileName.trim()) errors.file_name = 'File name is required';
    setEvidenceErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewAddEvidence = () => {
    if (!validateEvidenceForm() || !evidenceDisputeId) return;
    setConfirmMessage(`Add evidence to dispute #${evidenceDisputeId}?`);
    setPendingPayload({
      dispute_id: evidenceDisputeId,
      evidence_type: evidenceType.trim(),
      file_name: evidenceFileName.trim(),
      file_path: evidenceFilePath.trim() || null,
      description: evidenceDescription.trim() || null,
    });
    setPendingAction('evidence');
    setIsConfirmOpen(true);
  };

  const handleUpdateDisputeStatus = async (disputeId: number, nextStatus: string) => {
    if (!token) return;
    try {
      await apiRequest(`/disputes/${disputeId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      }, token);
      await fetchDisputeDetail(disputeId);
      await fetchDisputes();
    } catch (err) {
      setDisputesError(err instanceof Error ? err.message : 'Failed to update dispute');
    }
  };

  const mapBackendTransactionToSteps = (tx: BackendTransaction) => {
    const statusOrder = ['accepted', 'confirmed', 'dispatched', 'in_transit', 'delivered', 'payment_pending', 'completed'];
    const currentIndex = statusOrder.indexOf(tx.status);

    const steps = [
      { id: '1', label: 'Offer Accepted', sublabel: `Lot #${tx.lot_id}`, status: currentIndex >= 0 ? 'complete' as const : 'pending' as const },
      { id: '2', label: 'Confirmed', sublabel: tx.confirmed_at ? formatDate(tx.confirmed_at) : '—', status: currentIndex >= 1 ? 'complete' as const : 'pending' as const },
      { id: '3', label: 'Dispatched', sublabel: '—', status: currentIndex >= 2 ? 'complete' as const : 'pending' as const },
      { id: '4', label: 'Delivered', sublabel: '—', status: currentIndex >= 4 ? 'complete' as const : 'pending' as const },
      { id: '5', label: 'Payment', sublabel: tx.completed_at ? formatDate(tx.completed_at) : '—', status: currentIndex >= 6 ? 'complete' as const : currentIndex >= 5 ? 'current' as const : 'pending' as const },
    ];

    if (tx.status === 'disputed') {
      steps.push({ id: '6', label: 'Disputed', sublabel: 'Under review', status: 'current' as const });
    }

    return steps;
  };

  const mapTransactionStatus = (status: string): 'active' | 'completed' | 'warning' | 'pending-verification' | 'dispute' => {
    const map: Record<string, 'active' | 'completed' | 'warning' | 'pending-verification' | 'dispute'> = {
      pending: 'pending-verification',
      accepted: 'active',
      confirmed: 'active',
      dispatched: 'active',
      in_transit: 'active',
      delivered: 'active',
      payment_pending: 'warning',
      completed: 'completed',
      disputed: 'dispute',
    };
    return map[status] || 'active';
  };

  const fetchOfferHistory = async (offerId: number) => {
    if (!token) return;
    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryData([]);
    try {
      const data = await apiRequest<BackendOfferHistoryResponse>(`/offers/${offerId}/history`, { method: 'GET' }, token);
      setHistoryData(data.items);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load offer history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistoryDialog = (offer: Offer) => {
    setSelectedOfferForHistory(offer);
    setIsHistoryDialogOpen(true);
    fetchOfferHistory(offer.backendId);
  };

  const handleCloseHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
    setSelectedOfferForHistory(null);
    setHistoryData([]);
    setHistoryError(null);
  };

  const retryHistory = () => {
    if (selectedOfferForHistory) {
      fetchOfferHistory(selectedOfferForHistory.backendId);
    }
  };

  const resetCounterForm = () => {
    setCounterFormQuantity('');
    setCounterFormPrice('');
    setCounterFormPickupWindow('');
    setCounterFormPaymentTerms('');
    setCounterFormMessage('');
    setCounterFormErrors({});
    setCounterSubmitError(null);
    setSelectedOfferForCounter(null);
  };

  const validateCounterForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!counterFormQuantity || isNaN(Number(counterFormQuantity)) || Number(counterFormQuantity) <= 0) {
      errors.quantity = 'Enter a valid quantity greater than 0';
    }
    if (!counterFormPrice || isNaN(Number(counterFormPrice)) || Number(counterFormPrice) <= 0) {
      errors.price = 'Enter a valid price greater than 0';
    }
    if (!counterFormPickupWindow.trim()) {
      errors.pickup_window = 'Pickup window is required';
    }
    if (!counterFormPaymentTerms.trim()) {
      errors.payment_terms = 'Payment terms are required';
    }
    setCounterFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCounterDialog = (offer: Offer) => {
    resetCounterForm();
    setSelectedOfferForCounter(offer);
    setCounterFormQuantity(offer.quantity.replace(/[^0-9.]/g, '') || '');
    setCounterFormPrice(offer.price.replace(/[^0-9.]/g, '') || '');
    setIsCounterDialogOpen(true);
  };

  const handleCloseCounterDialog = () => {
    setIsCounterDialogOpen(false);
    resetCounterForm();
  };

  const handleReviewCounterSubmit = () => {
    if (!validateCounterForm() || !selectedOfferForCounter) return;
    const cropName = selectedOfferForCounter.crop;
    setConfirmMessage(`Submit counter offer for ${counterFormQuantity} kg of ${cropName} at ₹${Number(counterFormPrice).toLocaleString()}?`);
    setPendingPayload({
      quantity: parseFloat(counterFormQuantity),
      offered_price: parseFloat(counterFormPrice),
      pickup_window: counterFormPickupWindow.trim(),
      payment_terms: counterFormPaymentTerms.trim(),
      message: counterFormMessage.trim() || null,
    });
    setPendingAction('counter');
    setIsConfirmOpen(true);
  };

  const handleConfirmCounter = async () => {
    if (!token || !pendingPayload || !selectedOfferForCounter) return;
    setIsCounterSubmitting(true);
    setCounterSubmitError(null);
    try {
      await apiRequest<BackendOfferResponse>(`/offers/${selectedOfferForCounter.backendId}/counter`, {
        method: 'POST',
        body: JSON.stringify(pendingPayload),
      }, token);
      setIsCounterDialogOpen(false);
      setIsConfirmOpen(false);
      setPendingPayload(null);
      setPendingAction(null);
      resetCounterForm();
      fetchOffers();
    } catch (err) {
      setCounterSubmitError(err instanceof Error ? err.message : 'Failed to submit counter offer');
      setIsConfirmOpen(false);
      setPendingPayload(null);
      setPendingAction(null);
    } finally {
      setIsCounterSubmitting(false);
    }
  };

  const handleOpenAcceptDialog = (offer: Offer) => {
    setSelectedOfferForAction(offer);
    setConfirmMessage(`Accept offer ${offer.id} at ${offer.price} for ${offer.quantity}?`);
    setPendingPayload({});
    setPendingAction('accept');
    setIsConfirmOpen(true);
  };

  const handleOpenRejectDialog = (offer: Offer) => {
    setSelectedOfferForAction(offer);
    setConfirmMessage(`Reject offer ${offer.id}?`);
    setPendingPayload({});
    setPendingAction('reject');
    setIsConfirmOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!token || !selectedOfferForAction) return;
    setIsSubmitting(true);
    try {
      await apiRequest<BackendOfferResponse>(`/offers/${selectedOfferForAction.backendId}/accept`, {
        method: 'POST',
      }, token);
      setIsConfirmOpen(false);
      setSelectedOfferForAction(null);
      setPendingPayload(null);
      setPendingAction(null);
      fetchOffers();
    } catch (err) {
      setOffersError(err instanceof Error ? err.message : 'Failed to accept offer');
      setIsConfirmOpen(false);
      setSelectedOfferForAction(null);
      setPendingPayload(null);
      setPendingAction(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!token || !selectedOfferForAction) return;
    setIsSubmitting(true);
    try {
      await apiRequest<BackendOfferResponse>(`/offers/${selectedOfferForAction.backendId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: null }),
      }, token);
      setIsConfirmOpen(false);
      setSelectedOfferForAction(null);
      setPendingPayload(null);
      setPendingAction(null);
      fetchOffers();
    } catch (err) {
      setOffersError(err instanceof Error ? err.message : 'Failed to reject offer');
      setIsConfirmOpen(false);
      setSelectedOfferForAction(null);
      setPendingPayload(null);
      setPendingAction(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemandClick = (demand: Demand) => {
    const demandId = parseInt(demand.id.replace('RFQ-', ''), 10);
    setSelectedDemandId(demandId);
    setSelectedDemandLabel(demand.crop);
    fetchMatchedLots(demandId);
  };

  useEffect(() => {
    if (!token) return;

    const fetchBuyerProfile = async () => {
      try {
        const buyer = await apiRequest<BackendBuyer>('/buyers/me', { method: 'GET' }, token);
        setBuyerId(buyer.id);
      } catch (err) {
        setConfidenceError(err instanceof Error ? err.message : 'Failed to load buyer profile');
      }
    };

    fetchBuyerProfile();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchCommodities();
  }, [token]);

  useEffect(() => {
    if (!token || !buyerId) return;

    const fetchConfidence = async () => {
      setConfidenceLoading(true);
      setConfidenceError(null);
      try {
        const data = await apiRequest<BackendBuyerConfidence>(`/buyers/${buyerId}/confidence`, { method: 'GET' }, token);
        setConfidence(data);
      } catch (err) {
        setConfidenceError(err instanceof Error ? err.message : 'Failed to load confidence');
      } finally {
        setConfidenceLoading(false);
      }
    };

    fetchConfidence();
  }, [token, buyerId]);

  useEffect(() => {
    if (!token) return;

    const fetchDemandRadar = async () => {
      setDemandRadarLoading(true);
      setDemandRadarError(null);
      try {
        const data = await apiRequest<BackendDemandRadar>('/demand-radar/', { method: 'GET' }, token);
        setDemandRadar(data);
      } catch (err) {
        setDemandRadarError(err instanceof Error ? err.message : 'Failed to load demand radar');
      } finally {
        setDemandRadarLoading(false);
      }
    };

    fetchDemandRadar();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchDemands();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchOffers();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchTransactions();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchShipments();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchPayments();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchDisputes();
  }, [token]);

  const demandColumns = [
    { key: 'id', header: 'RFQ ID', align: 'left' as const },
    { key: 'crop', header: 'Commodity', align: 'left' as const },
    { key: 'quantity', header: 'Qty + Unit', align: 'right' as const, isNumeric: true },
    { key: 'grade', header: 'Grade', align: 'center' as const },
    { key: 'location', header: 'Delivery Location', align: 'left' as const },
    { key: 'requiredBy', header: 'Required By', align: 'left' as const },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: Demand) => {
      const statusMap: Record<string, 'active' | 'completed' | 'warning'> = {
        active: 'active',
        fulfilled: 'completed',
        expired: 'warning',
        cancelled: 'completed',
      };
      return <StatusBadge status={statusMap[item.status.toLowerCase()] || 'active'} label={item.status} size="sm" />;
    }},
    { key: 'notes', header: 'Notes', align: 'center' as const, render: (item: Demand) => item.hasNotes ? <span title="Has notes"><FileText className="w-4 h-4 text-status-warning" /></span> : null },
    { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: Demand) => <DataFreshness timestamp={item.updated} /> },
  ];

  const lotColumns = [
    { key: 'id', header: 'Lot ID', align: 'left' as const },
    { key: 'crop', header: 'Crop', align: 'left' as const },
    { key: 'grade', header: 'Grade', align: 'center' as const },
    { key: 'quantity', header: 'Qty', align: 'right' as const, isNumeric: true },
    { key: 'location', header: 'Location', align: 'left' as const },
    { key: 'price', header: 'Price', align: 'right' as const, isNumeric: true },
    { key: 'freshness', header: 'Freshness', align: 'left' as const, render: (item: Lot) => <DataFreshness timestamp={item.freshness} /> },
    { key: 'matchStatus', header: 'Match', align: 'center' as const, render: (item: Lot) => (
      <StatusBadge status={item.matchStatus === 'Strong Match' ? 'trusted' : item.matchStatus === 'Partial Match' ? 'warning' : 'pending-verification'} label={item.matchStatus} size="sm" />
    )},
  ];

  const offerColumns = [
    { key: 'id', header: 'Offer ID', align: 'left' as const },
    { key: 'lotId', header: 'Lot', align: 'left' as const },
    { key: 'crop', header: 'Crop', align: 'left' as const },
    { key: 'price', header: 'Price', align: 'right' as const, isNumeric: true },
    { key: 'quantity', header: 'Qty', align: 'center' as const },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: Offer) => {
      const map: Record<string, 'active' | 'completed' | 'warning' | 'pending-verification'> = {
        submitted: 'pending-verification',
        pending: 'pending-verification',
        countered: 'warning',
        accepted: 'active',
        rejected: 'completed',
        expired: 'completed',
      };
      return (
        <div className="flex items-center justify-center gap-1">
          <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />
          {item.status === 'countered' && (
            <Badge variant="warning" size="sm">Counter</Badge>
          )}
        </div>
      );
    }},
    { key: 'round', header: 'Round', align: 'center' as const, render: (item: Offer) => (
      <span className="text-xs font-mono text-text-main">#{item.round}</span>
    )},
    { key: 'expiry', header: 'Expiry', align: 'center' as const },
    { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: Offer) => <DataFreshness timestamp={item.updated} /> },
    { key: 'actions', header: 'Actions', align: 'center' as const, render: (item: Offer) => {
      const hasChild = offers.some((o) => o.parentOfferId === item.backendId);
      const isCurrent = !hasChild;
      const isBuyersTurn = item.round % 2 === 0;
      const isTerminal = item.status === 'accepted' || item.status === 'rejected' || item.status === 'expired';
      const canAct = isCurrent && isBuyersTurn && !isTerminal;
      return (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleOpenHistoryDialog(item); }}>
            History
          </Button>
          {canAct ? (
            <>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenAcceptDialog(item); }}>
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenCounterDialog(item); }}>
                Counter
              </Button>
              <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleOpenRejectDialog(item); }}>
                Reject
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" disabled onClick={(e) => { e.stopPropagation(); handleOpenCounterDialog(item); }}>
              Counter
            </Button>
          )}
        </div>
      );
    }},
  ];

  const transactionColumns = [
    { key: 'id', header: 'Transaction ID', align: 'left' as const, render: (item: BackendTransaction) => (
      <span className="text-xs font-mono text-text-main">TXN-{item.id}</span>
    )},
    { key: 'lot_id', header: 'Lot', align: 'left' as const, render: (item: BackendTransaction) => (
      <span className="text-xs text-text-muted">Lot #{item.lot_id}</span>
    )},
    { key: 'quantity', header: 'Quantity', align: 'right' as const, isNumeric: true, render: (item: BackendTransaction) => (
      <span className="text-xs font-mono text-text-main">{item.quantity.toLocaleString()} kg</span>
    )},
    { key: 'agreed_price', header: 'Agreed Price', align: 'right' as const, isNumeric: true, render: (item: BackendTransaction) => (
      <span className="text-xs font-mono text-accent">₹{item.agreed_price}/qtl</span>
    )},
    { key: 'total_amount', header: 'Total', align: 'right' as const, isNumeric: true, render: (item: BackendTransaction) => (
      <span className="text-xs font-mono text-text-main">₹{item.total_amount.toLocaleString('en-IN')}</span>
    )},
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendTransaction) => (
      <StatusBadge status={mapTransactionStatus(item.status)} label={item.status} size="sm" />
    )},
    { key: 'created_at', header: 'Created', align: 'left' as const, render: (item: BackendTransaction) => (
      <DataFreshness timestamp={formatRelativeTime(item.created_at)} />
    )},
  ];

  const shipmentColumns = [
    { key: 'id', header: 'Shipment ID', align: 'left' as const, render: (item: BackendShipment) => (
      <span className="text-xs font-mono text-text-main">SHP-{item.id}</span>
    )},
    { key: 'transaction_id', header: 'Transaction', align: 'left' as const, render: (item: BackendShipment) => (
      <span className="text-xs text-text-muted">TXN-{item.transaction_id}</span>
    )},
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendShipment) => (
      <StatusBadge status={item.status === 'delivered' ? 'completed' : item.status === 'pending' ? 'pending-verification' : 'active'} label={item.status} size="sm" />
    )},
    { key: 'pickup_location', header: 'Pickup', align: 'left' as const },
    { key: 'delivery_location', header: 'Destination', align: 'left' as const },
    { key: 'transporter_name', header: 'Carrier', align: 'left' as const, render: (item: BackendShipment) => (
      <span className="text-xs text-text-main">{item.transporter_name || '—'}</span>
    )},
    { key: 'vehicle_number', header: 'Vehicle / Ref', align: 'left' as const, render: (item: BackendShipment) => (
      <span className="text-xs text-text-muted">{item.vehicle_number || '—'}</span>
    )},
    { key: 'estimated_delivery', header: 'ETA', align: 'left' as const, render: (item: BackendShipment) => (
      <span className="text-xs text-text-main">{item.estimated_delivery ? new Date(item.estimated_delivery).toLocaleString() : '—'}</span>
    )},
    { key: 'created_at', header: 'Created', align: 'left' as const, render: (item: BackendShipment) => (
      <DataFreshness timestamp={formatRelativeTime(item.created_at)} />
    )},
  ];

  const paymentColumns = [
    { key: 'id', header: 'Payment ID', align: 'left' as const, render: (item: BackendPayment) => (
      <span className="text-xs font-mono text-text-main">PAY-{item.id}</span>
    )},
    { key: 'transaction_id', header: 'Transaction', align: 'left' as const, render: (item: BackendPayment) => (
      <span className="text-xs text-text-muted">TXN-{item.transaction_id}</span>
    )},
    { key: 'amount', header: 'Amount', align: 'right' as const, isNumeric: true, render: (item: BackendPayment) => (
      <span className="text-xs font-mono text-accent">₹{item.amount.toLocaleString('en-IN')}</span>
    )},
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendPayment) => (
      <StatusBadge status={mapPaymentStatus(item.status)} label={item.status} size="sm" />
    )},
    { key: 'reference', header: 'Reference', align: 'left' as const, render: (item: BackendPayment) => (
      <span className="text-xs text-text-main">{item.reference || '—'}</span>
    )},
    { key: 'created_at', header: 'Created', align: 'left' as const, render: (item: BackendPayment) => (
      <DataFreshness timestamp={formatRelativeTime(item.created_at)} />
    )},
  ];

  const disputeColumns = [
    { key: 'id', header: 'Dispute ID', align: 'left' as const, render: (item: BackendDispute) => (
      <span className="text-xs font-mono text-text-main">DSP-{item.id}</span>
    )},
    { key: 'transaction_id', header: 'Transaction', align: 'left' as const, render: (item: BackendDispute) => (
      <span className="text-xs text-text-muted">TXN-{item.transaction_id}</span>
    )},
    { key: 'reason', header: 'Reason', align: 'left' as const },
    { key: 'priority', header: 'Priority', align: 'center' as const, render: (item: BackendDispute) => (
      <span className="text-xs text-text-muted capitalize">{item.priority}</span>
    )},
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendDispute) => (
      <StatusBadge status="dispute" label={item.status} size="sm" />
    )},
    { key: 'created_at', header: 'Opened', align: 'left' as const, render: (item: BackendDispute) => (
      <DataFreshness timestamp={formatRelativeTime(item.created_at)} />
    )},
  ];

  return (
    <AppShell forcedRole="buyer" activeSubTab={activeTab} onSelectSubTab={setActiveTab}>
      <MobileStack spacing="md">
        <PageHeader
          title="Buyer Procurement"
          subtitle="Source verified-quality commodities at scale with trust-verified sellers and transparent pricing."
          roleBadge={<StatusBadge status="kyc-verified" label="Buyer KYC 2" size="sm" />}
          statusBadge={<SyncStatus state="Synced" lastSyncedTime="2m ago" />}
          primaryAction={
            <Button variant="primary" size="md" leftIcon={<Send className="w-4 h-4" />} onClick={handleOpenDemandDialog}>
              Post Demand RFQ
            </Button>
          }
        />

        <AlertBanner
          variant="info"
          title="Phase 1 Foundation"
          message="Buyer demand posting, lot matching, offer negotiation, and transaction business logic will be implemented in later phases. This dashboard shows the intended shell and static data model."
        />

        <DashboardGrid columns={4}>
          <MetricCard
            label="Active Demands"
            value={String(demands.length || 7)}
            unit="Open RFQs"
            change={{ value: '2 new today', isPositive: true }}
            timestamp="Updated 1m ago"
            icon={<Send className="w-4 h-4 text-accent" />}
          />
          <MetricCard
            label="Available Lots"
            value="24"
            unit="Listed"
            change={{ value: '5 new today', isPositive: true }}
            timestamp="Updated 3m ago"
            icon={<Building2 className="w-4 h-4 text-text-muted" />}
          />
          <MetricCard
            label="Matched Lots"
            value="5"
            unit="Strong Fit"
            change={{ value: '92% avg match', isPositive: true }}
            timestamp="Updated 5m ago"
            icon={<Search className="w-4 h-4 text-status-success" />}
          />
          <MetricCard
            label="Pending Offers"
            value={String(pendingOffersCount || 3)}
            unit="Awaiting Response"
            change={{ value: '1 countered', isPositive: false }}
            timestamp="Updated 12m ago"
            icon={<Activity className="w-4 h-4 text-status-warning" />}
          />
        </DashboardGrid>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section
              title="Active Procurement Demands"
              description="Open RFQs requiring verified-quality produce within defined timelines."
              action={
                <Button variant="ghost" size="sm" onClick={handleOpenDemandDialog} leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Post New RFQ
                </Button>
              }
            >
              {demandsLoading && <LoadingState message="Loading demands..." />}
              {demandsError && <ErrorState title="Unable to load demands" message={demandsError} onRetry={retryDemands} />}
              {!demandsLoading && !demandsError && demands.length === 0 && (
                <EmptyState
                  title="No active demands"
                  description="Post your first RFQ to start sourcing verified-quality produce."
                  actionLabel="Post Demand RFQ"
                  onAction={handleOpenDemandDialog}
                />
              )}
              {!demandsLoading && !demandsError && demands.length > 0 && (
                <Card variant="default" padding="none">
                  <Table
                    columns={demandColumns}
                    data={demands}
                    keyExtractor={(item) => item.id}
                    emptyMessage="No active demands"
                    onRowClick={handleDemandClick}
                  />
                </Card>
              )}
            </Section>

            <div className="space-y-6">
              <Card variant="raised" padding="md" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-status-success" />
                  <h3 className="text-sm font-semibold text-text-main">Buyer Confidence</h3>
                </div>
                {confidenceLoading && <LoadingState message="Loading confidence score..." />}
                {confidenceError && <ErrorState title="Unable to load confidence" message={confidenceError} onRetry={retryConfidence} />}
                {!confidenceLoading && !confidenceError && confidence && (
                  <>
                    <ScoreBar value={confidence.score} label="Overall Confidence" />
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">KYC Status</span>
                        {(() => {
                          const kyc = kycStatusMap[confidence.status] || { status: 'active' as const, label: confidence.status };
                          return <StatusBadge status={kyc.status} label={kyc.label} size="sm" />;
                        })()}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Payment History</span>
                        <span className="text-status-success font-medium">{paymentFactor ? `${paymentFactor.contribution.toFixed(0)}% On-Time` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Seller Rating</span>
                        <span className="text-text-main font-medium">{ratingFactor ? `${(ratingFactor.contribution / 20).toFixed(1)} / 5.0` : '—'}</span>
                      </div>
                    </div>
                  </>
                )}
                {!confidenceLoading && !confidenceError && !confidence && (
                  <EmptyState title="No confidence data" description="Confidence data will appear after verification is complete." />
                )}
              </Card>

              <Card variant="raised" padding="md" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-status-warning" />
                  <h3 className="text-sm font-semibold text-text-main">Demand Radar</h3>
                </div>
                {demandRadarLoading && <LoadingState message="Loading demand signals..." />}
                {demandRadarError && <ErrorState title="Unable to load demand radar" message={demandRadarError} onRetry={retryDemandRadar} />}
                {!demandRadarLoading && !demandRadarError && demandRadar && demandRadar.total === 0 && (
                  <EmptyState title="No active demand" description="There are no active demand signals at this time." />
                )}
                {!demandRadarLoading && !demandRadarError && demandRadar && demandRadar.signals.length > 0 && (
                  <div className="space-y-4">
                    {demandRadar.signals.map((signal) => (
                      <div key={signal.commodity_id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-text-main">Commodity #{signal.commodity_id}</span>
                          <span className="text-[10px] font-mono text-text-muted">{signal.num_demands} demand{signal.num_demands !== 1 ? 's' : ''}</span>
                        </div>
                        <ScoreBar value={signal.score} label="Demand Score" showValue={true} />
                        <div className="text-[10px] font-mono text-text-muted">
                          {signal.demand_quantity.toFixed(0)} kg • {signal.num_buyers} buyer{signal.num_buyers !== 1 ? 's' : ''} • {signal.urgency > 0 ? `${(signal.urgency * 100).toFixed(0)}% urgent` : 'No urgency'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <Section title="Matched Lots" description={selectedDemandLabel ? `Lots matching your ${selectedDemandLabel} demand` : 'Select a demand in the table above to view matched lots.'}>
            {matchedLotsLoading && <LoadingState message="Finding matched lots..." />}
            {matchedLotsError && <ErrorState title="Unable to load matches" message={matchedLotsError} onRetry={retryMatchedLots} />}
            {!matchedLotsLoading && !matchedLotsError && selectedDemandId && matchedLotsData.length === 0 && (
              <EmptyState title="No matching lots" description="No published lots currently match this demand's requirements." />
            )}
            {!matchedLotsLoading && !matchedLotsError && !selectedDemandId && (
              <EmptyState title="Select a demand" description="Click on any demand in the Active Procurement Demands table to see matched lots." />
            )}
            {!matchedLotsLoading && !matchedLotsError && matchedLotsData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedLotsData.map((match) => {
                  const cropName = getCommodityName(match.commodity_id);
                  const gradeStatus = match.grade_compatibility === 'exact' ? 'trusted' : match.grade_compatibility === 'compatible' ? 'warning' : 'completed';
                  const gradeLabel = match.grade_compatibility === 'exact' ? 'Exact Match' : match.grade_compatibility === 'compatible' ? 'Compatible' : 'Incompatible';

                  return (
                     <Card key={match.lot_id} variant="raised" padding="md" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="lime" size="sm">{cropName}</Badge>
                          <span className="text-xs font-mono text-text-muted">Lot #{match.lot_id}</span>
                        </div>
                        {matchedLotsFreshness && <DataFreshness timestamp={formatRelativeTime(matchedLotsFreshness)} />}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Grade</span>
                          <StatusBadge status={gradeStatus} label={gradeLabel} size="sm" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Lot Grade</span>
                          <span className="text-text-main font-mono">{match.lot_grade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Quantity</span>
                          <span className="text-text-main font-mono">{match.lot_quantity.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Location</span>
                          <span className="text-text-main">{match.lot_location || '—'}</span>
                        </div>
                      </div>

                       <div className="space-y-3 pt-1">
                         <ScoreBar value={match.match_score} label="Match Score" />
                         <div className="grid grid-cols-2 gap-3">
                           <ScoreBar value={match.quantity_fit} label="Qty Fit" />
                           <ScoreBar value={match.location_fit} label="Location Fit" />
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                           <ScoreBar value={match.urgency} label="Urgency" />
                           <ScoreBar value={match.buyer_confidence} label="Buyer Confidence" />
                         </div>
                       </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/60">
                        <div className="text-[10px] font-mono text-text-muted">
                          Match Score: <span className="text-text-main">{Math.round(match.match_score)}%</span>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenOfferDialog(match)}
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                        >
                          Make Offer
                        </Button>
                      </div>

                      {match.reasons.length > 0 && (
                         <div className="text-[10px] text-text-muted space-y-1.5 pt-2 border-t border-border/60">
                           <p className="font-medium text-text-main">Matching Reasons</p>
                           {match.reasons.map((reason, idx) => (
                             <p key={idx} className="leading-relaxed">• {reason}</p>
                           ))}
                         </div>
                       )}

                       {match.limitations.length > 0 && (
                         <div className="text-[10px] text-status-warning space-y-1.5">
                          {match.limitations.map((limitation, idx) => (
                            <p key={idx} className="leading-relaxed">⚠ {limitation}</p>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </Section>

          <Section
            title="Available Lots"
            description="Verified farmer and FPO lots available for immediate procurement."
            action={
              <Button variant="ghost" size="sm">Filter Lots</Button>
            }
          >
            <Card variant="default" padding="none">
              <Table
                columns={lotColumns}
                data={availableLots}
                keyExtractor={(item) => item.id}
                emptyMessage="No lots available"
              />
            </Card>
          </Section>

          <Section
            title="Active Offers"
            description="Structured offers with locking expiry and negotiation history."
            action={
              <Button variant="ghost" size="sm">Review All</Button>
            }
          >
               {offersLoading && <LoadingState message="Loading offers..." />}
               {offersError && <ErrorState title="Unable to load offers" message={offersError} onRetry={retryOffers} />}
               {!offersLoading && !offersError && offers.length === 0 && (
                 <EmptyState title="No active offers" description="Structured offers you've made against verified-quality lots will appear here." />
               )}
               {!offersLoading && !offersError && offers.length > 0 && (
                 <Card variant="default" padding="none">
                   <Table
                     columns={offerColumns}
                     data={offers}
                     keyExtractor={(item) => item.id}
                     emptyMessage="No active offers"
                   />
                 </Card>
               )}
          </Section>

          <Section
            title="Transactions"
            description="Accepted offers converted to tracked transactions with settlement status."
            action={
              <Button variant="ghost" size="sm" onClick={retryTransactions}>Refresh</Button>
            }
          >
               {transactionsLoading && <LoadingState message="Loading transactions..." />}
               {transactionsError && <ErrorState title="Unable to load transactions" message={transactionsError} onRetry={retryTransactions} />}
               {!transactionsLoading && !transactionsError && transactions.length === 0 && (
                 <EmptyState icon={<FileText className="w-6 h-6" />} title="No transactions" description="Accepted offers will appear here as transactions with full settlement tracking." />
               )}
               {!transactionsLoading && !transactionsError && transactions.length > 0 && (
                 <Card variant="default" padding="none">
                   <Table
                     columns={transactionColumns}
                     data={transactions}
                     keyExtractor={(item) => String(item.id)}
                     emptyMessage="No transactions"
                     onRowClick={(tx) => handleTransactionClick(tx as BackendTransaction)}
                   />
                 </Card>
               )}
          </Section>

          <Section
            title="Trust Ledger"
            description="Recent transactions with settlement status and verification steps."
            action={
              <Button variant="ghost" size="sm" onClick={retryTransactions}>Refresh</Button>
            }
          >
            {transactionsLoading && <LoadingState message="Loading transactions..." />}
            {transactionsError && <ErrorState title="Unable to load transactions" message={transactionsError} onRetry={retryTransactions} />}
            {!transactionsLoading && !transactionsError && transactions.length === 0 && (
              <EmptyState title="No transactions" description="Accepted offers will appear here with full settlement tracking." />
            )}
            {!transactionsLoading && !transactionsError && transactions.length > 0 && (
              <div className="space-y-4">
                {transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="p-3 rounded-lg bg-surface border border-border cursor-pointer hover:border-border transition-colors" onClick={() => handleTransactionClick(tx)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-text-main">TXN-{tx.id}</span>
                      <StatusBadge status={mapTransactionStatus(tx.status)} label={tx.status} size="sm" />
                    </div>
                    <div className="text-[10px] text-text-muted font-mono space-y-1">
                      <div>Lot #{tx.lot_id} • {tx.quantity.toLocaleString()} kg • ₹{tx.agreed_price}/qtl</div>
                      <div>Total: ₹{tx.total_amount.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="mt-2">
                      <StatusSteps steps={mapBackendTransactionToSteps(tx)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Shipments"
            description="Logistics tracking for confirmed transactions."
            action={
              <Button variant="ghost" size="sm" onClick={retryShipments}>Refresh</Button>
            }
          >
               {shipmentsLoading && <LoadingState message="Loading shipments..." />}
               {shipmentsError && <ErrorState title="Unable to load shipments" message={shipmentsError} onRetry={retryShipments} />}
               {!shipmentsLoading && !shipmentsError && shipments.length === 0 && (
                 <EmptyState icon={<Truck className="w-6 h-6" />} title="No shipments" description="Shipments are created after transaction confirmation and logistics assignment." />
               )}
               {!shipmentsLoading && !shipmentsError && shipments.length > 0 && (
                 <Card variant="default" padding="none">
                   <Table
                     columns={shipmentColumns}
                     data={shipments}
                     keyExtractor={(item) => String(item.id)}
                     emptyMessage="No shipments"
                   />
                 </Card>
                 )}
             </Section>

               <Section
                 title="Payments"
                 description="Buyer-authorized payments for completed transactions."
                 action={
                   <Button variant="ghost" size="sm" onClick={retryPayments}>Refresh</Button>
                 }
               >
                  {paymentsLoading && <LoadingState message="Loading payments..." />}
                  {paymentsError && <ErrorState title="Unable to load payments" message={paymentsError} onRetry={retryPayments} />}
                  {!paymentsLoading && !paymentsError && payments.length === 0 && (
                    <EmptyState icon={<Wallet className="w-6 h-6" />} title="No payments" description="Payments will appear here after delivery confirmation and payment initiation." />
                  )}
                  {!paymentsLoading && !paymentsError && payments.length > 0 && (
                    <Card variant="default" padding="none">
                      <Table
                        columns={paymentColumns}
                        data={payments}
                        keyExtractor={(item) => String(item.id)}
                        emptyMessage="No payments"
                      />
                    </Card>
                  )}
               </Section>

               <Section
                 title="Disputes"
                 description="Track and manage disputes for your transactions."
                 action={
                   <div className="flex items-center gap-2">
                     <Button variant="ghost" size="sm" onClick={retryDisputes}>Refresh</Button>
                     <Button variant="outline" size="sm" leftIcon={<Scale className="w-3.5 h-3.5" />} onClick={() => handleOpenCreateDispute()}>
                       New Dispute
                     </Button>
                   </div>
                 }
               >
                 {disputesLoading && <LoadingState message="Loading disputes..." />}
                 {disputesError && <ErrorState title="Unable to load disputes" message={disputesError} onRetry={retryDisputes} />}
                 {!disputesLoading && !disputesError && disputes.length === 0 && (
                   <EmptyState icon={<Scale className="w-6 h-6" />} title="No disputes" description="Disputes can be opened if delivery or quality does not match agreed terms." />
                 )}
                 {!disputesLoading && !disputesError && disputes.length > 0 && (
                   <Card variant="default" padding="none">
                     <Table
                       columns={disputeColumns}
                       data={disputes}
                       keyExtractor={(item) => String(item.id)}
                       emptyMessage="No disputes"
                       onRowClick={(dispute) => handleOpenDisputeDetail(dispute as BackendDispute)}
                     />
                   </Card>
                 )}
               </Section>
        </div>
      </MobileStack>

      <Dialog isOpen={isDemandDialogOpen} onClose={handleCloseDemandDialog} title="Post Demand / RFQ" description="Create a new procurement demand to source verified-quality produce." maxWidth="lg" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleCloseDemandDialog} disabled={isSubmitting}>Cancel</Button>
          <Button variant="primary" onClick={handleReviewSubmit} disabled={isSubmitting}>Review & Submit</Button>
        </div>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Commodity"
              helperText="Select the commodity you need"
              error={formErrors.commodity}
              options={[
                { value: '', label: 'Select commodity...', disabled: true },
                ...commodities.map(c => ({ value: String(c.id), label: c.name }))
              ]}
              value={formCommodityId}
              onChange={(e) => {
                setFormCommodityId(e.target.value);
                const selected = commodities.find(c => String(c.id) === e.target.value);
                if (selected) setFormUnit(selected.unit);
              }}
            />
            <Input
              label="Quantity"
              type="number"
              step="0.01"
              placeholder="e.g. 100"
              error={formErrors.quantity}
              value={formQuantity}
              onChange={(e) => setFormQuantity(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Unit"
              placeholder="e.g. kg, quintal, ton"
              error={formErrors.unit}
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
            />
            <Input
              label="Grade Requirement"
              placeholder="e.g. Grade A"
              error={formErrors.grade}
              value={formGrade}
              onChange={(e) => setFormGrade(e.target.value)}
            />
          </div>
          <Input
            label="Delivery Location"
            placeholder="e.g. Nashik APMC"
            error={formErrors.location}
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
          />
          <Input
            label="Required By"
            type="date"
            error={formErrors.requiredBy}
            value={formRequiredBy}
            onChange={(e) => setFormRequiredBy(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-main tracking-wide">Notes</label>
            <textarea
              className={cn(
                'w-full px-3 py-2 bg-surface text-text-main text-sm rounded-md border border-border hover:border-border focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent min-h-[80px]',
                formErrors.notes && 'border-status-error focus:border-status-error focus:ring-status-error'
              )}
              placeholder="Additional requirements or notes..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
            {formErrors.notes && (
              <p className="flex items-center space-x-1 text-xs text-status-error">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formErrors.notes}</span>
              </p>
            )}
          </div>
          {formErrors.submit && (
            <div className="rounded-md bg-status-error/10 border border-status-error/30 p-3 text-xs text-status-error">
              {formErrors.submit}
            </div>
          )}
        </div>
      </Dialog>

      <Dialog isOpen={isOfferDialogOpen} onClose={handleCloseOfferDialog} title="Make Offer" description={selectedLotForOffer ? `Offer for ${getCommodityName(selectedLotForOffer.commodity_id)} - Lot #${selectedLotForOffer.lot_id}` : 'Create a new offer for this matched lot.'} maxWidth="lg" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleCloseOfferDialog} disabled={isSubmitting}>Cancel</Button>
          <Button variant="primary" onClick={handleReviewOfferSubmit} disabled={isSubmitting}>Review & Submit</Button>
        </div>
      }>
        <div className="space-y-4">
          {selectedLotForOffer && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Lot</span>
                <span className="text-text-main font-mono">Lot #{selectedLotForOffer.lot_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Available</span>
                <span className="text-text-main font-mono">{selectedLotForOffer.lot_quantity.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Grade</span>
                <span className="text-text-main font-mono">{selectedLotForOffer.lot_grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Location</span>
                <span className="text-text-main">{selectedLotForOffer.lot_location || '—'}</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantity (kg)"
              type="number"
              step="0.01"
              placeholder="e.g. 500"
              error={offerFormErrors.quantity}
              value={offerFormQuantity}
              onChange={(e) => setOfferFormQuantity(e.target.value)}
            />
            <Input
              label="Offered Price (₹)"
              type="number"
              step="0.01"
              placeholder="e.g. 2500"
              error={offerFormErrors.price}
              value={offerFormPrice}
              onChange={(e) => setOfferFormPrice(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Pickup Window"
              placeholder="e.g. Within 3 days of acceptance"
              error={offerFormErrors.pickup_window}
              value={offerFormPickupWindow}
              onChange={(e) => setOfferFormPickupWindow(e.target.value)}
            />
            <Input
              label="Payment Terms"
              placeholder="e.g. 50% advance, 50% on delivery"
              error={offerFormErrors.payment_terms}
              value={offerFormPaymentTerms}
              onChange={(e) => setOfferFormPaymentTerms(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-main tracking-wide">Message to Seller</label>
            <textarea
              className={cn(
                'w-full px-3 py-2 bg-surface text-text-main text-sm rounded-md border border-border hover:border-border focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent min-h-[80px]',
                offerFormErrors.message && 'border-status-error focus:border-status-error focus:ring-status-error'
              )}
              placeholder="Optional message to the seller..."
              value={offerFormMessage}
              onChange={(e) => setOfferFormMessage(e.target.value)}
            />
            {offerFormErrors.message && (
              <p className="flex items-center space-x-1 text-xs text-status-error">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{offerFormErrors.message}</span>
              </p>
            )}
          </div>
          {offerSubmitError && (
            <div className="rounded-md bg-status-error/10 border border-status-error/30 p-3 text-xs text-status-error">
              {offerSubmitError}
            </div>
          )}
        </div>
      </Dialog>

      <Dialog isOpen={isCounterDialogOpen} onClose={handleCloseCounterDialog} title="Trust Ledger — Counter Offer" description={selectedOfferForCounter ? `Counter offer against ${selectedOfferForCounter.crop}` : 'Submit revised offer terms.'} maxWidth="lg" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleCloseCounterDialog} disabled={isCounterSubmitting}>Cancel</Button>
          <Button variant="primary" onClick={handleReviewCounterSubmit} disabled={isCounterSubmitting}>Review Counter</Button>
        </div>
      }>
        <div className="space-y-4">
          {selectedOfferForCounter && (
            <div className="p-3 rounded-lg bg-surface border border-accent/30 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent">Original Offer</span>
                <span className="text-[10px] font-mono text-text-muted">Round {selectedOfferForCounter.round}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Crop</span>
                  <span className="text-text-main font-mono">{selectedOfferForCounter.crop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Lot</span>
                  <span className="text-text-main font-mono">{selectedOfferForCounter.lotId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Current Price</span>
                  <span className="text-accent font-mono font-bold">{selectedOfferForCounter.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Current Qty</span>
                  <span className="text-text-main font-mono">{selectedOfferForCounter.quantity}</span>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantity (kg)"
              type="number"
              step="0.01"
              placeholder="e.g. 500"
              error={counterFormErrors.quantity}
              value={counterFormQuantity}
              onChange={(e) => setCounterFormQuantity(e.target.value)}
            />
            <Input
              label="Offered Price (₹)"
              type="number"
              step="0.01"
              placeholder="e.g. 2500"
              error={counterFormErrors.price}
              value={counterFormPrice}
              onChange={(e) => setCounterFormPrice(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Pickup Window"
              placeholder="e.g. Within 3 days of acceptance"
              error={counterFormErrors.pickup_window}
              value={counterFormPickupWindow}
              onChange={(e) => setCounterFormPickupWindow(e.target.value)}
            />
            <Input
              label="Payment Terms"
              placeholder="e.g. 50% advance, 50% on delivery"
              error={counterFormErrors.payment_terms}
              value={counterFormPaymentTerms}
              onChange={(e) => setCounterFormPaymentTerms(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-main tracking-wide">Message to Seller</label>
            <textarea
              className={cn(
                'w-full px-3 py-2 bg-surface text-text-main text-sm rounded-md border border-border hover:border-border focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent min-h-[80px]',
                counterFormErrors.message && 'border-status-error focus:border-status-error focus:ring-status-error'
              )}
              placeholder="Optional message to the seller..."
              value={counterFormMessage}
              onChange={(e) => setCounterFormMessage(e.target.value)}
            />
            {counterFormErrors.message && (
              <p className="flex items-center space-x-1 text-xs text-status-error">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{counterFormErrors.message}</span>
              </p>
            )}
          </div>
          {counterSubmitError && (
            <div className="rounded-md bg-status-error/10 border border-status-error/30 p-3 text-xs text-status-error">
              {counterSubmitError}
            </div>
          )}
        </div>
      </Dialog>

      <Dialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirm Submission" description={confirmMessage} maxWidth="sm" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} disabled={pendingAction === 'counter' ? isCounterSubmitting : isSubmitting}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmDemand} isLoading={pendingAction === 'counter' ? isCounterSubmitting : isSubmitting}>Confirm</Button>
        </div>
      }>
        <div className="text-xs text-text-muted">
          Please verify the details before confirming. This action will create a new offer visible to the seller.
        </div>
      </Dialog>

      <Dialog isOpen={isTransactionDetailOpen} onClose={handleCloseTransactionDetail} title={selectedTransaction ? `Transaction TXN-${selectedTransaction.id}` : 'Transaction Details'} description={selectedTransaction ? `Lot #${selectedTransaction.lot_id} • ${selectedTransaction.quantity.toLocaleString()} kg` : 'Transaction details'} maxWidth="lg" footer={
        <div className="flex items-center justify-between">
          <Button variant="destructive" size="sm" onClick={() => { handleCloseTransactionDetail(); handleOpenCreateDispute(selectedTransaction?.id); }}>Open Dispute</Button>
          <Button variant="ghost" onClick={handleCloseTransactionDetail}>Close</Button>
        </div>
      }>
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={mapTransactionStatus(selectedTransaction.status)} label={selectedTransaction.status} size="md" />
              <span className="text-[10px] font-mono text-text-muted">Created {formatRelativeTime(selectedTransaction.created_at)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Transaction ID</span>
                <span className="text-text-main font-mono">TXN-{selectedTransaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Lot ID</span>
                <span className="text-text-main font-mono">#{selectedTransaction.lot_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Quantity</span>
                <span className="text-text-main font-mono">{selectedTransaction.quantity.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Agreed Price</span>
                <span className="text-accent font-mono font-bold">₹{selectedTransaction.agreed_price}/qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total Amount</span>
                <span className="text-text-main font-mono">₹{selectedTransaction.total_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Confirmed At</span>
                <span className="text-text-main font-mono">{selectedTransaction.confirmed_at ? new Date(selectedTransaction.confirmed_at).toLocaleString() : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Completed At</span>
                <span className="text-text-main font-mono">{selectedTransaction.completed_at ? new Date(selectedTransaction.completed_at).toLocaleString() : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Created</span>
                <span className="text-text-main font-mono">{new Date(selectedTransaction.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent">Status Timeline</span>
              <StatusSteps steps={mapBackendTransactionToSteps(selectedTransaction)} />
            </div>
            {payments.some(p => p.transaction_id === selectedTransaction.id) && (
              <div className="mt-4 p-3 rounded-lg bg-surface border border-border space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent">Payment</span>
                {payments.filter(p => p.transaction_id === selectedTransaction.id).map(payment => (
                  <div key={payment.id} className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Payment ID</span>
                      <span className="text-text-main font-mono">PAY-{payment.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Amount</span>
                      <span className="text-accent font-mono font-bold">₹{payment.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Status</span>
                      <StatusBadge status={mapPaymentStatus(payment.status)} label={payment.status} size="sm" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Method</span>
                      <span className="text-text-main font-mono">{payment.payment_method || '—'}</span>
                    </div>
                    {payment.reference && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-text-muted">Reference</span>
                        <span className="text-text-main font-mono">{payment.reference}</span>
                      </div>
                    )}
                    {payment.confirmed_at && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Confirmed</span>
                        <span className="text-text-main font-mono">{new Date(payment.confirmed_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!selectedTransaction && <LoadingState message="Loading transaction details..." />}
      </Dialog>

      <Dialog isOpen={isHistoryDialogOpen} onClose={handleCloseHistoryDialog} title="Offer History" description={selectedOfferForHistory ? `${selectedOfferForHistory.crop} — ${selectedOfferForHistory.id} • Round ${selectedOfferForHistory.round}` : 'Negotiation trail'} maxWidth="lg" footer={
        <div className="flex items-center justify-end">
          <Button variant="ghost" onClick={handleCloseHistoryDialog}>Close</Button>
        </div>
      }>
        {historyLoading && <LoadingState message="Loading negotiation history..." />}
        {historyError && <ErrorState title="Unable to load history" message={historyError} onRetry={retryHistory} />}
        {!historyLoading && !historyError && historyData.length === 0 && (
          <EmptyState title="No history" description="No negotiation history found for this offer." />
        )}
        {!historyLoading && !historyError && historyData.length > 0 && (
          <Timeline
            items={historyData.map((entry) => {
              const actorName = entry.action === 'submitted' ? 'You' : 'Seller';
              const actorRole = entry.action === 'submitted' ? 'Buyer' : 'Farmer';
              const statusMap: Record<string, 'accepted' | 'pending' | 'countered' | 'rejected'> = {
                submitted: 'pending',
                countered: 'countered',
                accepted: 'accepted',
                rejected: 'rejected',
              };
              const amount = entry.offered_price ? `₹${entry.offered_price}/qtl` : undefined;
              const descriptionParts = [entry.action.charAt(0).toUpperCase() + entry.action.slice(1)];
              if (entry.message) {
                descriptionParts.push(entry.message);
              } else {
                if (entry.quantity) descriptionParts.push(`${entry.quantity} kg`);
                if (entry.pickup_window) descriptionParts.push(entry.pickup_window);
                if (entry.payment_terms) descriptionParts.push(entry.payment_terms);
              }
              const description = descriptionParts.join(' • ');

              return {
                id: String(entry.id),
                actor: actorName,
                role: actorRole,
                amount,
                description,
                timestamp: formatRelativeTime(entry.created_at),
                status: statusMap[entry.action] || 'pending',
              };
            })}
          />
        )}
      </Dialog>

      <Dialog isOpen={isDisputeDetailOpen} onClose={handleCloseDisputeDetail} title={selectedDispute ? `Dispute DSP-${selectedDispute.id}` : 'Dispute Details'} description={selectedDispute ? `Transaction TXN-${selectedDispute.transaction_id}` : 'Dispute details'} maxWidth="lg" footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedDispute && (() => {
              const transitions: Record<string, string[]> = {
                open: ['under_review'],
                under_review: ['open', 'awaiting_evidence'],
                awaiting_evidence: ['under_review', 'escalated'],
                escalated: ['awaiting_evidence', 'resolved'],
              };
              const nextStatuses = transitions[selectedDispute.status] || [];
              return nextStatuses.map(next => (
                <Button key={next} size="sm" variant="outline" onClick={() => handleUpdateDisputeStatus(selectedDispute.id, next)}>
                  Mark {next.replace(/_/g, ' ')}
                </Button>
              ));
            })()}
          </div>
          <Button variant="ghost" onClick={handleCloseDisputeDetail}>Close</Button>
        </div>
      }>
        {disputeDetailLoading && <LoadingState message="Loading dispute details..." />}
        {!disputeDetailLoading && selectedDispute && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status="dispute" label={selectedDispute.status} size="md" />
              <span className="text-[10px] font-mono text-text-muted">Priority: {selectedDispute.priority}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Dispute ID</span>
                <span className="text-text-main font-mono">DSP-{selectedDispute.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Transaction</span>
                <span className="text-text-main font-mono">TXN-{selectedDispute.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Opened By</span>
                <span className="text-text-main font-mono">User #{selectedDispute.opened_by_user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Created</span>
                <span className="text-text-main font-mono">{new Date(selectedDispute.created_at).toLocaleString()}</span>
              </div>
              {selectedDispute.updated_at && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Updated</span>
                  <span className="text-text-main font-mono">{new Date(selectedDispute.updated_at).toLocaleString()}</span>
                </div>
              )}
              {selectedDispute.resolved_at && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Resolved At</span>
                  <span className="text-text-main font-mono">{new Date(selectedDispute.resolved_at).toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent">Reason</span>
              <p className="text-xs text-text-main">{selectedDispute.reason}</p>
            </div>
            {selectedDispute.description && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent">Description</span>
                <p className="text-xs text-text-muted">{selectedDispute.description}</p>
              </div>
            )}
            {selectedDispute.resolution_notes && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent">Resolution Notes</span>
                <p className="text-xs text-text-muted">{selectedDispute.resolution_notes}</p>
              </div>
            )}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent">Evidence ({disputeEvidence.length})</span>
                <Button size="sm" variant="outline" leftIcon={<FileText className="w-3.5 h-3.5" />} onClick={() => handleOpenAddEvidence(selectedDispute.id)}>
                  Add Evidence
                </Button>
              </div>
              {disputeEvidence.length === 0 && (
                <p className="text-xs text-text-muted">No evidence uploaded yet.</p>
              )}
              {disputeEvidence.length > 0 && (
                <div className="space-y-2">
                  {disputeEvidence.map(ev => (
                    <div key={ev.id} className="p-3 rounded-lg bg-surface border border-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-text-main capitalize">{ev.evidence_type}</span>
                        <span className="text-[10px] font-mono text-text-muted">#{ev.id}</span>
                      </div>
                      <div className="text-xs text-text-muted font-mono">{ev.file_name}</div>
                      {ev.file_path && <div className="text-xs text-text-muted">Ref: {ev.file_path}</div>}
                      {ev.description && <div className="text-xs text-text-muted">{ev.description}</div>}
                      <div className="text-[10px] font-mono text-text-muted">Uploaded {new Date(ev.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      <Dialog isOpen={isCreateDisputeOpen} onClose={handleCloseCreateDispute} title="Open Dispute" description="Create a new dispute for a transaction." maxWidth="lg" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleCloseCreateDispute}>Cancel</Button>
          <Button variant="primary" onClick={handleReviewCreateDispute}>Review & Submit</Button>
        </div>
      }>
        <div className="space-y-4">
          <Input
            label="Transaction ID"
            type="number"
            placeholder="e.g. 1"
            error={createDisputeErrors.transaction}
            value={createDisputeTransactionId !== null ? String(createDisputeTransactionId) : ''}
            onChange={(e) => setCreateDisputeTransactionId(e.target.value ? Number(e.target.value) : null)}
          />
          <Input
            label="Reason"
            placeholder="e.g. Quality discrepancy"
            error={createDisputeErrors.reason}
            value={createDisputeReason}
            onChange={(e) => setCreateDisputeReason(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-main tracking-wide">Description</label>
            <textarea
              className={cn(
                'w-full px-3 py-2 bg-surface text-text-main text-sm rounded-md border border-border hover:border-border focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent min-h-[80px]',
                createDisputeErrors.description && 'border-status-error focus:border-status-error focus:ring-status-error'
              )}
              placeholder="Optional details about the dispute..."
              value={createDisputeDescription}
              onChange={(e) => setCreateDisputeDescription(e.target.value)}
            />
            {createDisputeErrors.description && (
              <p className="flex items-center space-x-1 text-xs text-status-error">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{createDisputeErrors.description}</span>
              </p>
            )}
          </div>
          <Select
            label="Priority"
            value={createDisputePriority}
            onChange={(e) => setCreateDisputePriority(e.target.value)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
          {disputesError && (
            <div className="rounded-md bg-status-error/10 border border-status-error/30 p-3 text-xs text-status-error">
              {disputesError}
            </div>
          )}
        </div>
      </Dialog>

      <Dialog isOpen={isAddEvidenceOpen} onClose={handleCloseAddEvidence} title="Add Evidence" description={evidenceDisputeId ? `Add evidence to dispute DSP-${evidenceDisputeId}` : 'Add evidence metadata'} maxWidth="lg" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleCloseAddEvidence}>Cancel</Button>
          <Button variant="primary" onClick={handleReviewAddEvidence}>Review & Add</Button>
        </div>
      }>
        <div className="space-y-4">
          <Input
            label="Evidence Type"
            placeholder="e.g. photo, document, receipt"
            error={evidenceErrors.evidence_type}
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
          />
          <Input
            label="File Name"
            placeholder="e.g. delivery_photo_01.jpg"
            error={evidenceErrors.file_name}
            value={evidenceFileName}
            onChange={(e) => setEvidenceFileName(e.target.value)}
          />
          <Input
            label="File Path / Reference"
            placeholder="Optional reference or path"
            value={evidenceFilePath}
            onChange={(e) => setEvidenceFilePath(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-main tracking-wide">Description</label>
            <textarea
              className={cn(
                'w-full px-3 py-2 bg-surface text-text-main text-sm rounded-md border border-border hover:border-border focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent min-h-[80px]',
                evidenceErrors.description && 'border-status-error focus:border-status-error focus:ring-status-error'
              )}
              placeholder="Optional description of the evidence..."
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
            />
            {evidenceErrors.description && (
              <p className="flex items-center space-x-1 text-xs text-status-error">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{evidenceErrors.description}</span>
              </p>
            )}
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirm Submission" description={confirmMessage} maxWidth="sm" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} disabled={pendingAction === 'counter' ? isCounterSubmitting : isSubmitting}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmDemand} isLoading={pendingAction === 'counter' ? isCounterSubmitting : isSubmitting}>Confirm</Button>
        </div>
      }>
        <div className="text-xs text-text-muted">
          Please verify the details before confirming. This action will create a new offer visible to the seller.
        </div>
      </Dialog>
    </AppShell>
  );
};
