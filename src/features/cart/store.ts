import { create } from "zustand";
import { persist } from "zustand/middleware";

// ═══════════════════════════════════════════════════
// 📦 Types
// ═══════════════════════════════════════════════════

export type FulfillmentType = "SHIPPING" | "PICKUP" | "DINE_IN";

export type CartModifier = {
  modifierId: string;
  groupId: string;
  name: string;
  priceDelta: number;
};

export type CartItem = {
  /** Stable identity: same product + same variant + same modifier set = same line */
  lineId: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl?: string;
  variantId: string | null;
  variantName: string | null;
  unitBasePrice: number;
  modifiers: CartModifier[];
  quantity: number;
  /** unitBasePrice + sum(modifiers.priceDelta) — recomputed on add */
  unitTotal: number;
};

type AddItemInput = {
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl?: string;
  variantId: string | null;
  variantName: string | null;
  unitBasePrice: number;
  modifiers: CartModifier[];
  quantity: number;
};

type CartState = {
  items: CartItem[];
  fulfillmentType: FulfillmentType;
  tableNumber: string | null;

  addItem: (input: AddItemInput) => void;
  removeLine: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;

  setFulfillmentType: (type: FulfillmentType) => void;
  setTableNumber: (tableNumber: string | null) => void;

  getItemCount: () => number;
  getSubtotal: () => number;
};

// ═══════════════════════════════════════════════════
// 🧮 Helpers
// ═══════════════════════════════════════════════════

/**
 * Two cart entries are the "same line" only if product, variant,
 * AND the exact set of modifiers match (order-independent).
 */
function buildLineId(
  productId: string,
  variantId: string | null,
  modifiers: CartModifier[],
): string {
  const modifierKey = modifiers
    .map((m) => m.modifierId)
    .sort()
    .join(",");
  return `${productId}:${variantId ?? "_"}:${modifierKey}`;
}

function computeUnitTotal(
  basePrice: number,
  modifiers: CartModifier[],
): number {
  const deltaSum = modifiers.reduce((sum, m) => sum + m.priceDelta, 0);
  return basePrice + deltaSum;
}

// ═══════════════════════════════════════════════════
// 🛒 Store
// ═══════════════════════════════════════════════════

/**
 * Currency safety note:
 * Cart totals use JS `number` (float) for UX speed. The server MUST
 * re-fetch product prices and recompute totals using Prisma `Decimal`
 * before creating an Order. Never trust client-computed totals.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      fulfillmentType: "SHIPPING",
      tableNumber: null,

      addItem: (input) =>
        set((state) => {
          const lineId = buildLineId(
            input.productId,
            input.variantId,
            input.modifiers,
          );
          const unitTotal = computeUnitTotal(
            input.unitBasePrice,
            input.modifiers,
          );
          const existing = state.items.find((i) => i.lineId === lineId);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === lineId
                  ? { ...i, quantity: i.quantity + input.quantity }
                  : i,
              ),
            };
          }

          const newItem: CartItem = {
            lineId,
            productId: input.productId,
            productName: input.productName,
            productSlug: input.productSlug,
            imageUrl: input.imageUrl,
            variantId: input.variantId,
            variantName: input.variantName,
            unitBasePrice: input.unitBasePrice,
            modifiers: input.modifiers,
            quantity: input.quantity,
            unitTotal,
          };

          return { items: [...state.items, newItem] };
        }),

      removeLine: (lineId) =>
        set((state) => ({
          items: state.items.filter((i) => i.lineId !== lineId),
        })),

      setQuantity: (lineId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.lineId !== lineId),
            };
          }
          return {
            items: state.items.map((i) =>
              i.lineId === lineId ? { ...i, quantity } : i,
            ),
          };
        }),

      clearCart: () =>
        set({
          items: [],
          fulfillmentType: "SHIPPING",
          tableNumber: null,
        }),

      setFulfillmentType: (type) => set({ fulfillmentType: type }),
      setTableNumber: (tableNumber) => set({ tableNumber }),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.unitTotal * item.quantity,
          0,
        ),
    }),
    {
      name: "nexus-cart-storage",
      version: 1,
    },
  ),
);