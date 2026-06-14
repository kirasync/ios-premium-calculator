export type Operator = '+' | '-' | '×' | '÷' | null;

export interface CalculationState {
  currentValue: string;
  previousValue: string | null;
  operator: Operator;
  isFinished: boolean;
  expression: string;
}

export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay';

export interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
}
