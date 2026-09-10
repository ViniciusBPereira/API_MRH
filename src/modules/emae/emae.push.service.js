import webpush from "web-push";

class EmaePushService {
  constructor() {
    this.subscriptions = new Map();

    const publicKey =
      process.env.VAPID_PUBLIC_KEY;

    const privateKey =
      process.env.VAPID_PRIVATE_KEY;

    const subject =
      process.env.VAPID_SUBJECT;

    if (
      publicKey &&
      privateKey &&
      subject
    ) {
      webpush.setVapidDetails(
        subject,
        publicKey,
        privateKey,
      );

      console.log(
        "✅ EMAE Web Push configurado.",
      );
    } else {
      console.warn(
        "⚠️ Chaves VAPID não configuradas.",
      );
    }
  }

  getPublicKey() {
    return process.env.VAPID_PUBLIC_KEY;
  }

  subscribe(subscription) {
    if (
      !subscription?.endpoint
    ) {
      throw new Error(
        "Subscription inválida.",
      );
    }

    this.subscriptions.set(
      subscription.endpoint,
      subscription,
    );

    console.log(
      `🔔 EMAE subscription registrada. Total: ${this.subscriptions.size}`,
    );

    return {
      total:
        this.subscriptions.size,
    };
  }

  unsubscribe(endpoint) {
    if (!endpoint) {
      return false;
    }

    return this.subscriptions.delete(
      endpoint,
    );
  }

  async sendNotification(payload) {
    const subscriptions =
      Array.from(
        this.subscriptions.values(),
      );

    if (
      subscriptions.length === 0
    ) {
      console.log(
        "🔕 Nenhum navegador inscrito.",
      );

      return {
        enviados: 0,
        removidos: 0,
      };
    }

    let enviados = 0;
    let removidos = 0;

    const body =
      JSON.stringify(payload);

    for (
      const subscription
      of subscriptions
    ) {
      try {
        await webpush.sendNotification(
          subscription,
          body,
        );

        enviados += 1;
      } catch (error) {
        console.error(
          "Erro Web Push:",
          error.statusCode ||
            error.message,
        );

        if (
          error.statusCode === 404 ||
          error.statusCode === 410
        ) {
          this.subscriptions.delete(
            subscription.endpoint,
          );

          removidos += 1;
        }
      }
    }

    return {
      enviados,
      removidos,
      inscritos:
        this.subscriptions.size,
    };
  }
}

export default new EmaePushService();
