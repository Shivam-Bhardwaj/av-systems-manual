import { VenueSpecifications } from './venue';
import { Equipment } from './equipment';
import { IntuitionResult } from '@/lib/intuition';

export interface SystemSpecification {
  id: string;
  projectName: string;
  createdAt: Date;
  updatedAt: Date;
  venue: VenueSpecifications;
  systems: {
    audio: AudioSystemSpec;
    video?: VideoSystemSpec;
    control?: ControlSystemSpec;
  };
  installation: InstallationSpec;
  budget: BudgetSummary;
  intuition?: IntuitionResult;
  notes?: string;
}

export interface AudioSystemSpec {
  speakers: {
    main: EquipmentSelection[];
    delay?: EquipmentSelection[];
    fill?: EquipmentSelection[];
    monitor?: EquipmentSelection[];
    subwoofer?: EquipmentSelection[];
  };
  amplifiers: EquipmentSelection[];
  mixers: EquipmentSelection[];
  microphones: {
    wired: EquipmentSelection[];
    wireless: EquipmentSelection[];
  };
  processing: EquipmentSelection[];
  accessories: EquipmentSelection[];
  calculations: {
    totalPower: number; // watts
    coverageMap?: CoveragePoint[];
    rt60Predicted: number;
    stiPredicted: number;
    splAverage: number;
    splPeak: number;
  };
}

export interface VideoSystemSpec {
  displays: EquipmentSelection[];
  projectors?: EquipmentSelection[];
  screens?: EquipmentSelection[];
  switchers?: EquipmentSelection[];
  distribution?: EquipmentSelection[];
  cables: EquipmentSelection[];
  calculations: {
    viewingAngles: ViewingAngleData[];
    pixelDensity: number; // pixels per inch at viewing distance
    brightness: number; // foot-lamberts
  };
}

export interface ControlSystemSpec {
  processors: EquipmentSelection[];
  interfaces: EquipmentSelection[];
  accessories: EquipmentSelection[];
  programming: {
    hours: number;
    complexity: 'basic' | 'moderate' | 'complex';
  };
}

export interface EquipmentSelection {
  equipment: Equipment;
  quantity: number;
  location?: string;
  notes?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface InstallationSpec {
  rackLayout?: RackUnit[];
  cableSchedule: CableRun[];
  powerRequirements: {
    circuits: PowerCircuit[];
    totalLoad: number; // watts
    recommendedBreaker: number; // amps
  };
  mountingDetails: MountingDetail[];
  laborHours: {
    installation: number;
    programming: number;
    commissioning: number;
    training: number;
  };
}

export interface RackUnit {
  position: number; // U position from bottom
  height: number; // U spaces
  equipment: Equipment;
  notes?: string;
}

export interface CableRun {
  id: string;
  type: 'audio' | 'video' | 'control' | 'power' | 'network';
  from: string;
  to: string;
  cableSpec: string;
  length: number; // meters
  quantity: number;
  conduit?: string;
}

export interface PowerCircuit {
  name: string;
  voltage: number;
  amperage: number;
  phase: '1ph' | '3ph';
  outlets: number;
  location: string;
  loads: string[]; // equipment IDs
}

export interface MountingDetail {
  equipment: Equipment;
  location: string;
  mountType: string;
  height?: number; // meters from floor
  angle?: number; // degrees
  hardware: string;
}

export interface BudgetSummary {
  equipment: {
    audio: number;
    video: number;
    control: number;
    total: number;
  };
  installation: {
    labor: number;
    materials: number;
    total: number;
  };
  other: {
    shipping: number;
    tax: number;
    contingency: number;
    total: number;
  };
  grandTotal: number;
}

export interface CoveragePoint {
  x: number;
  y: number;
  z: number;
  spl: number;
  delay?: number;
}

export interface ViewingAngleData {
  seatPosition: { x: number; y: number };
  horizontalAngle: number;
  verticalAngle: number;
  distance: number;
  acceptable: boolean;
}
