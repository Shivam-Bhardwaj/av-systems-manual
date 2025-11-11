export type EquipmentCategory = 
  | 'speaker'
  | 'amplifier'
  | 'mixer'
  | 'microphone'
  | 'display'
  | 'control'
  | 'processing'
  | 'cable'
  | 'accessory';

export interface BaseEquipment {
  id: string;
  category: EquipmentCategory;
  manufacturer: string;
  model: string;
  description: string;
  price: number; // USD
  weight: number; // kg
  dimensions: {
    width: number; // mm
    height: number; // mm
    depth: number; // mm
  };
  powerConsumption?: number; // watts
  warranty: number; // years
}

export interface Speaker extends BaseEquipment {
  category: 'speaker';
  type: 'point-source' | 'line-array' | 'column' | 'ceiling' | 'subwoofer' | 'monitor';
  frequencyResponse: {
    low: number; // Hz
    high: number; // Hz
  };
  sensitivity: number; // dB SPL @ 1W/1m
  maxSPL: number; // dB
  impedance: number; // ohms
  coverage: {
    horizontal: number; // degrees
    vertical: number; // degrees
  };
  powerHandling: {
    continuous: number; // watts
    peak: number; // watts
  };
  connectorType: 'speakon' | 'binding-post' | 'phoenix' | 'euro-block';
  transformer?: '70V' | '100V' | 'none';
}

export interface Amplifier extends BaseEquipment {
  category: 'amplifier';
  channels: number;
  powerOutput: {
    at8ohms: number; // watts per channel
    at4ohms: number; // watts per channel
    at2ohms?: number; // watts per channel
    at70V?: number; // watts per channel
    at100V?: number; // watts per channel
  };
  thd: number; // % Total Harmonic Distortion
  signalToNoise: number; // dB
  damping: number; // damping factor
  inputSensitivity: number; // dBu
  protection: string[];
  cooling: 'convection' | 'forced-air' | 'variable-speed';
}

export interface Mixer extends BaseEquipment {
  category: 'mixer';
  type: 'analog' | 'digital';
  inputs: {
    mic: number;
    line: number;
    stereoLine: number;
  };
  outputs: {
    main: number;
    aux: number;
    monitor: number;
    matrix?: number;
  };
  busses: number;
  effects?: {
    internal: boolean;
    count: number;
  };
  eq: {
    channels: 'parametric' | 'semi-parametric' | 'fixed';
    bands: number;
  };
  digitalFeatures?: {
    sampleRate: number; // kHz
    bitDepth: number; // bits
    latency: number; // ms
    networkAudio: boolean;
    remoteControl: boolean;
  };
}

export interface Microphone extends BaseEquipment {
  category: 'microphone';
  type: 'dynamic' | 'condenser' | 'ribbon' | 'boundary' | 'gooseneck' | 'lavalier' | 'headset';
  polarPattern: 'omnidirectional' | 'cardioid' | 'supercardioid' | 'hypercardioid' | 'bidirectional';
  frequencyResponse: {
    low: number; // Hz
    high: number; // Hz
  };
  sensitivity: number; // mV/Pa
  maxSPL: number; // dB
  impedance: number; // ohms
  connector: 'xlr' | 'mini-xlr' | 'trs' | 'usb';
  phantomPower: boolean;
  wireless?: {
    frequency: string; // e.g., "470-636 MHz"
    channels: number;
    range: number; // meters
    batteryLife: number; // hours
  };
}

export interface Display extends BaseEquipment {
  category: 'display';
  type: 'lcd' | 'led' | 'oled' | 'projection';
  screenSize: number; // inches diagonal
  resolution: {
    width: number;
    height: number;
  };
  brightness: number; // nits/cd/m²
  contrastRatio: string; // e.g., "3000:1"
  viewingAngle: {
    horizontal: number; // degrees
    vertical: number; // degrees
  };
  inputs: string[]; // e.g., ['HDMI', 'DisplayPort', 'DVI']
  refreshRate: number; // Hz
  touchscreen?: boolean;
  mounting: 'wall' | 'ceiling' | 'floor-stand' | 'desktop';
}

export interface ControlSystem extends BaseEquipment {
  category: 'control';
  type: 'touchpanel' | 'keypad' | 'processor' | 'remote';
  connectivity: string[]; // e.g., ['ethernet', 'rs232', 'ir', 'rf']
  programmable: boolean;
  io: {
    digitalInputs: number;
    digitalOutputs: number;
    analogInputs?: number;
    relays?: number;
    ir?: number;
    serial?: number;
  };
  display?: {
    size: number; // inches
    type: 'lcd' | 'oled' | 'e-ink';
    touch: boolean;
  };
}

export type Equipment = Speaker | Amplifier | Mixer | Microphone | Display | ControlSystem | BaseEquipment;
