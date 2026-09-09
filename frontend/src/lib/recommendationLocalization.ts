export type FactorType =
  | 'storage_access'
  | 'demand_signal'
  | 'price_trend'
  | 'perishability'
  | 'data_confidence';

export type FactorCondition = 'positive' | 'negative' | 'neutral';

export interface ParsedFactor {
  type: FactorType;
  condition: FactorCondition;
  values: Record<string, string | number>;
}

export interface LocalizedReason {
  title: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  factorType: FactorType;
  values: Record<string, string | number>;
}

const FACTOR_TYPE_MAP: Record<string, FactorType> = {
  storageaccess: 'storage_access',
  storage_access: 'storage_access',
  demandsignal: 'demand_signal',
  demand_signal: 'demand_signal',
  pricetrend: 'price_trend',
  price_trend: 'price_trend',
  perishability: 'perishability',
  dataconfidence: 'data_confidence',
  data_confidence: 'data_confidence',
};

export function getFactorType(name: string): FactorType {
  const key = name.toLowerCase().replace(/[\s-]+/g, '');
  return FACTOR_TYPE_MAP[key] || (name.toLowerCase() as FactorType);
}

export function detectCondition(
  detail: string,
  factorType: FactorType
): FactorCondition {
  const d = detail.toLowerCase();
  if (factorType === 'price_trend') {
    if (/trending up|rising|higher|improving/.test(d)) return 'positive';
    if (/trending down|falling|drop|declin/.test(d)) return 'negative';
    if (/stable/.test(d)) return 'neutral';
    return 'neutral';
  }
  if (factorType === 'demand_signal') {
    if (/active demand/.test(d)) return 'positive';
    if (/no active demand/.test(d)) return 'negative';
    return 'neutral';
  }
  if (factorType === 'storage_access') {
    if (/affordable|available storage/.test(d)) return 'positive';
    if (/costly|no suitable|immediate sale/.test(d)) return 'negative';
    if (/uncertain/.test(d)) return 'neutral';
    return 'neutral';
  }
  if (factorType === 'perishability') {
    if (/highly perishable|favoring quicker sale/.test(d)) return 'positive';
    if (/non-perishable|viable alternative/.test(d)) return 'neutral';
    return 'neutral';
  }
  if (factorType === 'data_confidence') {
    if (/sufficient|support this/.test(d)) return 'positive';
    if (/limited or stale|reduce confidence/.test(d)) return 'negative';
    if (/moderate|partially reliable/.test(d)) return 'neutral';
    return 'neutral';
  }
  return 'neutral';
}

function extractStorageValues(detail: string): Record<string, string | number> {
  const values: Record<string, string | number> = {};
  const priceMatch = detail.match(/₹(\d+(?:\.\d+)?)\/quintal/);
  if (priceMatch) {
    values.price = parseFloat(priceMatch[1]);
  }
  if (/affordable/i.test(detail)) {
    values.affordability = 'affordable';
  } else if (/costly/i.test(detail)) {
    values.affordability = 'costly';
  } else if (/uncertain/i.test(detail)) {
    values.affordability = 'uncertain';
  } else if (/no suitable|immediate sale/i.test(detail)) {
    values.affordability = 'none';
  }
  return values;
}

function extractDemandValues(detail: string): Record<string, string | number> {
  const values: Record<string, string | number> = {};
  const demandsMatch = detail.match(/(\d+)\s+active demand/);
  if (demandsMatch) {
    values.activeDemands = parseInt(demandsMatch[1], 10);
  }
  const qtyMatch = detail.match(/\((\d+)\s*kg\)/);
  if (qtyMatch) {
    values.quantityKg = parseInt(qtyMatch[1], 10);
  }
  const urgencyMatch = detail.match(/urgency\s+(\d+(?:\.\d+)?)%/);
  if (urgencyMatch) {
    values.urgencyPercent = parseFloat(urgencyMatch[1]);
  }
  if (/no active demand/i.test(detail)) {
    values.activeDemands = 0;
  }
  return values;
}

function extractPriceTrendValues(detail: string): Record<string, string | number> {
  const values: Record<string, string | number> = {};
  const pctMatch = detail.match(/(\d+(?:\.\d+)?)%/);
  if (pctMatch) {
    values.percentage = parseFloat(pctMatch[1]);
  }
  if (/trending up|rising/i.test(detail)) {
    values.direction = 'up';
  } else if (/trending down|falling|declin/i.test(detail)) {
    values.direction = 'down';
  } else if (/stable/i.test(detail)) {
    values.direction = 'stable';
  } else {
    values.direction = 'unknown';
  }
  return values;
}

function extractPerishabilityValues(detail: string): Record<string, string | number> {
  const values: Record<string, string | number> = {};
  if (/highly perishable/i.test(detail)) {
    values.level = 'high';
  } else if (/moderate perishability/i.test(detail)) {
    values.level = 'moderate';
  } else if (/non-perishable/i.test(detail)) {
    values.level = 'none';
  }
  const profileMatch = detail.match(/\(([^)]+)\)/);
  if (profileMatch) {
    values.profile = profileMatch[1];
  }
  return values;
}

function extractDataConfidenceValues(detail: string): Record<string, string | number> {
  const values: Record<string, string | number> = {};
  if (/sufficient/i.test(detail)) {
    values.level = 'sufficient';
  } else if (/moderate/i.test(detail)) {
    values.level = 'moderate';
  } else if (/limited or stale/i.test(detail)) {
    values.level = 'limited';
  }
  return values;
}

const EXTRACTORS: Record<FactorType, (detail: string) => Record<string, string | number>> = {
  storage_access: extractStorageValues,
  demand_signal: extractDemandValues,
  price_trend: extractPriceTrendValues,
  perishability: extractPerishabilityValues,
  data_confidence: extractDataConfidenceValues,
};

export function parseFactor(
  factor: Record<string, unknown>
): ParsedFactor | null {
  const name = String(factor.name || '');
  const detail = String(factor.detail || '');
  if (!name || !detail) return null;

  const type = getFactorType(name);
  const condition = detectCondition(detail, type);
  const values = EXTRACTORS[type](detail);

  return { type, condition, values };
}

export function buildFactorKey(
  type: FactorType,
  condition: FactorCondition
): string {
  const conditionSuffix =
    condition === 'positive' ? 'Available' : condition === 'negative' ? 'Unavailable' : '';
  const typeMap: Record<FactorType, string> = {
    storage_access: 'storage',
    demand_signal: 'demand',
    price_trend: 'priceTrend',
    perishability: 'perishability',
    data_confidence: 'dataConfidence',
  };
  const base = typeMap[type];
  if (!conditionSuffix) return base;
  return `${base}${conditionSuffix}`;
}

export function buildLocalizedReason(
  factor: Record<string, unknown>,
  t: (key: string, params?: Record<string, string | number>) => string,
  localizedCropName: string
): LocalizedReason | null {
  const parsed = parseFactor(factor);
  if (!parsed) return null;

  const factorKey = buildFactorKey(parsed.type, parsed.condition);
  const fullKey = `recommendationCard.reasons.${factorKey}`;
  const translated = t(fullKey);

  if (translated === fullKey) {
    return null;
  }

  const params: Record<string, string | number> = { crop: localizedCropName };
  for (const [k, v] of Object.entries(parsed.values)) {
    params[k] = v;
  }

  const description = t(fullKey, params);

  const titleMap: Record<FactorType, string> = {
    storage_access: 'recommendationCard.storageAccess',
    demand_signal: 'recommendationCard.demandSignal',
    price_trend: 'recommendationCard.priceTrend',
    perishability: 'recommendationCard.perishability',
    data_confidence: 'recommendationCard.dataConfidence',
  };
  const title = t(titleMap[parsed.type]);

  return {
    title,
    impact: parsed.condition === 'neutral' ? 'neutral' : parsed.condition,
    description,
    factorType: parsed.type,
    values: parsed.values,
  };
}
