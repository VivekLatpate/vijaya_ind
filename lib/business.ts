import { CounterModel } from "@/models/Counter";
import { InvoiceModel } from "@/models/Invoice";
import { InventoryLogModel } from "@/models/InventoryLog";
import { LedgerModel } from "@/models/Ledger";
import { OrderModel, type OrderLineItem } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { UserModel } from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import {
  INVENTORY_CHANGE_TYPES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type InventoryChangeType,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/constants";
import { calculateBalanceDue, computePaymentStatus } from "@/lib/admin";

export async function createInventoryLog(params: {
  productId: string;
  changeType: InventoryChangeType;
  quantity: number;
  reason: string;
}) {
  return InventoryLogModel.create({
    productId: params.productId,
    changeType: params.changeType,
    quantity: params.quantity,
    reason: params.reason,
    date: new Date(),
  });
}

export async function adjustInventoryStock(params: {
  productId: string;
  quantity: number;
  changeType: InventoryChangeType;
  reason: string;
}) {
  await connectToDatabase();

  const product = await ProductModel.findById(params.productId);
  if (!product) {
    throw new Error("Product not found.");
  }

  const nextStock =
    params.changeType === INVENTORY_CHANGE_TYPES.IN
      ? product.stock + params.quantity
      : product.stock - params.quantity;

  if (nextStock < 0) {
    throw new Error(`Insufficient stock for ${product.name}.`);
  }

  product.stock = nextStock;
  await product.save();

  await createInventoryLog({
    productId: String(product._id),
    changeType: params.changeType,
    quantity: params.quantity,
    reason: params.reason,
  });

  return product.toObject();
}

export async function reserveOrderStock(products: OrderLineItem[], reason: string) {
  for (const item of products) {
    await adjustInventoryStock({
      productId: String(item.productId),
      quantity: item.quantity,
      changeType: INVENTORY_CHANGE_TYPES.OUT,
      reason,
    });
  }
}

export async function restoreOrderStock(products: OrderLineItem[], reason: string) {
  for (const item of products) {
    await adjustInventoryStock({
      productId: String(item.productId),
      quantity: item.quantity,
      changeType: INVENTORY_CHANGE_TYPES.IN,
      reason,
    });
  }
}

export async function nextSequence(prefix: string) {
  const counter = await CounterModel.findByIdAndUpdate(
    prefix,
    { $inc: { sequenceValue: 1 } },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  ).lean();

  const number = String(counter?.sequenceValue ?? 1).padStart(5, "0");
  return `${prefix}-${number}`;
}

export function calculateOrderTotals(products: OrderLineItem[]) {
  const subtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstAmount = products.reduce(
    (sum, item) => sum + (item.price * item.quantity * item.gstRate) / 100,
    0,
  );
  const totalAmount = subtotal + gstAmount;

  return { subtotal, gstAmount, totalAmount };
}

export async function ensureInvoiceForOrder(orderId: string) {
  await connectToDatabase();

  const existing = await InvoiceModel.findOne({ orderId }).lean();
  if (existing) {
    return existing;
  }

  const order = await OrderModel.findOne({ orderId }).lean();
  if (!order) {
    throw new Error("Order not found for invoice generation.");
  }

  const invoiceNumber = await nextSequence("INV");
  
  const buyerDoc = await UserModel.findById(order.buyerId).lean();
  const isIntraState = buyerDoc?.gstin?.startsWith("27") || false;
  
  const gstBreakup = isIntraState 
    ? {
        cgst: Number((order.gstAmount / 2).toFixed(2)),
        sgst: Number((order.gstAmount / 2).toFixed(2)),
        igst: 0,
      } 
    : {
        cgst: 0,
        sgst: 0,
        igst: Number(order.gstAmount.toFixed(2)),
      };

  return InvoiceModel.create({
    invoiceNumber,
    orderId: order.orderId,
    buyerId: order.buyerId,
    items: order.products.map((item) => ({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      gstRate: item.gstRate,
      lineTotal: Number((item.price * item.quantity).toFixed(2)),
    })),
    gstBreakup,
    totalAmount: order.totalAmount,
  });
}

export async function upsertLedgerForOrder(orderId: string) {
  await connectToDatabase();
  const order = await OrderModel.findOne({ orderId }).lean();
  if (!order) {
    throw new Error("Order not found.");
  }

  const existing = await LedgerModel.findOne({ orderId }).lean();
  const balanceDue = calculateBalanceDue(
    order.totalAmount,
    order.paymentStatus === PAYMENT_STATUSES.PAID ? order.totalAmount : 0,
  );
  const paymentStatus =
    order.paymentStatus === PAYMENT_STATUSES.PAID
      ? PAYMENT_STATUSES.PAID
      : balanceDue < order.totalAmount
        ? PAYMENT_STATUSES.PARTIAL
        : PAYMENT_STATUSES.UNPAID;

  if (existing) {
    return LedgerModel.findByIdAndUpdate(
      existing._id,
      {
        buyerId: order.buyerId,
        date: order.createdAt,
        products: order.products.map((item) => ({ name: item.name, qty: item.quantity })),
        billAmount: order.totalAmount,
        amountReceived:
          paymentStatus === PAYMENT_STATUSES.PAID ? order.totalAmount : existing.amountReceived,
        balanceDue:
          paymentStatus === PAYMENT_STATUSES.PAID
            ? 0
            : calculateBalanceDue(order.totalAmount, existing.amountReceived),
        paymentStatus:
          paymentStatus === PAYMENT_STATUSES.PAID
            ? PAYMENT_STATUSES.PAID
            : computePaymentStatus(order.totalAmount, existing.amountReceived),
      },
      { returnDocument: "after" },
    ).lean();
  }

  return LedgerModel.create({
    buyerId: order.buyerId,
    date: order.createdAt,
    orderId: order.orderId,
    entryId: await nextSequence("LED"),
    products: order.products.map((item) => ({ name: item.name, qty: item.quantity })),
    billAmount: order.totalAmount,
    amountReceived: paymentStatus === PAYMENT_STATUSES.PAID ? order.totalAmount : 0,
    balanceDue,
    paymentStatus,
    remarks: order.notes ?? "",
  });
}

export async function computeBuyerProfileMetrics(buyerId: string) {
  await connectToDatabase();

  const [orders, ledgers] = await Promise.all([
    OrderModel.find({ buyerId }).lean(),
    LedgerModel.find({ buyerId }).lean(),
  ]);

  const totalOrders = orders.length;
  const totalPurchaseAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const outstandingBalance = ledgers.reduce((sum, entry) => sum + entry.balanceDue, 0);
  const lastOrderDate = orders
    .map((order) => order.createdAt)
    .sort((a, b) => +new Date(b) - +new Date(a))[0] ?? null;

  return {
    totalOrders,
    totalPurchaseAmount,
    outstandingBalance,
    lastOrderDate,
  };
}

export async function createOrder(params: {
  buyerId: string;
  products: { productId: string; quantity: number }[];
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  address: string;
  notes: string;
}) {
  await connectToDatabase();

  const buyer = await UserModel.findById(params.buyerId).lean();
  if (!buyer || !buyer.isActive) {
    throw new Error("Buyer not found or inactive.");
  }

  const productDocs = await ProductModel.find({
    _id: { $in: params.products.map((item) => item.productId) },
  }).lean();

  const lineItems: OrderLineItem[] = params.products.map((item) => {
    const product = productDocs.find((productDoc) => String(productDoc._id) === item.productId);

    if (!product) {
      throw new Error("One or more products were not found.");
    }

    return {
      productId: String(product._id),
      name: product.name,
      sku: product.sku,
      price: product.price,
      gstRate: product.gstRate,
      quantity: item.quantity,
    };
  });

  const totals = calculateOrderTotals(lineItems);
  const orderId = await nextSequence("ORD");

  const order = await OrderModel.create({
    orderId,
    buyerId: params.buyerId,
    products: lineItems,
    totalAmount: totals.totalAmount,
    gstAmount: totals.gstAmount,
    status: ORDER_STATUSES.PLACED,
    paymentMethod: params.paymentMethod,
    paymentStatus: params.paymentStatus,
    address: params.address,
    notes: params.notes,
  });

  await reserveOrderStock(lineItems, `Order ${order.orderId} placed`);

  return order.toObject();
}

export async function updateOrderState(params: {
  id: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}) {
  await connectToDatabase();

  const order = await OrderModel.findById(params.id);
  if (!order) {
    return null;
  }

  const previousStatus = order.status;

  if (typeof params.status === "string") {
    order.status = params.status;
  }

  if (typeof params.paymentStatus === "string") {
    order.paymentStatus = params.paymentStatus;
  }

  if (typeof params.notes === "string") {
    order.notes = params.notes;
  }

  await order.save();

  if (previousStatus !== ORDER_STATUSES.CANCELLED && order.status === ORDER_STATUSES.CANCELLED) {
    await restoreOrderStock(order.products, `Order ${order.orderId} cancelled`);
  }

  if (previousStatus !== ORDER_STATUSES.CONFIRMED && order.status === ORDER_STATUSES.CONFIRMED) {
    await ensureInvoiceForOrder(order.orderId);
  }

  await upsertLedgerForOrder(order.orderId);

  return order.toObject();
}
