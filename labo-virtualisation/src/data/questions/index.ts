import type { BankQuestion, Question } from '../../types'
import clu from './clu'
import hyp from './hyp'
import lin from './lin'
import lvm from './lvm'
import mat from './mat'
import net from './net'
import os from './os'
import pve from './pve'
import sto from './sto'
import vmw from './vmw'
import vnet from './vnet'

function withIds(list: Question[]): BankQuestion[] {
  return list.map((q, i) => ({ ...q, id: `${q.theme}-${q.kind}-${i}` }))
}

export const BANK: BankQuestion[] = [mat, os, lin, sto, lvm, net, vnet, hyp, pve, clu, vmw].flatMap(withIds)

export const BANK_BY_ID = new Map(BANK.map((q) => [q.id, q]))
