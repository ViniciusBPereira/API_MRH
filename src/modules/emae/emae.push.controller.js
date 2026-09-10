import EmaePushService
  from "./emae.push.service.js";

class EmaePushController {
  getPublicKey(req, res) {
    const publicKey =
      EmaePushService.getPublicKey();

    if (!publicKey) {
      return res.status(500).json({
        sucesso: false,
        mensagem:
          "VAPID_PUBLIC_KEY não configurada.",
      });
    }

    return res.json({
      sucesso: true,
      publicKey,
    });
  }

  subscribe(req, res) {
    try {
      const subscription =
        req.body;

      const result =
        EmaePushService.subscribe(
          subscription,
        );

      return res.json({
        sucesso: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        sucesso: false,
        mensagem:
          error.message,
      });
    }
  }

  unsubscribe(req, res) {
    const {
      endpoint,
    } = req.body;

    EmaePushService.unsubscribe(
      endpoint,
    );

    return res.json({
      sucesso: true,
    });
  }

  async test(req, res) {
    try {
      const result =
        await EmaePushService.sendNotification({
          title:
            "EMAE • SABARÁ",

          body:
            "Teste de notificação do monitoramento GPSVISTA.",

          icon:
            "/favicon.ico",

          url:
            "/emae/sabara",

          tipo:
            "TESTE",
        });

      return res.json({
        sucesso: true,
        ...result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        sucesso: false,
        mensagem:
          error.message,
      });
    }
  }
}

export default new EmaePushController();
