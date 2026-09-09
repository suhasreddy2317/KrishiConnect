import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileStack } from '@/components/layout/MobileStack';
import { RecommendationCard, type RecommendationVerdict, type ExplanationFactor } from '@/components/data-display/RecommendationCard';
import { MarketCard } from '@/components/data-display/MarketCard';
import { SyncStatus } from '@/components/status/SyncStatus';
import { StatusSteps } from '@/components/status/StatusSteps';
import { StatusBadge } from '@/components/status/StatusBadge';
import { LoadingState } from '@/components/data-display/LoadingState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Drawer } from '@/components/ui/Drawer';
import { Dialog } from '@/components/ui/Dialog';
import { Plus, HelpCircle, Truck, Wallet, AlertTriangle, Package, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTextToSpeech } from '@/components/voice/useTextToSpeech';
import { VoiceAssistant, VoiceAssistantHandle } from '@/components/voice/VoiceAssistant';
import {
  buildLocalizedReason,
  parseFactor,
} from '@/lib/recommendationLocalization';

interface SaleWindowResponse {
  commodity_id: number;
  commodity_name: string;
  market_id: number;
  market_name: string | null;
  score: number;
  verdict: string;
  reasons: string[];
  factors: Array<Record<string, unknown>>;
  freshness: string;
  generated_at: string;
  limitations: string[];
  algorithm: Record<string, unknown>;
}

type TabId = '/farmer' | '/farmer/market' | '/farmer/lots' | '/farmer/offers' | '/farmer/transactions' | '/farmer/shipments' | '/farmer/payments' | '/farmer/disputes';

interface BackendLot {
  id: number;
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
  farmer_id: number;
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
}

interface BackendOffer {
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

export const FarmerPage: React.FC = () => {
  const { token } = useAuth();
  const { language, t } = useLanguage();
  const { speak, stop, isSpeaking, canSpeak, hasVoiceFor } = useTextToSpeech();

  const localizedCropName = (crop: string): string => {
    const map: Record<string, string> = {
      Wheat: t('recommendationCard.cropNames.wheat'),
      Soybean: t('recommendationCard.cropNames.soybean'),
      Rice: t('recommendationCard.cropNames.rice'),
      'Red Onion': t('recommendationCard.cropNames.redOnion'),
      Tomato: t('recommendationCard.cropNames.tomato'),
    };
    return map[crop] || crop;
  };
  const [activeTab, setActiveTab] = useState<TabId>('/farmer');
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
  const [isLotDrawerOpen, setIsLotDrawerOpen] = useState(false);
  const [lotCrop, setLotCrop] = useState('');
  const [lotQuantity, setLotQuantity] = useState('');
  const [lotQualityGrade, setLotQualityGrade] = useState('');
  const [lotMoisture, setLotMoisture] = useState('');
  const [lotHarvestDate, setLotHarvestDate] = useState('');
  const [lotLocation, setLotLocation] = useState('');
  const [lotExpectedPrice, setLotExpectedPrice] = useState('');
  const [commodities, setCommodities] = useState<BackendCommodity[]>([]);
  const [lotFormErrors, setLotFormErrors] = useState<Record<string, string>>({});
  const [lotSubmitting, setLotSubmitting] = useState(false);
  const [lotSubmitError, setLotSubmitError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isDemoNoticeVisible, setIsDemoNoticeVisible] = useState(true);

  const [lotsLoading, setLotsLoading] = useState(false);
  const [lotsError, setLotsError] = useState<string | null>(null);
  const [lots, setLots] = useState<BackendLot[]>([]);

  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [offers, setOffers] = useState<BackendOffer[]>([]);

  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);

  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [shipmentsError, setShipmentsError] = useState<string | null>(null);
  const [shipments, setShipments] = useState<BackendShipment[]>([]);

  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [payments, setPayments] = useState<BackendPayment[]>([]);

  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesError, setDisputesError] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<BackendDispute[]>([]);

  const [recommendation, setRecommendation] = useState<SaleWindowResponse | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const voiceAssistantRef = useRef<VoiceAssistantHandle>(null);

  const handleListenRecommendation = useCallback(
    (text: string) => {
      if (isSpeaking) {
        stop();
      } else {
        speak(text, language);
      }
    },
    [language, speak, stop, isSpeaking]
  );

  const handleVoiceAssistantAction = useCallback(
    (intent: string) => {
      const map: Record<string, TabId> = {
        recommendation: '/farmer',
        market_price: '/farmer/market',
        price_trend: '/farmer/market',
        my_lots: '/farmer/lots',
        produce: '/farmer/lots',
        offers: '/farmer/offers',
        buyers: '/farmer/offers',
        shipments: '/farmer/shipments',
        payments: '/farmer/payments',
      };
      const tab = map[intent];
      if (tab) setActiveTab(tab);
    },
    [setActiveTab]
  );

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: '/farmer', label: t('dashboard.decisionHome') },
    { id: '/farmer/market', label: t('dashboard.nearbyMandis') },
    { id: '/farmer/lots', label: t('dashboard.myLots'), count: lots.length || undefined },
    { id: '/farmer/offers', label: t('dashboard.offers'), count: offers.length || undefined },
    { id: '/farmer/transactions', label: t('dashboard.transactions'), count: transactions.length || undefined },
    { id: '/farmer/shipments', label: t('dashboard.shipments'), count: shipments.length || undefined },
    { id: '/farmer/payments', label: t('dashboard.payments'), count: payments.length || undefined },
    { id: '/farmer/disputes', label: t('dashboard.disputes'), count: disputes.length || undefined },
  ];

  useEffect(() => {
    if (!token) return;
    fetchLots();
    fetchOffers();
    fetchTransactions();
    fetchShipments();
    fetchPayments();
    fetchDisputes();
  }, [token]);

  useEffect(() => {
    if (isLotDrawerOpen && token) {
      fetchCommodities();
    }
  }, [isLotDrawerOpen, token]);

  const fetchLots = async () => {
    if (!token) return;
    setLotsLoading(true);
    setLotsError(null);
    try {
      const data = await apiRequest<BackendLot[]>('/lots/', { method: 'GET' }, token);
      setLots(data);
    } catch (err) {
      setLotsError(err instanceof Error ? err.message : 'Failed to load lots');
    } finally {
      setLotsLoading(false);
    }
  };

  const fetchCommodities = async () => {
    if (!token) return;
    try {
      const data = await apiRequest<BackendCommodity[]>('/commodities/', { method: 'GET' }, token);
      setCommodities(data);
    } catch (err) {
      console.error('Failed to load commodities', err);
    }
  };

  const fetchOffers = async () => {
    if (!token) return;
    setOffersLoading(true);
    setOffersError(null);
    try {
      const data = await apiRequest<{ items: BackendOffer[]; total: number }>('/offers/', { method: 'GET' }, token);
      setOffers(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setOffersError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setOffersLoading(false);
    }
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
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchShipments = async () => {
    if (!token) return;
    setShipmentsLoading(true);
    setShipmentsError(null);
    try {
      const data = await apiRequest<{ items: BackendShipment[]; total: number }>('/shipments/', { method: 'GET' }, token);
      setShipments(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setShipmentsError(err instanceof Error ? err.message : 'Failed to load shipments');
    } finally {
      setShipmentsLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!token) return;
    setPaymentsLoading(true);
    setPaymentsError(null);
    try {
      const data = await apiRequest<{ items: BackendPayment[]; total: number }>('/payments/', { method: 'GET' }, token);
      setPayments(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setPaymentsError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchDisputes = async () => {
    if (!token) return;
    setDisputesLoading(true);
    setDisputesError(null);
    try {
      const data = await apiRequest<{ items: BackendDispute[]; total: number }>('/disputes/', { method: 'GET' }, token);
      setDisputes(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setDisputesError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setDisputesLoading(false);
    }
  };

  const validateLotForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!lotCrop) errors.crop = t('farmerPage.lotForm.cropRequired');
    if (!lotQuantity || parseFloat(lotQuantity) <= 0) errors.quantity = t('farmerPage.lotForm.quantityRequired');
    if (!lotQualityGrade.trim()) errors.qualityGrade = t('farmerPage.lotForm.qualityGradeRequired');
    if (lotMoisture && parseFloat(lotMoisture) < 0) errors.moisture = t('farmerPage.lotForm.moistureNegative');
    if (lotExpectedPrice && parseFloat(lotExpectedPrice) < 0) errors.expectedPrice = t('farmerPage.lotForm.priceNegative');

    setLotFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateLot = async () => {
    if (!token) return;

    if (!validateLotForm()) return;

    setLotSubmitting(true);
    setLotSubmitError(null);

    try {
      const selectedCommodity = commodities.find(c => String(c.id) === lotCrop);
      const payload: Record<string, unknown> = {
        crop: selectedCommodity ? selectedCommodity.name : lotCrop,
        commodity_id: selectedCommodity ? selectedCommodity.id : null,
        quantity_kg: parseFloat(lotQuantity),
        quality_grade: lotQualityGrade,
      };

      if (lotMoisture) payload.moisture_percent = parseFloat(lotMoisture);
      if (lotHarvestDate) payload.harvest_date = lotHarvestDate;
      if (lotLocation) payload.location = lotLocation;
      if (lotExpectedPrice) payload.expected_price_per_kg = parseFloat(lotExpectedPrice);

      await apiRequest('/lots/', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token);

      setLotCrop('');
      setLotQuantity('');
      setLotQualityGrade('');
      setLotMoisture('');
      setLotHarvestDate('');
      setLotLocation('');
      setLotExpectedPrice('');
      setLotFormErrors({});
      setLotSubmitError(null);
      setIsLotDrawerOpen(false);

      await fetchLots();
    } catch (err) {
      setLotSubmitError(err instanceof Error ? err.message : 'Failed to create lot');
    } finally {
      setLotSubmitting(false);
    }
  };

  const fetchRecommendation = async () => {
    if (!token) return;
    setRecommendationLoading(true);
    setRecommendationError(null);
    try {
      const sortedLots = [...lots].sort((a, b) => b.id - a.id);
      const bestLot = sortedLots.find(l => l.status === 'published') || lots[0];
      if (!bestLot || bestLot.commodity_id == null) {
        setRecommendation(null);
        setRecommendationLoading(false);
        return;
      }
      let marketId = bestLot.location
        ? (() => {
            const marketMap: Record<string, number> = {
              nashik: 1, lasalgaon: 1, pimpalgaon: 2,
            };
            const key = bestLot.location!.toLowerCase();
            for (const [k, v] of Object.entries(marketMap)) {
              if (key.includes(k)) return v;
            }
            return 1;
          })()
        : 1;
      const data = await apiRequest<SaleWindowResponse>(
        `/recommendations/sale-window?commodity_id=${bestLot.commodity_id}&market_id=${marketId}`,
        { method: 'GET' },
        token
      );
      setRecommendation(data);
    } catch {
      setRecommendationError('Unable to load recommendation. Showing last available data.');
    } finally {
      setRecommendationLoading(false);
    }
  };

  useEffect(() => {
    if (!token || lots.length === 0) return;
    fetchRecommendation();
  }, [token, lots]);

  const VERDICT_TTS_KEY: Record<string, string> = {
    SELL_NOW: 'sellNow',
    SELL_SOON: 'sellSoon',
    WAIT: 'wait',
    STORE: 'store',
    REROUTE: 'reroute',
  };

  const buildLocalizedFactors = useCallback(
    (rec: SaleWindowResponse | null, cropName: string): ExplanationFactor[] => {
      if (!rec) return [];
      const rawFactors = Array.isArray(rec.factors) ? rec.factors : [];
      const seen = new Set<string>();
      const localized: ExplanationFactor[] = [];

      for (const f of rawFactors) {
        const parsed = parseFactor(f);
        if (!parsed) continue;
        const typeKey = `${parsed.type}_${parsed.condition}`;
        if (seen.has(typeKey)) continue;
        seen.add(typeKey);

        const result = buildLocalizedReason(f, t, cropName);
        if (result) {
          localized.push({
            title: result.title,
            impact: result.impact,
            description: result.description,
          });
        }
      }

      if (localized.length === 0 && rec.reasons.length > 0) {
        return rec.reasons.slice(0, 3).map((r, idx) => {
          const parts = r.split(':');
          const rawTitle = parts[0] || `Factor ${idx + 1}`;
          const description = parts.slice(1).join(':').trim() || r;
          const impact: 'positive' | 'negative' | 'neutral' =
            /rising|up|good|favorable|affordable|available|higher|improving/i.test(description)
              ? 'positive'
              : /falling|down|risk|costly|loss|not found|no active/i.test(description)
              ? 'negative'
              : 'neutral';
          const titleKey = `recommendationCard.${rawTitle.toLowerCase().replace(/\s+/g, '')}`;
          const localizedTitle = t(titleKey);
          const title = localizedTitle !== titleKey ? localizedTitle : rawTitle;
          return { title, impact, description };
        });
      }

      return localized.slice(0, 3);
    },
    [t]
  );

  const buildVoiceResponseText = useCallback(
    (rec: SaleWindowResponse | null, cropName: string): string => {
      if (!rec) {
        return t('recommendationTts.unavailable');
      }

      const verdictKey = VERDICT_TTS_KEY[rec.verdict] || rec.verdict.toLowerCase();
      const verdictLabel = t(`recommendationCard.${verdictKey}`);
      const explanation = t(`recommendationCard.${verdictKey}Explanation`);

      const cropLine = t('recommendationTts.cropLine', { crop: cropName });
      const actionLine = t('recommendationTts.actionLine', { action: verdictLabel });
      const scoreLine = t('recommendationTts.scoreLine', { score: Math.round(rec.score) });
      const explanationLine = explanation
        ? t('recommendationTts.explanationLine', { explanation })
        : '';

      let text = `${cropLine} ${actionLine} ${scoreLine}`;
      if (explanationLine) {
        text += ` ${explanationLine}`;
      }

      const localizedReasons = buildLocalizedFactors(rec, cropName);
      const topReasons = localizedReasons
        .filter(r => r.impact === 'positive')
        .slice(0, 2);

      if (topReasons.length > 0) {
        const reasonDescriptions = topReasons
          .map(r => r.description)
          .filter(d => d.length > 0);
        if (reasonDescriptions.length > 0) {
          text += ` ${t('recommendationTts.reasonsPrefix')} ${reasonDescriptions.join('. ')}.`;
        }
      }

      return text.replace(/\s+/g, ' ').trim();
    },
    [t, buildLocalizedFactors]
  );

  const getVerdictTab = (verdict: string): TabId => {
    const v = verdict.toUpperCase();
    if (v === 'SELL_NOW' || v === 'SELL_SOON' || v === 'REROUTE') return '/farmer/offers';
    if (v === 'STORE') return '/farmer/market';
    return '/farmer/market';
  };

  const getActionLabel = (verdict: string): string => {
    const v = verdict.toUpperCase();
    if (v === 'SELL_NOW' || v === 'SELL_SOON' || v === 'REROUTE') {
      return t('recommendationCard.viewOffersAction');
    }
    if (v === 'STORE') {
      return t('recommendationCard.viewMarketAction');
    }
    return t('recommendationCard.viewMarketAction');
  };

  const handlePrimaryAction = useCallback(() => {
    if (!recommendation) return;
    const tab = getVerdictTab(recommendation.verdict);
    setActiveTab(tab);
  }, [recommendation]);

  const handleRecommendationAction = useCallback(
    (_intent: 'sell' | 'store' | 'wait', _actionHint: string | null) => {
      if (voiceAssistantRef.current) {
        voiceAssistantRef.current.startListening();
      }
    },
    []
  );

  const requestConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setIsConfirmOpen(true);
  };

  const handleAcceptOffer = async (offer: BackendOffer) => {
    if (!token) return;
    requestConfirm(`Accept offer of ₹${offer.offered_price}/qtl for ${offer.quantity} kg?`, async () => {
      try {
        await apiRequest(`/offers/${offer.id}/accept`, { method: 'POST' }, token);
        await fetchOffers();
        await fetchTransactions();
      } catch (err) {
        setOffersError(err instanceof Error ? err.message : 'Failed to accept offer');
      }
    });
  };

  const handleRejectOffer = async (offer: BackendOffer) => {
    if (!token) return;
    requestConfirm('Reject this offer?', async () => {
      try {
        await apiRequest(`/offers/${offer.id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason: 'Rejected by farmer' }),
        }, token);
        await fetchOffers();
      } catch (err) {
        setOffersError(err instanceof Error ? err.message : 'Failed to reject offer');
      }
    });
  };

  const handleCounterOffer = async (offer: BackendOffer) => {
    if (!token) return;
    requestConfirm(`Send counter-offer at ₹${offer.offered_price + 50}/qtl?`, async () => {
      try {
        await apiRequest(`/offers/${offer.id}/counter`, {
          method: 'POST',
          body: JSON.stringify({
            quantity: offer.quantity,
            offered_price: offer.offered_price + 50,
            pickup_window: offer.pickup_window,
            payment_terms: offer.payment_terms,
            message: 'Counter from farmer',
          }),
        }, token);
        await fetchOffers();
      } catch (err) {
        setOffersError(err instanceof Error ? err.message : 'Failed to send counter offer');
      }
    });
  };

  const NEXT_TRANSITION: Record<string, string[]> = {
    accepted: ['confirmed'],
    confirmed: ['dispatched'],
    dispatched: ['in_transit'],
    in_transit: ['delivered'],
    delivered: ['payment_pending'],
    payment_pending: ['completed'],
  };

  const NEXT_SHIPMENT_TRANSITION: Record<string, string[]> = {
    pending: ['dispatched'],
    dispatched: ['in_transit'],
    in_transit: ['delivered'],
    delivered: ['payment_pending'],
    payment_pending: ['completed'],
  };

  const handleUpdateTransactionStatus = async (transactionId: number, status: string, currentStatus: string) => {
    if (!token) return;
    if (status === currentStatus) return;
    requestConfirm(`Update transaction status to ${status}?`, async () => {
      try {
        await apiRequest(`/transactions/${transactionId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }, token);
        await fetchTransactions();
        await fetchShipments();
        await fetchPayments();
      } catch (err) {
        setTransactionsError(err instanceof Error ? err.message : 'Failed to update transaction');
      }
    });
  };

  const handleUpdateShipmentStatus = async (shipmentId: number, status: string) => {
    if (!token) return;
    requestConfirm(`Update shipment status to ${status}?`, async () => {
      try {
        await apiRequest(`/shipments/${shipmentId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }, token);
        await fetchTransactions();
        await fetchShipments();
        await fetchPayments();
      } catch (err) {
        setShipmentsError(err instanceof Error ? err.message : 'Failed to update shipment');
      }
    });
  };

  const handleUpdatePaymentStatus = async (paymentId: number, status: string) => {
    if (!token) return;
    requestConfirm(`Update payment status to ${status}?`, async () => {
      try {
        await apiRequest(`/payments/${paymentId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }, token);
        await fetchPayments();
      } catch (err) {
        setPaymentsError(err instanceof Error ? err.message : 'Failed to update payment');
      }
    });
  };

  const handleOpenDispute = async (transactionId: number) => {
    if (!token) return;
    requestConfirm('Open a dispute for this transaction?', async () => {
      try {
        await apiRequest('/disputes/', {
          method: 'POST',
          body: JSON.stringify({
            transaction_id: transactionId,
            reason: 'Quality discrepancy',
            description: 'Opened from farmer dashboard',
            priority: 'medium',
          }),
        }, token);
        await fetchDisputes();
        await fetchTransactions();
      } catch (err) {
        setDisputesError(err instanceof Error ? err.message : 'Failed to open dispute');
      }
    });
  };

  const renderDecisionHome = () => {
    const sortedLots = [...lots].sort((a, b) => b.id - a.id);
    const bestLot = sortedLots.find(l => l.status === 'published') || lots[0];
    const activeTransaction = transactions[0];

    const displayRecommendation = recommendation;
    const displayCropName = localizedCropName(
      displayRecommendation?.commodity_name || bestLot?.crop || 'your crop'
    );
    const displayVerdict = displayRecommendation
      ? (displayRecommendation.verdict.replace(/_/g, ' ') as RecommendationVerdict)
      : undefined;
    const displayScore = displayRecommendation?.score ?? 0;
    const displayHeadline = displayRecommendation
      ? t('farmerPage.recommendation.scoreSummary', {
          score: Math.round(displayRecommendation.score),
          crop: displayCropName,
        })
      : t('recommendationTts.loading');

    const displayReasons: ExplanationFactor[] = buildLocalizedFactors(
      displayRecommendation,
      displayCropName
    );
    const displayTimestamp = displayRecommendation
      ? t('farmerPage.recommendation.updated', { freshness: displayRecommendation.freshness })
      : recommendationLoading
        ? 'Loading...'
        : recommendationError
          ? recommendationError
          : 'Data not available';

    const actionLabel = displayVerdict ? getActionLabel(displayVerdict) : t('recommendationCard.viewOffersAction');

    return (
      <div className="space-y-6">
        {recommendationError && (
          <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/30 flex items-start justify-between gap-3">
            <p className="text-xs text-status-warning">{recommendationError}</p>
            <Button size="sm" variant="ghost" onClick={fetchRecommendation}>{t('common.retry')}</Button>
          </div>
        )}

        {isDemoNoticeVisible && lots.length === 0 && (
          <div className="p-3 rounded-xl bg-surface-raised border border-border/40 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-status-warning">{t('farmerPage.demoNotice')}</span>
              <p className="text-xs text-text-muted">{t('farmerPage.demoNoticeDescription')}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setIsDemoNoticeVisible(false)}>{t('common.dismiss')}</Button>
          </div>
        )}

        <div className="p-4 rounded-xl bg-surface border border-accent/30 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-surface-raised text-accent shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-accent">{t('farmerPage.farmerOperatingPrinciple')}</span>
            <h2 className="text-lg font-semibold text-text-main">"{t('farmerPage.principleTitle')}"</h2>
            <p className="text-xs text-text-muted">{t('farmerPage.principleDescription')}</p>
          </div>
        </div>

        <VoiceAssistant
          ref={voiceAssistantRef}
          onAction={(intent) => handleVoiceAssistantAction(intent)}
        />

        <RecommendationCard
          cropName={displayCropName}
          verdict={displayVerdict || 'WAIT'}
          score={displayScore}
          headline={displayHeadline}
          reasons={displayReasons}
          timestamp={displayTimestamp}
          onPrimaryAction={handlePrimaryAction}
          primaryActionLabel={actionLabel}
          onListen={() =>
            handleListenRecommendation(
              buildVoiceResponseText(displayRecommendation, displayCropName)
            )
          }
          onAction={handleRecommendationAction}
          canListen={canSpeak}
          isSpeaking={isSpeaking}
          voiceAvailable={hasVoiceFor(language)}
        />

        {activeTransaction && (
          <Card variant="default" title={t('farmerPage.activeTransaction', { lotId: activeTransaction.lot_id })} subtitle={t('farmerPage.transactionNumber', { id: activeTransaction.id })} headerAction={<StatusBadge status="verified-buyer" label={activeTransaction.status} size="sm" />}>
            <StatusSteps
              steps={[
                { id: '1', label: t('farmerPage.statusSteps.offerAccepted'), sublabel: `₹${activeTransaction.agreed_price}/qtl`, status: 'complete' },
                { id: '2', label: t('farmerPage.statusSteps.confirmed'), sublabel: activeTransaction.confirmed_at ? new Date(activeTransaction.confirmed_at).toLocaleDateString() : '—', status: activeTransaction.status === 'confirmed' || activeTransaction.status === 'dispatched' || activeTransaction.status === 'in_transit' || activeTransaction.status === 'delivered' || activeTransaction.status === 'payment_pending' || activeTransaction.status === 'completed' ? 'complete' : 'pending' },
                { id: '3', label: t('farmerPage.statusSteps.dispatched'), sublabel: '—', status: ['dispatched', 'in_transit', 'delivered', 'payment_pending', 'completed'].includes(activeTransaction.status as any) ? 'complete' : 'pending' },
                { id: '4', label: t('farmerPage.statusSteps.delivered'), sublabel: '—', status: ['delivered', 'payment_pending', 'completed'].includes(activeTransaction.status as any) ? 'complete' : 'pending' },
                { id: '5', label: t('farmerPage.statusSteps.payment'), sublabel: '—', status: activeTransaction.status === 'completed' ? 'complete' : 'pending' },
              ]}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {(NEXT_TRANSITION[activeTransaction.status] || []).map(next => (
                <Button key={next} size="sm" variant="outline" onClick={() => handleUpdateTransactionStatus(activeTransaction.id, next, activeTransaction.status)}>{t('farmerPage.markStatus', { status: next })}</Button>
              ))}
              {activeTransaction.status !== 'completed' && (
                <Button size="sm" variant="destructive" onClick={() => handleOpenDispute(activeTransaction.id)}>{t('farmerPage.openDispute')}</Button>
              )}
            </div>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-main">{t('farmerPage.nearbyMandiBenchmarks')}</h3>
              <p className="text-xs text-text-muted">{t('farmerPage.comparingPrices')}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('/farmer/market')}>{t('farmerPage.viewAllMandis')}</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MarketCard mandiName="Lasalgaon APMC" distanceKm={18} commodity="Red Onion" modalPrice={2450} trendPercentage={4.8} timestamp="12m ago" isBestRealized onSelectMandi={() => {}} />
            <MarketCard mandiName="Pimpalgaon Mandi" distanceKm={12} commodity="Red Onion" modalPrice={2380} trendPercentage={-1.2} timestamp="25m ago" isNearest onSelectMandi={() => {}} />
          </div>
        </div>
      </div>
    );
  };

  const renderMarketTab = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-surface border border-status-warning/30 flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-surface-raised text-status-warning shrink-0 mt-0.5"><AlertTriangle className="w-5 h-5" /></div>
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-status-warning">Static Market Data</span>
          <p className="text-xs text-text-muted">Market price benchmarks require selecting a commodity and mandi. Showing seeded demo data below.</p>
        </div>
      </div>
      <MarketCard mandiName="Lasalgaon APMC" distanceKm={18} commodity="Red Onion" modalPrice={2450} trendPercentage={4.8} timestamp="12m ago" isBestRealized />
      <MarketCard mandiName="Pimpalgaon Mandi" distanceKm={12} commodity="Red Onion" modalPrice={2380} trendPercentage={-1.2} timestamp="25m ago" isNearest />
      <MarketCard mandiName="Nashik Main APMC" distanceKm={34} commodity="Red Onion" modalPrice={2410} trendPercentage={2.1} timestamp="1 hr ago" />
    </div>
  );

  const renderLotsTab = () => {
    if (lotsLoading) return <LoadingState message={t('farmerPage.lots.loading')} />;
    if (lotsError) return <ErrorState title={t('farmerPage.lots.loadError')} message={lotsError} onRetry={fetchLots} />;
    if (lots.length === 0) return <EmptyState icon={<Package className="w-6 h-6" />} title={t('farmerPage.lots.noLots')} description={t('farmerPage.lots.noLotsDescription')} actionLabel={t('farmerPage.lots.createLotAction')} onAction={() => setIsLotDrawerOpen(true)} />;

    const farmerLots = lots;
    return (
      <div className="space-y-4">
        {farmerLots.map(lot => (
          <Card key={lot.id} variant="default" title={lot.crop} subtitle={`${lot.quantity_kg} ${lot.unit} • Grade ${lot.quality_grade}`} headerAction={<StatusBadge status="grade" label={lot.quality_grade} size="sm" />}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-text-muted font-mono">Lot ID: #{lot.id} • Status: {lot.status} {lot.harvest_date ? `• Harvest: ${lot.harvest_date}` : ''} {lot.location ? `• ${lot.location}` : ''}</div>
              <Button size="sm" variant="outline" onClick={() => { setSelectedLotId(lot.id); setActiveTab('/farmer/offers'); }}>{t('farmerPage.lots.viewOffers')}</Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderOffersTab = () => {
    if (offersLoading) return <LoadingState message={t('farmerPage.offers.loading')} />;
    if (offersError) return <ErrorState title={t('farmerPage.offers.loadError')} message={offersError} onRetry={fetchOffers} />;

    const filteredOffers = selectedLotId ? offers.filter(offer => offer.lot_id === selectedLotId) : offers;

    if (filteredOffers.length === 0) {
      if (selectedLotId) {
        return <EmptyState icon={<Clock className="w-6 h-6" />} title={t('farmerPage.offers.noOffersForLot', { lotId: selectedLotId })} description={t('farmerPage.offers.noOffersDescription')} />;
      }
      return <EmptyState icon={<Clock className="w-6 h-6" />} title={t('farmerPage.offers.noOffers')} description={t('farmerPage.offers.noOffersDescriptionShort')} />;
    }

    return (
      <div className="space-y-3">
        {filteredOffers.map(offer => (
          <div key={offer.id} className="p-4 rounded-lg bg-surface-raised border border-status-success/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-text-main">Buyer Offer #{offer.id}</span>
                <StatusBadge status={offer.status === 'accepted' ? 'verified-buyer' : offer.status === 'rejected' ? 'warning' : 'pending-verification'} label={offer.status} size="sm" />
              </div>
              <div className="text-xs text-text-muted mt-1 font-mono">
                 Offer: <span className="text-accent font-bold">₹{offer.offered_price} / qtl</span> • {offer.quantity} kg • Lot #{offer.lot_id} • Round {offer.round}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {offer.status !== 'accepted' && offer.status !== 'rejected' && offer.status !== 'expired' && offer.round % 2 === 1 && (
                <>
                  <Button size="sm" variant="primary" onClick={() => handleAcceptOffer(offer)}>{t('farmerPage.offers.acceptOffer')}</Button>
                  <Button size="sm" variant="outline" onClick={() => handleCounterOffer(offer)}>{t('farmerPage.offers.counter')}</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleRejectOffer(offer)}>{t('farmerPage.offers.reject')}</Button>
                </>
              )}
              {offer.status === 'accepted' && <Button size="sm" variant="ghost" onClick={() => setActiveTab('/farmer/transactions')}>{t('farmerPage.offers.viewTransaction')}</Button>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTransactionsTab = () => {
    if (transactionsLoading) return <LoadingState message={t('farmerPage.transactions.loading')} />;
    if (transactionsError) return <ErrorState title={t('farmerPage.transactions.loadError')} message={transactionsError} onRetry={fetchTransactions} />;
    if (transactions.length === 0) return <EmptyState icon={<CheckCircle2 className="w-6 h-6" />} title={t('farmerPage.transactions.noTransactions')} description={t('farmerPage.transactions.noTransactionsDescription')} />;

    return (
      <div className="space-y-4">
        {transactions.map(tx => (
          <Card key={tx.id} variant="default" title={`Transaction #${tx.id}`} subtitle={`Lot #${tx.lot_id} • Buyer #${tx.buyer_id}`} headerAction={<StatusBadge status={tx.status === 'completed' ? 'completed' : 'active'} label={tx.status} size="sm" />}>
            <div className="text-xs text-text-muted font-mono space-y-1">
              <div>Agreed Price: ₹{tx.agreed_price}/qtl • Quantity: {tx.quantity} kg • Total: ₹{tx.total_amount}</div>
              <div>Created: {new Date(tx.created_at).toLocaleString()}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(NEXT_TRANSITION[tx.status] || []).map(next => (
                <Button key={next} size="sm" variant="outline" onClick={() => handleUpdateTransactionStatus(tx.id, next, tx.status)}>{t('farmerPage.markStatus', { status: next })}</Button>
              ))}
              <Button size="sm" variant="destructive" onClick={() => handleOpenDispute(tx.id)}>{t('farmerPage.openDispute')}</Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderShipmentsTab = () => {
    if (shipmentsLoading) return <LoadingState message={t('farmerPage.shipments.loading')} />;
    if (shipmentsError) return <ErrorState title={t('farmerPage.shipments.loadError')} message={shipmentsError} onRetry={fetchShipments} />;
    if (shipments.length === 0) return <EmptyState icon={<Truck className="w-6 h-6" />} title={t('farmerPage.shipments.noShipments')} description={t('farmerPage.shipments.noShipmentsDescription')} />;

    return (
      <div className="space-y-4">
        {shipments.map(shipment => (
          <Card key={shipment.id} variant="default" title={`Shipment #${shipment.id}`} subtitle={`Transaction #${shipment.transaction_id}`} headerAction={<StatusBadge status={['delivered', 'payment_pending', 'completed'].includes(shipment.status) ? 'completed' : 'active'} label={shipment.status} size="sm" />}>
            <div className="text-xs text-text-muted font-mono space-y-1">
              <div>Pickup: {shipment.pickup_location} • Delivery: {shipment.delivery_location}</div>
              {shipment.transporter_name && <div>Transporter: {shipment.transporter_name} • Vehicle: {shipment.vehicle_number}</div>}
              {shipment.estimated_pickup && <div>Est. Pickup: {new Date(shipment.estimated_pickup).toLocaleString()}</div>}
              {shipment.estimated_delivery && <div>Est. Delivery: {new Date(shipment.estimated_delivery).toLocaleString()}</div>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {shipment.status !== 'completed' && (NEXT_SHIPMENT_TRANSITION[shipment.status] || []).map(next => (
                <Button key={next} size="sm" variant="outline" onClick={() => handleUpdateShipmentStatus(shipment.id, next)}>{t('farmerPage.markStatus', { status: next })}</Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderPaymentsTab = () => {
    if (paymentsLoading) return <LoadingState message={t('farmerPage.payments.loading')} />;
    if (paymentsError) return <ErrorState title={t('farmerPage.payments.loadError')} message={paymentsError} onRetry={fetchPayments} />;
    if (payments.length === 0) return <EmptyState icon={<Wallet className="w-6 h-6" />} title={t('farmerPage.payments.noPayments')} description={t('farmerPage.payments.noPaymentsDescription')} />;

    return (
      <div className="space-y-4">
        {payments.map(payment => (
          <Card key={payment.id} variant="default" title={`Payment #${payment.id}`} subtitle={`Transaction #${payment.transaction_id}`} headerAction={<StatusBadge status={payment.status === 'completed' ? 'completed' : 'active'} label={payment.status} size="sm" />}>
            <div className="text-xs text-text-muted font-mono space-y-1">
              <div>Amount: ₹{payment.amount.toLocaleString('en-IN')} • Method: {payment.payment_method || 'N/A'}</div>
              {payment.reference && <div>Reference: {payment.reference}</div>}
              {payment.confirmed_at && <div>Confirmed: {new Date(payment.confirmed_at).toLocaleString()}</div>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['processing', 'completed', 'failed'].map(next => (
                <Button key={next} size="sm" variant="outline" onClick={() => handleUpdatePaymentStatus(payment.id, next)}>{t('farmerPage.markStatus', { status: next })}</Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderDisputesTab = () => {
    if (disputesLoading) return <LoadingState message={t('farmerPage.disputes.loading')} />;
    if (disputesError) return <ErrorState title={t('farmerPage.disputes.loadError')} message={disputesError} onRetry={fetchDisputes} />;
    if (disputes.length === 0) return <EmptyState icon={<AlertTriangle className="w-6 h-6" />} title={t('farmerPage.disputes.noDisputes')} description={t('farmerPage.disputes.noDisputesDescription')} />;

    return (
      <div className="space-y-4">
        {disputes.map(dispute => (
          <Card key={dispute.id} variant="default" title={`Dispute #${dispute.id}`} subtitle={`Transaction #${dispute.transaction_id} • Priority: ${dispute.priority}`} headerAction={<StatusBadge status="dispute" label={dispute.status} size="sm" />}>
            <div className="text-xs text-text-muted font-mono space-y-1">
              <div>Reason: {dispute.reason}</div>
              {dispute.description && <div>Description: {dispute.description}</div>}
              <div>Opened: {new Date(dispute.created_at).toLocaleString()}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['under_review', 'resolved'].map(next => (
                <Button key={next} size="sm" variant="outline" onClick={() => requestConfirm(`${t('farmerPage.markStatus', { status: next })}?`, async () => {
                  try {
                    await apiRequest(`/disputes/${dispute.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next, resolution_notes: 'Updated from farmer dashboard' }) }, token!);
                    await fetchDisputes();
                  } catch (err) {
                    setDisputesError(err instanceof Error ? err.message : 'Failed to update dispute');
                  }
                })}>{t('farmerPage.markStatus', { status: next })}</Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <AppShell forcedRole="farmer" activeSubTab={activeTab} onSelectSubTab={(path) => { setSelectedLotId(null); setActiveTab(path as TabId); }}>
      <MobileStack spacing="md">
        <PageHeader
          title={t('farmerPage.pageTitle')}
          subtitle={t('farmerPage.pageSubtitle')}
          roleBadge={<StatusBadge status="active" label={t('nav.farmerMode')} size="sm" />}
          statusBadge={<SyncStatus state="Synced" lastSyncedTime="2m ago" />}
          primaryAction={
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsLotDrawerOpen(true)}>
              {t('farmerPage.addProduceLot')}
            </Button>
          }
        />

        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => { setSelectedLotId(null); setActiveTab(id as TabId); }} />

        {activeTab === '/farmer' && renderDecisionHome()}
        {activeTab === '/farmer/market' && renderMarketTab()}
        {activeTab === '/farmer/lots' && renderLotsTab()}
        {activeTab === '/farmer/offers' && renderOffersTab()}
        {activeTab === '/farmer/transactions' && renderTransactionsTab()}
        {activeTab === '/farmer/shipments' && renderShipmentsTab()}
        {activeTab === '/farmer/payments' && renderPaymentsTab()}
        {activeTab === '/farmer/disputes' && renderDisputesTab()}
      </MobileStack>

      <Drawer isOpen={isLotDrawerOpen} onClose={() => setIsLotDrawerOpen(false)} title={t('farmerPage.createProduceLot')} description={t('farmerPage.createProduceLotDescription')} position="bottom">
        <div className="space-y-4">
          {lotSubmitError && (
            <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/30 text-xs text-status-error">
              {lotSubmitError}
            </div>
          )}

          <Select
            label={t('farmerPage.lotForm.cropCommodity')}
            helperText={t('farmerPage.lotForm.selectCropHelper')}
            error={lotFormErrors.crop}
            options={[
              { value: '', label: 'Select crop...', disabled: true },
              ...commodities.map(c => ({ value: String(c.id), label: c.name })),
            ]}
            value={lotCrop}
            onChange={(e) => {
              setLotCrop(e.target.value);
              setLotFormErrors(prev => ({ ...prev, crop: '' }));
            }}
            disabled={lotSubmitting}
          />

          <Input
            label={t('farmerPage.lotForm.quantity')}
            helperText={t('farmerPage.lotForm.quantityHelper')}
            error={lotFormErrors.quantity}
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1000"
            value={lotQuantity}
            onChange={(e) => {
              setLotQuantity(e.target.value);
              setLotFormErrors(prev => ({ ...prev, quantity: '' }));
            }}
            disabled={lotSubmitting}
          />

          <Input
            label={t('farmerPage.lotForm.qualityGrade')}
            helperText={t('farmerPage.lotForm.qualityGradeHelper')}
            error={lotFormErrors.qualityGrade}
            placeholder="e.g. Grade A"
            value={lotQualityGrade}
            onChange={(e) => {
              setLotQualityGrade(e.target.value);
              setLotFormErrors(prev => ({ ...prev, qualityGrade: '' }));
            }}
            disabled={lotSubmitting}
          />

          <Input
            label={t('farmerPage.lotForm.moisture')}
            helperText={t('common.optional')}
            error={lotFormErrors.moisture}
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 12.5"
            value={lotMoisture}
            onChange={(e) => {
              setLotMoisture(e.target.value);
              setLotFormErrors(prev => ({ ...prev, moisture: '' }));
            }}
            disabled={lotSubmitting}
          />

          <Input
            label={t('farmerPage.lotForm.harvestDate')}
            helperText={t('common.optional')}
            error={lotFormErrors.harvestDate}
            type="date"
            value={lotHarvestDate}
            onChange={(e) => {
              setLotHarvestDate(e.target.value);
              setLotFormErrors(prev => ({ ...prev, harvestDate: '' }));
            }}
            disabled={lotSubmitting}
          />

          <Input
            label={t('farmerPage.lotForm.location')}
            helperText={t('common.optional')}
            error={lotFormErrors.location}
            placeholder="e.g. Nashik"
            value={lotLocation}
            onChange={(e) => {
              setLotLocation(e.target.value);
              setLotFormErrors(prev => ({ ...prev, location: '' }));
            }}
            disabled={lotSubmitting}
          />

          <Input
            label={t('farmerPage.lotForm.expectedPrice')}
            helperText={t('farmerPage.lotForm.expectedPriceHelper')}
            error={lotFormErrors.expectedPrice}
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 24.00"
            value={lotExpectedPrice}
            onChange={(e) => {
              setLotExpectedPrice(e.target.value);
              setLotFormErrors(prev => ({ ...prev, expectedPrice: '' }));
            }}
            disabled={lotSubmitting}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={handleCreateLot}
              isLoading={lotSubmitting}
              disabled={lotSubmitting}
            >
              {t('farmerPage.createLot')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsLotDrawerOpen(false);
                setLotCrop('');
                setLotQuantity('');
                setLotQualityGrade('');
                setLotMoisture('');
                setLotHarvestDate('');
                setLotLocation('');
                setLotExpectedPrice('');
                setLotFormErrors({});
                setLotSubmitError(null);
              }}
              disabled={lotSubmitting}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Drawer>

      <Dialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title={t('farmerPage.confirmAction')} description={confirmMessage} maxWidth="sm" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => { confirmAction?.(); setIsConfirmOpen(false); }}>Confirm</Button>
        </div>
      }>
        <div />
      </Dialog>
    </AppShell>
  );
};
