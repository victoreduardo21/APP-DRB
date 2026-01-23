
export enum AppStep {
  LOGIN = 'LOGIN',
  CADASTRO = 'CADASTRO',
  CHAMADA = 'CHAMADA',
  OPERACAO = 'OPERACAO',
  VIAGENS = 'VIAGENS',
  AJUSTES = 'AJUSTES'
}

export enum UserRole {
  DONO = 'DONO',
  TERCEIRIZADO = 'TERCEIRIZADO'
}

export enum OperationStatus {
  PENDING = 'PENDING',
  ARRIVED_ORIGIN = 'ARRIVED_ORIGIN',
  LEFT_ORIGIN = 'LEFT_ORIGIN',
  ARRIVED_DESTINATION = 'ARRIVED_DESTINATION',
  FINISHED = 'FINISHED'
}

export interface LocationData {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Issue {
  id: string;
  text: string;
  timestamp: number;
}

export interface DriverInfo {
  name: string;
  cpf: string;
  birthDate: string;
  plate: string;
  role: UserRole;
}

export interface Job {
  id: string;
  container: string;
  lacre: string;
  origem: string;
  destino: string;
  janela: string;
  status: OperationStatus;
  issues: Issue[];
  checkpoints: {
    arrivedOrigin?: number;
    leftOrigin?: number;
    arrivedDestination?: number;
    finished?: number;
  };
  locations: {
    [key in OperationStatus]?: LocationData;
  };
  driver?: DriverInfo;
}
