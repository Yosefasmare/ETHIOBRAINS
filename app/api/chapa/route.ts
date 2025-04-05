import { NextResponse } from "next/server";
import axios from "axios";

interface ChapaRequestBody {
  amount: number;
  currency?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  tx_ref: string;
  callback_url: string;
}

interface ChapaResponse {
  status: string;
  message: string;
  data?: {
    checkout_url: string;
  };
}

export async function POST(req: Request) {
  try {
    const body: ChapaRequestBody = await req.json();

    if (!body.amount || !body.email || !body.first_name || !body.last_name || !body.tx_ref || !body.callback_url) {
      return NextResponse.json({ status: "error", message: "Missing required fields" }, { status: 400 });
    }

    const chapaResponse = await axios.post<ChapaResponse>(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: body.amount,
        currency: body.currency || "ETB",
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        tx_ref: body.tx_ref,
        callback_url: body.callback_url,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/account`,
        customizations: {
          title: "Payment for EthiBrain",
          description: "Changing Plan",
        },
        meta: {
          hide_receipt: "true",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(chapaResponse.data);
  } catch (error: any) {
    console.error("Chapa API error:", error.response?.data || error.message);
    return NextResponse.json({ status: "error", message: error.response?.data?.message || "Payment processing error" }, { status: 500 });
  }
}
