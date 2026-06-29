const drones: Record<string, string> = {

  FC6310: "DJI Phantom 4 Pro",

  FC6310S: "DJI Phantom 4 Pro V2",

  L2D20C: "DJI Mavic 3 Enterprise",

  L2D20C_MULTI: "DJI Mavic 3 Multispectral",

  FC3411: "DJI Air 2S",

  FC220: "DJI Mavic Pro",

  FC300X: "DJI Phantom 3",

};

export function traduzirDrone(
  modelo?: string
) {

  if (!modelo)
    return "Desconhecido";

  return drones[modelo] || modelo;

}