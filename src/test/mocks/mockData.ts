import { Gift, Person, Return, Image, Relationship, GiftCategory, ReturnStatus } from '@/types'

export const mockPerson: Person = {
  id: '1',
  userId: 'demo-user',
  name: '田中太郎',
  furigana: 'たなかたろう',
  relationship: Relationship.FRIEND,
  contact: '090-1234-5678',
  memo: 'テスト用の人物データ',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockGift: Gift = {
  id: '1',
  userId: 'demo-user',
  personId: '1',
  giftName: 'テストギフト',
  receivedDate: new Date('2024-01-01'),
  amount: 5000,
  category: GiftCategory.CELEBRATION,
  returnStatus: ReturnStatus.PENDING,
  memo: 'テスト用のメモ',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockReturn: Return = {
  id: '1',
  giftId: '1',
  returnName: 'お返しギフト',
  returnDate: new Date('2024-01-15'),
  amount: 5000,
  memo: 'テスト用のお返しメモ',
  createdAt: new Date('2024-01-15'),
}

export const mockImage: Image = {
  id: '1',
  entityId: '1',
  entityType: 'gift',
  imageUrl: 'data:image/jpeg;base64,test-image-data',
  order: 0,
  createdAt: new Date('2024-01-01'),
}

export const mockPersons: Person[] = [
  mockPerson,
  {
    id: '2',
    userId: 'demo-user',
    name: '佐藤花子',
    furigana: 'さとうはなこ',
    relationship: Relationship.COLLEAGUE,
    contact: '090-2345-6789',
    memo: '職場の同僚',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    userId: 'demo-user',
    name: '山田次郎',
    furigana: 'やまだじろう',
    relationship: Relationship.RELATIVE,
    contact: '090-3456-7890',
    memo: '従兄弟',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
]

export const mockGifts: Gift[] = [
  mockGift,
  {
    id: '2',
    userId: 'demo-user',
    personId: '2',
    giftName: 'お菓子セット',
    receivedDate: new Date('2024-01-15'),
    amount: 3000,
    category: GiftCategory.SEASONAL,
    returnStatus: ReturnStatus.COMPLETED,
    memo: 'お返し済み',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    userId: 'demo-user',
    personId: '3',
    giftName: 'お酒',
    receivedDate: new Date('2024-01-20'),
    amount: 8000,
    category: GiftCategory.SEASONAL,
    returnStatus: ReturnStatus.NOT_REQUIRED,
    memo: 'お返し待ち',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
]

export const mockReturns: Return[] = [
  mockReturn,
  {
    id: '2',
    giftId: '2',
    returnName: 'お返しギフト',
    returnDate: new Date('2024-01-25'),
    amount: 3000,
    memo: 'お返し完了',
    createdAt: new Date('2024-01-25'),
  },
]

export const mockImages: Image[] = [
  mockImage,
  {
    id: '2',
    entityId: '2',
    entityType: 'gift',
    imageUrl: 'data:image/jpeg;base64,test-image-data-2',
    order: 1,
    createdAt: new Date('2024-01-15'),
  },
]
