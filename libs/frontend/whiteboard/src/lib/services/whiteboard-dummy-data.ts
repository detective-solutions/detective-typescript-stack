// TODO: Remove this file if data is correctly provided by the backend

import { INodeInput } from '../models';

const randomDummyTitles = [
  'Clue 1',
  'I am a randomly chosen title',
  'Clue 2',
  'Find suspicious content',
  'Clue 3',
  'Suspicious data',
  '',
];

export const dummyNodes: INodeInput[] = [
  {
    id: '1',
    type: 'table',
    title: randomDummyTitles[Math.floor(Math.random() * randomDummyTitles.length)],
    layout: { x: 10, y: 100, width: 900, height: 500 },
  },
  {
    id: '2',
    type: 'table',
    title: randomDummyTitles[Math.floor(Math.random() * randomDummyTitles.length)],
    layout: { x: 1300, y: 800, width: 900, height: 500 },
  },
];
