export type AnalyticsEventMap = {
  page_view: { path: string; referrer?: string };
  product_impression: {
    product_id: string;
    position: number;
    category?: string;
  };
  product_click: { product_id: string; source: string };
  product_view: { product_id: string; name: string; price: number };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;
