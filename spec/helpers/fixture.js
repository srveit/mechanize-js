
import * as path from 'path'
import { readFile } from 'fs/promises'

export function fixture(filename) {
  return readFile(path.join(__dirname, '..', 'fixtures/', filename), 'utf8')
}
