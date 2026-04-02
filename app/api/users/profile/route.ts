import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { connectToDatabase } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { companyName, address, gstin, phone } = data;

    if (!companyName || !address) {
      return NextResponse.json(
        { error: "Company Name and Address are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedUser = await UserModel.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: {
          companyName,
          address,
          gstin,
          phone,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found in DB." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findOne({ clerkId: userId }).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
