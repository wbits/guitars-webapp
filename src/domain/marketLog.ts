import { z } from 'zod';
import { CURRENCIES } from '@/domain/guitar';

export const MARKET_SOURCES = ['reverb', 'ebay', 'marktplaats'] as const;
export const MARKET_ACTIONS = ['for_sale', 'sold'] as const;

export const marketLogSchema = z.object({
  id: z.string().min(1),
  guitarId: z.string().min(1),
  observedAt: z.string().min(1),
  source: z.enum(MARKET_SOURCES),
  action: z.enum(MARKET_ACTIONS),
  priceAmount: z.number().int().min(0),
  priceCurrency: z.enum(CURRENCIES),
  listingUrl: z.string().optional(),
  listingTitle: z.string().optional(),
  externalListingId: z.string().optional(),
  listingImageUrl: z.string().url().optional(),
});

export type MarketLog = z.infer<typeof marketLogSchema>;

export const marketLogListSchema = z.array(marketLogSchema);
