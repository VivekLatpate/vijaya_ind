export async function sendSMSOTP(phone: string, otp: string) {
  // Use MSG91 or Fast2SMS based on environment variables. 
  // For now, this acts as a placeholder or standard implementation.
  const apiKey = process.env.SMS_API_KEY; // your MSG91 / Fast2SMS API key
  
  console.log(`[SMS MOCK] Sending OTP ${otp} to phone number ${phone}`);
  
  if (!apiKey) {
    console.warn("[SMS WARNING] No SMS_API_KEY provided. Using mock.");
    return { success: true, message: "Mock OTP sent successfully" };
  }

  try {
    // Example MSG91 / Fast2SMS pseudo integration:
    /*
    const response = await fetch("https://www.demo-sms-url.com/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        to: phone,
        message: `Your OTP for Vijaya Industries registration is ${otp}. Please do not share this.`
      })
    });
    
    if (!response.ok) {
        throw new Error("Failed to send SMS")
    }
    */
    
    return { success: true, message: "OTP sent successfully" };
  } catch (error: any) {
    console.error("SMS Sending Error:", error);
    return { success: false, message: error.message };
  }
}

export async function sendOrderConfirmationSMS(phone: string, orderId: string, amount: number) {
  const apiKey = process.env.SMS_API_KEY;
  const bodyMessage = `Dear Customer, your order ${orderId} for Rs. ${amount} has been successfully placed with Vijaya Industries. Thank you for your business.`;

  console.log(`[SMS MOCK] Order Confirmation string: ${bodyMessage}`);

  if (!apiKey) {
    console.warn("[SMS WARNING] No SMS_API_KEY provided. Using mock.");
    return { success: true, message: "Mock SMS sent successfully" };
  }

  // Implementation to be added later when API Key is active
  return { success: true, message: "SMS sent successfully" };
}
