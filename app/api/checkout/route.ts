import { auth } from "@clerk/nextjs/server";
import { errorResponse, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { createOrder } from "@/lib/business";
import { sendOrderConfirmationSMS } from "@/lib/sms";
import { PaymentStatus } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    await connectToDatabase();
    const user = await UserModel.findOne({ clerkId: userId }).lean();
    if (!user) {
      return errorResponse("User profile not found. Please complete onboarding.", 404);
    }

    const value = await request.json();
    const { products, paymentMethod, paymentStatus, address, notes, razorpayOrderId } = value;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return errorResponse("Cart is empty", 400);
    }

    const order = await createOrder({
      buyerId: user._id.toString(),
      products,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: (paymentStatus || "UNPAID") as PaymentStatus,
      address: address || user.address || "",
      notes: notes || "",
    });

    if (razorpayOrderId) {
      // Update the returned order with razorpay ID
      order.razorpayOrderId = razorpayOrderId;
      // We need to use findByIdAndUpdate if we want to save it, or just do it in the next step.
      // Assuming createOrder returns a Mongoose document or object. If object, we update manually:
      const { OrderModel } = await import("@/models/Order");
      await OrderModel.findByIdAndUpdate(order._id, { razorpayOrderId });
    }

    // Send SMS notification
    if (user.phone) {
      await sendOrderConfirmationSMS(user.phone, order.orderId, order.totalAmount);
    }

    return successResponse({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return errorResponse(error.message || "Failed to place order", 500);
  }
}
