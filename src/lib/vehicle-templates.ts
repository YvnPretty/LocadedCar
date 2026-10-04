import { resolveVehicleImage } from "./vehicle-media";

/** Editable sample data for quickly creating an independent stock unit. */
const models = [
  {
    "marca": "Porsche",
    "modelo": "911 GT3 RS",
    "tipo": "deportivo",
    "detalles": "520 hp, 0-100 km/h en 3.2s. Aerodinámica activa avanzada.",
    "anio": 2023,
    "precio": 5000000
  },
  {
    "marca": "Mercedes-Benz",
    "modelo": "AMG GT 63",
    "tipo": "semideportivo",
    "detalles": "Coupé de 4 puertas, V8 biturbo con 639 hp. Lujo y rendimiento superior.",
    "anio": 2023,
    "precio": 3300000
  },
  {
    "marca": "Ferrari",
    "modelo": "F8 Tributo",
    "tipo": "deportivo",
    "detalles": "El V8 más potente en la historia de Ferrari, 720 hp de puro diseño italiano.",
    "anio": 2021,
    "precio": 6400000
  },
  {
    "marca": "Lamborghini",
    "modelo": "Aventador SVJ",
    "tipo": "deportivo",
    "detalles": "Motor V12 de 6.5L, 770 hp. Aerodinámica activa ALA 2.0. Pura agresividad.",
    "anio": 2022,
    "precio": 12000000
  },
  {
    "marca": "Bugatti",
    "modelo": "Chiron",
    "tipo": "deportivo",
    "detalles": "Motor W16 quad-turbo de 8.0L, 1500 hp. El pináculo de la ingeniería automotriz.",
    "anio": 2021,
    "precio": 60000000
  },
  {
    "marca": "Pagani",
    "modelo": "Huayra Roadster",
    "tipo": "deportivo",
    "detalles": "Arte sobre ruedas en fibra de carbono y titanio.",
    "anio": 2020,
    "precio": 55000000
  },
  {
    "marca": "Ford",
    "modelo": "Mustang Shelby GT500",
    "tipo": "semideportivo",
    "detalles": "V8 supercargado de 5.2L con 760 hp. El muscle car definitivo.",
    "anio": 2023,
    "precio": 2500000
  },
  {
    "marca": "Chevrolet",
    "modelo": "Corvette Z06",
    "tipo": "deportivo",
    "detalles": "Motor central V8 atmosférico plano de 5.5L con 670 hp.",
    "anio": 2024,
    "precio": 3100000
  },
  {
    "marca": "Audi",
    "modelo": "R8 V10 Exclusive",
    "tipo": "deportivo",
    "detalles": "Edición exclusiva con configurador fotorealista de fábrica.",
    "anio": 2024,
    "precio": 4200000
  }
];

export const vehicleTemplates = models.map((car) => ({
  ...car, estado: "disponible",
  imagenUrl: car.marca === "Audi" ? "/renders/audi_r8_red.jpg" : resolveVehicleImage(car)!,
}));
