export interface PixCharge {
  idTransacaoPix: string;
  pixCopiaCola: string;
  expiraEm: string; // ISO date
  // Imagem do QR code real, em base64 (sem o prefixo "data:image/png;base64,").
  // Só vem preenchido no provedor real (Mercado Pago); no modo simulado fica
  // undefined, e o frontend mostra um QR ilustrativo no lugar.
  qrCodeBase64?: string;
}

export interface CreatePixChargeParams {
  saleId: string;
  valorCentavos: number;
  payerEmail?: string;
  notificationUrl?: string;
}

export interface PaymentProvider {
  createPixCharge(params: CreatePixChargeParams): Promise<PixCharge>;
}
