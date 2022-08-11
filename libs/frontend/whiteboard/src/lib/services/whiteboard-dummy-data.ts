// TODO: Remove this file if data is correctly provided by the backend

import { AnyWhiteboardNode, WhiteboardNodeType } from '../models';

const randomDummyTitles = [
  'Clue 1',
  'I am a randomly chosen title',
  'Clue 2',
  'Find suspicious content',
  'Clue 3',
  'Suspicious data',
  '',
];

export const dummyNodes: AnyWhiteboardNode[] = [
  {
    id: '1',
    type: WhiteboardNodeType.TABLE,
    title: randomDummyTitles[Math.floor(Math.random() * randomDummyTitles.length)],
    x: 10,
    y: 100,
    width: 900,
    height: 500,
  },
  {
    id: '2',
    type: WhiteboardNodeType.TABLE,
    title: randomDummyTitles[Math.floor(Math.random() * randomDummyTitles.length)],
    x: 1300,
    y: 800,
    width: 900,
    height: 500,
  },
  // {
  //   id: '3',
  //   type: NodeType.EMBEDDING,
  //   title: randomDummyTitles[Math.floor(Math.random() * randomDummyTitles.length)],
  //   x: 500, y: 400, width: 900, height: 500 ,
  //   href: 'http://detective.solutions',
  // },
];
