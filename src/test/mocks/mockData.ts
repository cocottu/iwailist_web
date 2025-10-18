import { Gift, Person, Return, Image } from '@/types'

export const mockPerson: Person = {
  id: '1',
  name: '田中太郎',
  relationship: '友人',
  notes: 'テスト用の人物データ',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockGift: Gift = {
  id: '1',
  personId: '1',
  person: mockPerson,
  giftName: 'テストギフト',
  description: 'テスト用のギフトデータ',
  category: '誕生日',
  receivedDate: new Date('2024-01-01'),
  returnStatus: 'pending',
  returnDeadline: new Date('2024-02-01'),
  amount: 5000,
  memo: 'テスト用のメモ',
  images: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockReturn: Return = {
  id: '1',
  giftId: '1',
  gift: mockGift,
  name: 'お返しギフト',
  description: 'テスト用のお返しデータ',
  category: '誕生日',
  givenDate: new Date('2024-01-15'),
  amount: 5000,
  memo: 'テスト用のお返しメモ',
  images: [],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
}

export const mockImage: Image = {
  id: '1',
  entityId: '1',
  entityType: 'gift',
  url: 'data:image/jpeg;base64,test-image-data',
  filename: 'test-image.jpg',
  size: 1024,
  mimeType: 'image/jpeg',
  createdAt: new Date('2024-01-01'),
}

export const mockPersons: Person[] = [
  mockPerson,
  {
    id: '2',
    name: '佐藤花子',
    relationship: '同僚',
    notes: '職場の同僚',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: '山田次郎',
    relationship: '親戚',
    notes: '従兄弟',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
]

export const mockGifts: Gift[] = [
  mockGift,
  {
    id: '2',
    personId: '2',
    person: mockPersons[1],
    giftName: 'お菓子セット',
    description: '美味しいお菓子のセット',
    category: 'お中元',
    receivedDate: new Date('2024-01-15'),
    returnStatus: 'completed',
    returnDeadline: new Date('2024-02-15'),
    amount: 3000,
    memo: 'お返し済み',
    images: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    personId: '3',
    person: mockPersons[2],
    giftName: 'お酒',
    description: '高級日本酒',
    category: 'お歳暮',
    receivedDate: new Date('2024-01-20'),
    returnStatus: 'not_required',
    returnDeadline: new Date('2024-02-20'),
    amount: 8000,
    memo: 'お返し待ち',
    images: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
]

export const mockReturns: Return[] = [
  mockReturn,
  {
    id: '2',
    giftId: '2',
    gift: mockGifts[1],
    name: 'お返しギフト',
    description: 'お返し用のギフト',
    category: 'お中元',
    givenDate: new Date('2024-01-25'),
    amount: 3000,
    memo: 'お返し完了',
    images: [],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
]

export const mockImages: Image[] = [
  mockImage,
  {
    id: '2',
    entityId: '2',
    entityType: 'gift',
    url: 'data:image/jpeg;base64,test-image-data-2',
    filename: 'test-image-2.jpg',
    size: 2048,
    mimeType: 'image/jpeg',
    createdAt: new Date('2024-01-15'),
  },
]
