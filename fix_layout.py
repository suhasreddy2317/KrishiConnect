import re

with open('frontend/src/pages/BuyerPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the layout section start and end
start_marker = '        <div className="space-y-6">'
end_marker = '      </MobileStack>'

start_pos = content.find(start_marker)
end_pos = content.find(end_marker, start_pos)

if start_pos == -1 or end_pos == -1:
    print(f'Could not find markers: start={start_pos}, end={end_pos}')
    exit(1)

# The new layout text
new_layout = '''        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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

           <div className="space-y-6">
             <Section title="Match Radar" description="Top lots matching your active procurement profile.">
               {matchedLotsLoading && <LoadingState message="Finding matched lots..." />}
               {matchedLotsError && <ErrorState title="Unable to load matches" message={matchedLotsError} onRetry={retryMatchedLots} />}
               {!matchedLotsLoading && !matchedLotsError && matchedLotsData.length === 0 && (
                 <EmptyState title="No matching lots" description="No published lots currently match this demand's requirements." />
               )}
               {!matchedLotsLoading && !matchedLotsError && matchedLotsData.length > 0 && (
                 <div className="space-y-4">
                   {matchedLotsData.map((match) => {
                     const cropName = getCommodityName(match.commodity_id);
                     const gradeStatus = match.grade_compatibility === 'exact' ? 'trusted' : match.grade_compatibility === 'compatible' ? 'warning' : 'completed';
                     const gradeLabel = match.grade_compatibility === 'exact' ? 'Exact Match' : match.grade_compatibility === 'compatible' ? 'Compatible' : 'Incompatible';

                     return (
                       <Card key={match.lot_id} variant="raised" padding="md" className="space-y-3">
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

                         <div className="space-y-2 pt-1">
                           <ScoreBar value={match.match_score} label="Match Score" />
                           <div className="grid grid-cols-2 gap-2">
                             <ScoreBar value={match.quantity_fit} label="Qty Fit" />
                             <ScoreBar value={match.location_fit} label="Location Fit" />
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                             <ScoreBar value={match.urgency} label="Urgency" />
                             <ScoreBar value={match.buyer_confidence} label="Buyer Confidence" />
                           </div>
                         </div>

                         <div className="flex items-center justify-between pt-2 border-t border-border/60">
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
                           <div className="text-[10px] text-text-muted space-y-1 pt-1 border-t border-border/60">
                             <p className="font-medium text-text-main">Matching Reasons</p>
                             {match.reasons.map((reason, idx) => (
                               <p key={idx} className="leading-relaxed">• {reason}</p>
                             ))}
                           </div>
                         )}

                         {match.limitations.length > 0 && (
                           <div className="text-[10px] text-status-warning space-y-1">
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

             <Card variant="default" padding="md">
               <h3 className="text-sm font-semibold text-text-main mb-4">Trust Ledger</h3>
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
             </Card>
           </div>
         </div>'''

new_content = content[:start_pos] + new_layout + content[end_pos:]

with open('frontend/src/pages/BuyerPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Done')
