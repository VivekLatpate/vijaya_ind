import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { InvoiceModel } from "@/models/Invoice";
import { UserModel } from "@/models/User";
import { errorResponse } from "@/lib/api";
import { generateInvoicePdf } from "@/lib/invoice";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    await connectToDatabase();
    
    // Find the current buyer
    const user = await UserModel.findOne({ clerkId: userId }).lean();
    if (!user) return errorResponse("User not found", 404);

    const { id } = await params; // id here is orderId (e.g., ORD-00001)

    // Verify order belongs to the buyer
    const order = await OrderModel.findOne({ orderId: id, buyerId: user._id }).lean();
    if (!order) return errorResponse("Order not found or access denied.", 404);

    // Fetch the linked Invoice
    const invoice = await InvoiceModel.findOne({ orderId: order.orderId }).lean();
    
    if (!invoice) {
        return errorResponse("Invoice not yet generated for this order.", 404);
    }

    // Generate the PDF
    const pdf = await generateInvoicePdf(invoice, {
        name: user.name ?? "Buyer",
        email: user.email ?? "",
        companyName: user.companyName,
        address: user.address,
        gstin: user.gstin,
    });

    return new NextResponse(new Uint8Array(pdf), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        },
    });

  } catch (err: any) {
    console.error("Invoice Download Error:", err);
    return errorResponse("Failed to generate PDF invoice", 500);
  }
}
