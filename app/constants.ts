import { ModeOfService, GoodsType } from './types';

export const INCLUSION_OPTIONS = [
    'Door to door service',
    'Packing',
    'Customs clearance at Origin',
    'Customs clearance at Destination',
    'Insurance',
    'Fumigation',
    'Certificate of Origin',
];

export const SERVICE_OPTIONS: ModeOfService[] = ['Sea Freight', 'Air Freight'];
export const GOODS_OPTIONS: GoodsType[] = ['Personal Goods', 'Commercial'];

export const DEFAULT_COUNTRY = 'India';
export const VOLUMETRIC_WEIGHT_DIVISOR = 5000;
export const QUOTE_VALIDITY_DAYS = 7;
