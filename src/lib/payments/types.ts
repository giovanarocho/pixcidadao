export interface PixCharge {
  idTransacaoPix: string;
  pixCopiaCola: string;
  expiraEm: string; // ISO date
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
