"use client";

import { useState } from "react";
import { toast } from "sonner";

type InvoiceActionsProps = {
  invoiceId: string;
  invoiceNumber: string;
  buyerEmail?: string;
};

async function parseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload?.error) {
      return payload.error;
    }
  } catch {
    // Ignore JSON parse failures and fallback to generic message.
  }
  return "Request failed.";
}

export default function InvoiceActions({
  invoiceId,
  invoiceNumber,
  buyerEmail,
}: InvoiceActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const downloadPdf = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/invoice/${invoiceId}?format=pdf`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success(`Downloaded ${invoiceNumber}.pdf`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to download PDF.";
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const sendEmail = async () => {
    if (!buyerEmail) {
      toast.error("Buyer email is missing for this invoice.");
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch(`/api/invoice/${invoiceId}?format=email`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const payload = (await response.json()) as { emailResult?: { message?: string } };
      toast.success(payload.emailResult?.message ?? "Invoice emailed successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send invoice email.";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void downloadPdf()}
        disabled={isDownloading}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDownloading ? "Downloading..." : "Download PDF"}
      </button>
      <button
        type="button"
        onClick={() => void sendEmail()}
        disabled={isSending || !buyerEmail}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        title={buyerEmail ? "Send invoice via email" : "Buyer email not available"}
      >
        {isSending ? "Sending..." : "Send Email"}
      </button>
    </div>
  );
}
