export interface MetadadosFoto {

  nome: string;

  fabricante?: string;

  modelo?: string;

  largura?: number;

  altura?: number;

  latitude?: number;

  longitude?: number;

  altitude?: number;

  data?: Date;

}

export interface ResultadoValidacao {

  quantidadeFotos: number;

  tamanhoTotal: number;

  drone?: string;

  fabricante?: string;

  largura?: number;

  altura?: number;

  latitude?: number;

  longitude?: number;

  altitude?: number;

  dataVoo?: Date;

  fotosComGPS: number;

  fotosSemGPS: number;

  altitudeMinima?: number;

  altitudeMaxima?: number;

  altitudeMedia?: number;

  erros: string[];

  avisos: string[];

  bbox?: number[]; // [minLon, minLat, maxLon, maxLat]

  trajeto?: number[][]; // [[lat, lon], ...]

}