/** Story-only sample data for the Table examples: chemical elements and a shopping list. Not part of the library */
import type { TableColumn, TableRow } from './table.component';

// prettier-ignore
const RAW: [string, number, string, string][] = [
  ['Hydrogen', 1.0079, 'H', 'The lightest element, and the most common one in the universe.'],
  ['Helium', 4.0026, 'He', 'A colorless noble gas; it fills balloons and cools MRI magnets.'],
  ['Lithium', 6.941, 'Li', 'A soft, silvery metal at the heart of rechargeable batteries.'],
  ['Beryllium', 9.0122, 'Be', 'A light, stiff metal used in aerospace parts and X-ray windows.'],
  ['Boron', 10.811, 'B', 'A metalloid found in heat-resistant glass and detergents.'],
  ['Carbon', 12.0107, 'C', 'The basis of all known life; diamond and graphite are both carbon.'],
  ['Nitrogen', 14.0067, 'N', 'Makes up 78% of the air we breathe.'],
  ['Oxygen', 15.9994, 'O', 'Needed for breathing and burning; the most common element in the crust.'],
  ['Fluorine', 18.9984, 'F', 'The most reactive element, found in toothpaste as fluoride.'],
  ['Neon', 20.1797, 'Ne', 'A noble gas that glows red-orange in signs.'],
  ['Sodium', 22.9897, 'Na', 'A soft metal; with chlorine it makes table salt.'],
  ['Magnesium', 24.305, 'Mg', 'A light metal that burns with a bright white flame.'],
  ['Aluminum', 26.9815, 'Al', 'The most common metal in the crust, used in cans and planes.'],
  ['Silicon', 28.0855, 'Si', 'The semiconductor inside nearly every computer chip.'],
  ['Phosphorus', 30.9738, 'P', 'Essential for DNA and bones; used in matches and fertilizers.'],
  ['Sulfur', 32.065, 'S', 'A yellow solid known for the smell of its compounds.'],
  ['Chlorine', 35.453, 'Cl', 'A yellow-green gas used to clean drinking water and pools.'],
  ['Argon', 39.948, 'Ar', 'An inert gas that fills light bulbs and welding shields.'],
  ['Potassium', 39.0983, 'K', 'A reactive metal; bananas are a well-known source.'],
  ['Calcium', 40.078, 'Ca', 'Builds bones and teeth, and is found in chalk and marble.'],
];

export const ELEMENTS: TableRow[] = RAW.map(([name, weight, symbol, description], i) => ({
  position: i + 1,
  name,
  weight,
  symbol,
  description,
}));

export const ELEMENT_COLUMNS: TableColumn[] = [
  { key: 'position', label: 'No.', sortable: true, width: '80px' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'weight', label: 'Weight', sortable: true, align: 'end' },
  { key: 'symbol', label: 'Symbol', sortable: true },
];

const usd = (value: unknown) => `$${Number(value).toFixed(2)}`;

export const PURCHASES: TableRow[] = [
  ['Beach ball', 4],
  ['Towel', 5],
  ['Frisbee', 2],
  ['Sunscreen', 4],
  ['Cooler', 25],
  ['Swim suit', 15],
].map(([item, cost]) => ({ item, cost }));

/** Item and cost, with a total in the footer */
export const PURCHASE_COLUMNS: TableColumn[] = [
  { key: 'item', label: 'Item', footer: 'Total' },
  {
    key: 'cost',
    label: 'Cost',
    align: 'end',
    format: usd,
    footer: (rows) => rows.reduce((sum, row) => sum + Number(row['cost']), 0),
  },
];
