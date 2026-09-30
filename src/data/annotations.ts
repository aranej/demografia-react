export interface Annotation {
  year: number;
  label: string;
  color: string;
}

export const annotations: Annotation[] = [
  { year: 1975, label: 'Vrchol', color: '#e8b04a' },
  { year: 1989, label: 'Pád komunizmu', color: '#e8b04a' },
  { year: 2002, label: 'Minimum', color: '#e8b04a' },
  { year: 2020, label: 'COVID-19', color: '#e8b04a' }
];
