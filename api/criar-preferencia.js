export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { uid, plano } = req.body;

    if (!uid || !plano) {
      return res.status(400).json({ error: "UID e plano são obrigatórios." });
    }

    const planoConfig = {
      mensal: {
        titulo: "Plano Mensal Matrimap",
        valor: 34.9
      },
      anual: {
        titulo: "Plano Anual Matrimap",
        valor: 349
      }
    };

    const escolhido = planoConfig[plano];

    if (!escolhido) {
      return res.status(400).json({ error: "Plano inválido." });
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items: [
          {
            title: escolhido.titulo,
            quantity: 1,
            currency_id: "BRL",
            unit_price: escolhido.valor
          }
        ],
        external_reference: JSON.stringify({
          uid,
          plano
        }),
        back_urls: {
          success: "https://matrimap.vercel.app/mapa.html",
          failure: "https://matrimap.vercel.app/pagamento.html",
          pending: "https://matrimap.vercel.app/pagamento.html"
        },
        auto_return: "approved",
        notification_url: "https://matrimap.vercel.app/api/webhook"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "Erro ao criar preferência.",
        detalhe: data
      });
    }

    return res.status(200).json({
      init_point: data.init_point
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erro interno ao criar pagamento.",
      detalhe: error.message
    });
  }
}
