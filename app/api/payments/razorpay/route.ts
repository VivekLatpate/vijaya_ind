import { auth } from "@clerk/nextjs/server";
import { errorResponse, successResponse } from "@/lib/api";
import { getRazorpayClient, getRazorpayKeyId, getRazorpayKeySecret } from "@/lib/razorpay";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { updateOrderState } from "@/lib/business";
import { PAYMENT_STATUSES } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const { action, amount, receipt, razorpayPaymentId, razorpayOrderId, razorpaySignature, orderDocId } = await request.json();

    if (action === "create_order") {
      const razorpay = getRazorpayClient();

      // Create Razorpay Order
      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: receipt || "rcptid_11",
      };
      
      const order = await razorpay.orders.create(options);
      return successResponse({
        id: order.id,
        currency: order.currency,
        amount: order.amount,
        keyId: getRazorpayKeyId(),
      });
    } 
    
    if (action === "verify_payment") {
      // Verify Razorpay Signature
      const secret = getRazorpayKeySecret();
      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

      if (generated_signature !== razorpaySignature) {
        return errorResponse("Invalid signature", 400);
      }

      // Update Database
      await connectToDatabase();
      const updatedOrder = await OrderModel.findByIdAndUpdate(
        orderDocId, 
        { 
          razorpayPaymentId, 
          paymentStatus: PAYMENT_STATUSES.PAID 
        }, 
        { new: true }
      );
      
      if (updatedOrder) {
        // Trigger ledger and invoice updates if needed, since payment status changed
        await updateOrderState({ id: orderDocId, paymentStatus: PAYMENT_STATUSES.PAID });
      }

      return successResponse({ success: true, verified: true });
    }

    return errorResponse("Invalid action", 400);
  } catch (error: unknown) {
    console.error("Razorpay Error:", error);
    const message = error instanceof Error ? error.message : "Razorpay request failed";
    return errorResponse(message, 500);
  }
}
