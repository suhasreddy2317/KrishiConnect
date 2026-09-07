import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileStack } from '@/components/layout/MobileStack';
import { RecommendationCard } from '@/components/data-display/RecommendationCard';
import { MarketCard } from '@/components/data-display/MarketCard';
import { SyncStatus } from '@/components/status/SyncStatus';
import { StatusSteps } from '@/components/status/StatusSteps';
import { StatusBadge } from '@/components/status/StatusBadge';
import { LoadingState } from '@/components/data-display/LoadingState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Drawer } from '@/components/ui/Drawer';
import { Dialog } from '@/components/ui/Dialog';
import { Plus, HelpCircle, Truck, Wallet, AlertTriangle, Package, Clock, CheckCircle2 } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

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
  const [activeTab, setActiveTab] = useState<TabId>('/farmer');
  const [isLotDrawerOpen, setIsLotDrawerOpen] = useState(false);
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

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: '/farmer', label: 'Decision Home' },
    { id: '/farmer/market', label: 'Nearby Mandis' },
    { id: '/farmer/lots', label: 'My Lots', count: lots.length || undefined },
    { id: '/farmer/offers', label: 'Offers', count: offers.length || undefined },
    { id: '/farmer/transactions', label: 'Transactions', count: transactions.length || undefined },
    { id: '/farmer/shipments', label: 'Shipments', count: shipments.length || undefined },
    { id: '/farmer/payments', label: 'Payments', count: payments.length || undefined },
    { id: '/farmer/disputes', label: 'Disputes', count: disputes.length || undefined },
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
      const data = await apiRequest<BackendShipment[]>('/shipments/', { method: 'GET' }, token);
      setShipments(data);
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

  const requestConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setIsConfirmOpen(true);
  };

  const handleAcceptOffer = async (offer: BackendOffer) => {
    if (!token) return;
    requestConfirm(`Accept offer of ₹${offer.offered_price}/qtl for ${offer.quantity} units?`, async () => {
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
        await fetchShipments();
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
    const bestLot = lots.find(l => l.status === 'published') || lots[0];
    const activeTransaction = transactions[0];

    return (
      <div className="space-y-6">
        {isDemoNoticeVisible && (
          <div className="p-3 rounded-xl bg-surface-raised border border-border/40 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-status-warning">Demo Data Notice</span>
              <p className="text-xs text-text-muted">Market intelligence and recommendation cards show seeded demo data. Backend APIs require commodity/market IDs to be selected.</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setIsDemoNoticeVisible(false)}>Dismiss</Button>
          </div>
        )}

        <div className="p-4 rounded-xl bg-surface border border-accent/30 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-surface-raised text-accent shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-accent">Farmer Operating Principle</span>
            <h2 className="text-lg font-semibold text-text-main">"What should I do right now, and why?"</h2>
            <p className="text-xs text-text-muted">Every recommendation below is inspectable with plain-language market factors.</p>
          </div>
        </div>

        <RecommendationCard
          cropName={bestLot ? bestLot.crop : 'Red Onion (Nashik)'}
          verdict="SELL NOW"
          score={84}
          headline="Current mandi price is 14% above 30-day historical average."
          timestamp="Demo data • Updated 15 mins ago"
          reasons={[
            { title: 'Price Velocity', impact: 'positive', description: 'Modal price rose ₹180/qtl in the last 72 hours across 3 nearby mandis.' },
            { title: 'Arrival Pressure', impact: 'neutral', description: 'Arrival volumes are projected to surge 35% next week, which may dampen prices.' },
            { title: 'Storage Cost Risk', impact: 'negative', description: 'Holding beyond 7 days incurs 3.2% moisture weight loss risk at local ambient storage.' },
          ]}
          onPrimaryAction={() => setIsLotDrawerOpen(true)}
          primaryActionLabel="List Produce Lot"
        />

        {activeTransaction && (
          <Card variant="default" title={`Active Transaction: Lot #KC-${activeTransaction.lot_id}`} subtitle={`Transaction #${activeTransaction.id}`} headerAction={<StatusBadge status="verified-buyer" label={activeTransaction.status} size="sm" />}>
            <StatusSteps
              steps={[
                { id: '1', label: 'Offer Accepted', sublabel: `₹${activeTransaction.agreed_price}/qtl`, status: 'complete' },
                { id: '2', label: 'Confirmed', sublabel: activeTransaction.confirmed_at ? new Date(activeTransaction.confirmed_at).toLocaleDateString() : '—', status: activeTransaction.status === 'confirmed' || activeTransaction.status === 'dispatched' || activeTransaction.status === 'in_transit' || activeTransaction.status === 'delivered' || activeTransaction.status === 'payment_pending' || activeTransaction.status === 'completed' ? 'complete' : 'pending' },
                { id: '3', label: 'Dispatched', sublabel: '—', status: ['dispatched', 'in_transit', 'delivered', 'payment_pending', 'completed'].includes(activeTransaction.status as any) ? 'complete' : 'pending' },
                { id: '4', label: 'Delivered', sublabel: '—', status: ['delivered', 'payment_pending', 'completed'].includes(activeTransaction.status as any) ? 'complete' : 'pending' },
                { id: '5', label: 'Payment', sublabel: '—', status: activeTransaction.status === 'completed' ? 'complete' : 'pending' },
              ]}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {(NEXT_TRANSITION[activeTransaction.status] || []).map(next => (
                <Button key={next} size="sm" variant="outline" onClick={() => handleUpdateTransactionStatus(activeTransaction.id, next, activeTransaction.status)}>Mark {next}</Button>
              ))}
              {activeTransaction.status !== 'completed' && (
                <Button size="sm" variant="destructive" onClick={() => handleOpenDispute(activeTransaction.id)}>Open Dispute</Button>
              )}
            </div>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-main">Nearby Mandi Price Benchmarks</h3>
              <p className="text-xs text-text-muted">Comparing prices within 40 km economic transport radius.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('/farmer/market')}>View All Mandis</Button>
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
    if (lotsLoading) return <LoadingState message="Loading your produce lots..." />;
    if (lotsError) return <ErrorState title="Unable to load lots" message={lotsError} onRetry={fetchLots} />;
    if (lots.length === 0) return <EmptyState icon={<Package className="w-6 h-6" />} title="No lots published" description="Create a produce lot to start receiving buyer offers and matches." actionLabel="Create Lot" onAction={() => setIsLotDrawerOpen(true)} />;

    const farmerLots = lots;
    return (
      <div className="space-y-4">
        {farmerLots.map(lot => (
          <Card key={lot.id} variant="default" title={lot.crop} subtitle={`${lot.quantity_kg} ${lot.unit} • Grade ${lot.quality_grade}`} headerAction={<StatusBadge status="grade" label={lot.quality_grade} size="sm" />}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-text-muted font-mono">Lot ID: #{lot.id} • Status: {lot.status} {lot.harvest_date ? `• Harvest: ${lot.harvest_date}` : ''} {lot.location ? `• ${lot.location}` : ''}</div>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('/farmer/offers')}>View Offers</Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderOffersTab = () => {
    if (offersLoading) return <LoadingState message="Loading buyer offers..." />;
    if (offersError) return <ErrorState title="Unable to load offers" message={offersError} onRetry={fetchOffers} />;
    if (offers.length === 0) return <EmptyState icon={<Clock className="w-6 h-6" />} title="No offers yet" description="Published lots will receive structured buyer offers with 48h locking expiry." />;

    return (
      <div className="space-y-3">
        {offers.map(offer => (
          <div key={offer.id} className="p-4 rounded-lg bg-surface-raised border border-status-success/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-text-main">Buyer Offer #{offer.id}</span>
                <StatusBadge status={offer.status === 'accepted' ? 'verified-buyer' : offer.status === 'rejected' ? 'warning' : 'pending-verification'} label={offer.status} size="sm" />
              </div>
              <div className="text-xs text-text-muted mt-1 font-mono">
                Offer: <span className="text-accent font-bold">₹{offer.offered_price} / qtl</span> • {offer.quantity} units • Lot #{offer.lot_id} • Round {offer.round}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {offer.status !== 'accepted' && offer.status !== 'rejected' && offer.status !== 'expired' && offer.round % 2 === 1 && (
                <>
                  <Button size="sm" variant="primary" onClick={() => handleAcceptOffer(offer)}>Accept Offer</Button>
                  <Button size="sm" variant="outline" onClick={() => handleCounterOffer(offer)}>Counter</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleRejectOffer(offer)}>Reject</Button>
                </>
              )}
              {offer.status === 'accepted' && <Button size="sm" variant="ghost" onClick={() => setActiveTab('/farmer/transactions')}>View Transaction</Button>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTransactionsTab = () => {
    if (transactionsLoading) return <LoadingState message="Loading transactions..." />;
    if (transactionsError) return <ErrorState title="Unable to load transactions" message={transactionsError} onRetry={fetchTransactions} />;
    if (transactions.length === 0) return <EmptyState icon={<CheckCircle2 className="w-6 h-6" />} title="No transactions" description="Accepted offers become transactions with full settlement tracking." />;

    return (
      <div className="space-y-4">
        {transactions.map(tx => (
          <Card key={tx.id} variant="default" title={`Transaction #${tx.id}`} subtitle={`Lot #${tx.lot_id} • Buyer #${tx.buyer_id}`} headerAction={<StatusBadge status={tx.status === 'completed' ? 'completed' : 'active'} label={tx.status} size="sm" />}>
            <div className="text-xs text-text-muted font-mono space-y-1">
              <div>Agreed Price: ₹{tx.agreed_price}/qtl • Quantity: {tx.quantity} • Total: ₹{tx.total_amount}</div>
              <div>Created: {new Date(tx.created_at).toLocaleString()}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(NEXT_TRANSITION[tx.status] || []).map(next => (
                <Button key={next} size="sm" variant="outline" onClick={() => handleUpdateTransactionStatus(tx.id, next, tx.status)}>Mark {next}</Button>
              ))}
              <Button size="sm" variant="destructive" onClick={() => handleOpenDispute(tx.id)}>Open Dispute</Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderShipmentsTab = () => {
    if (shipmentsLoading) return <LoadingState message="Loading shipments..." />;
    if (shipmentsError) return <ErrorState title="Unable to load shipments" message={shipmentsError} onRetry={fetchShipments} />;
    if (shipments.length === 0) return <EmptyState icon={<Truck className="w-6 h-6" />} title="No shipments" description="Shipments are created after offer acceptance and transaction confirmation." />;

    return (
      <div className="space-y-4">
        {shipments.map(shipment => (
          <Card key={shipment.id} variant="default" title={`Shipment #${shipment.id}`} subtitle={`Transaction #${shipment.transaction_id}`} headerAction={<StatusBadge status={shipment.status === 'delivered' ? 'completed' : 'active'} label={shipment.status} size="sm" />}>
            <div className="text-xs text-text-muted font-mono space-y-1">
              <div>Pickup: {shipment.pickup_location} • Delivery: {shipment.delivery_location}</div>
              {shipment.transporter_name && <div>Transporter: {shipment.transporter_name} • Vehicle: {shipment.vehicle_number}</div>}
              {shipment.estimated_pickup && <div>Est. Pickup: {new Date(shipment.estimated_pickup).toLocaleString()}</div>}
              {shipment.estimated_delivery && <div>Est. Delivery: {new Date(shipment.estimated_delivery).toLocaleString()}</div>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['picked_up', 'in_transit', 'delivered'].map(next => (
                <Button key={next} size="sm" variant="outline" onClick={() => handleUpdateShipmentStatus(shipment.id, next)}>Mark {next}</Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderPaymentsTab = () => {
    if (paymentsLoading) return <LoadingState message="Loading payments..." />;
    if (paymentsError) return <ErrorState title="Unable to load payments" message={paymentsError} onRetry={fetchPayments} />;
    if (payments.length === 0) return <EmptyState icon={<Wallet className="w-6 h-6" />} title="No payments" description="Payments are initiated after delivery confirmation." />;

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
                <Button key={next} size="sm" variant="outline" onClick={() => handleUpdatePaymentStatus(payment.id, next)}>Mark {next}</Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderDisputesTab = () => {
    if (disputesLoading) return <LoadingState message="Loading disputes..." />;
    if (disputesError) return <ErrorState title="Unable to load disputes" message={disputesError} onRetry={fetchDisputes} />;
    if (disputes.length === 0) return <EmptyState icon={<AlertTriangle className="w-6 h-6" />} title="No disputes" description="Disputes can be opened if delivery or quality does not match agreed terms." />;

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
                <Button key={next} size="sm" variant="outline" onClick={() => requestConfirm(`Update dispute status to ${next}?`, async () => {
                  try {
                    await apiRequest(`/disputes/${dispute.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next, resolution_notes: 'Updated from farmer dashboard' }) }, token!);
                    await fetchDisputes();
                  } catch (err) {
                    setDisputesError(err instanceof Error ? err.message : 'Failed to update dispute');
                  }
                })}>Mark {next}</Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <AppShell forcedRole="farmer" activeSubTab={activeTab} onSelectSubTab={(path) => setActiveTab(path as TabId)}>
      <MobileStack spacing="md">
        <PageHeader
          title="Farmer Decision Workspace"
          subtitle="Daily harvest timing, net realized prices, and verified buyer matching."
          roleBadge={<StatusBadge status="active" label="Farmer Mode" size="sm" />}
          statusBadge={<SyncStatus state="Synced" lastSyncedTime="2m ago" />}
          primaryAction={
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsLotDrawerOpen(true)}>
              Add Produce Lot
            </Button>
          }
        />

        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabId)} />

        {activeTab === '/farmer' && renderDecisionHome()}
        {activeTab === '/farmer/market' && renderMarketTab()}
        {activeTab === '/farmer/lots' && renderLotsTab()}
        {activeTab === '/farmer/offers' && renderOffersTab()}
        {activeTab === '/farmer/transactions' && renderTransactionsTab()}
        {activeTab === '/farmer/shipments' && renderShipmentsTab()}
        {activeTab === '/farmer/payments' && renderPaymentsTab()}
        {activeTab === '/farmer/disputes' && renderDisputesTab()}
      </MobileStack>

      <Drawer isOpen={isLotDrawerOpen} onClose={() => setIsLotDrawerOpen(false)} title="Create Produce Lot" description="Provide crop specifications, estimated quantity, and provisional photos." position="bottom">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-surface border border-border space-y-2 text-xs text-text-muted">
            <p>In accordance with Phase 1 Foundation, lot submission business logic will be integrated in Phase 3.</p>
            <p className="text-accent">Form controls, touch targets, and offline sync caching are ready in this UI shell.</p>
          </div>
          <Button variant="secondary" fullWidth onClick={() => setIsLotDrawerOpen(false)}>Close Drawer</Button>
        </div>
      </Drawer>

      <Dialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirm Action" description={confirmMessage} maxWidth="sm" footer={
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
