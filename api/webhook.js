import admin from "firebase-admin";

function getFirebasePrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY || "";
  return key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getFirebasePrivateKey()
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).send("ok");
    }

    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      return res.status(200).send("sem payment id");
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    const pagamento = await mpResponse.json();

    if (pagamento.status !== "approved") {
      return res.status(200).send("pagamento não aprovado");
    }

    let referencia = {};

    try {
      referencia = JSON.parse(pagamento.external_reference || "{}");
    } catch (e) {
      return res.status(200).send("referência inválida");
    }

    const uid = referencia.uid;
    const plano = referencia.plano;

    if (!uid || !plano) {
      return res.status(200).send("uid/plano ausente");
    }

    const dias = plano === "anual" ? 365 : 30;

    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + dias);

    const vencimentoFormatado = vencimento.toISOString().split("T")[0];

    await admin.database().ref("usuarios/" + uid).update({
      status: "ativo",
      plano: plano,
      vencimento: vencimentoFormatado,
      ultimoPagamentoId: String(paymentId),
      atualizadoEm: new Date().toISOString()
    });

    return res.status(200).send("ok");

  } catch (error) {
    console.error("Erro webhook:", error);
    return res.status(200).send("erro tratado");
  }
}
