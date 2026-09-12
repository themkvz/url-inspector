export type Param = { key: string; value: string | null }

export type Parts = {
  scheme: string | null
  username: string | null
  password: string | null
  host: string | null
  port: string | null
  path: string
  query: Param[] | null
  fragment: string | null
}

export type PartName =
  | 'scheme'
  | 'username'
  | 'password'
  | 'host'
  | 'port'
  | 'path'
  | 'query'
  | 'fragment'

export type Range = [number, number]

export type Ranges = Partial<Record<PartName, Range>>

export type Tokenized = { parts: Parts; ranges: Ranges }
