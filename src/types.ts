export interface EquipmentSpecs {
  name: string;
  category: string;
  price: number;
  image: string;
  id: string;
  description: string;
  specs: {
    materials: string;
    loadRating: string;
    dimensions: string;
    coating: string;
  };
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface RackConfiguration {
  finish: { id: string; name: string; hex: string; price: number };
  pullUp: { id: string; name: string; price: number };
  pulley: { id: string; name: string; price: number };
  attachments: string[];
}

export interface TelemetrySimulation {
  exercise: string;
  weight: number;
  reps: number;
  spineAngle: number; // 0 to 45 deg spinal flexion
  velocity: number; // m/s
  barPathScore: number; // 0 to 100
}

export interface OrderItem {
  product: EquipmentSpecs;
  qty: number;
  customizations?: {
    finish?: string;
    pullUp?: string;
    pulley?: string;
    attachments?: string[];
  };
  customPrice?: number;
}
