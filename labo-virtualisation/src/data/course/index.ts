import type { ThemeId } from '../../types'
import type { Chapter } from './build'
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

export type { Block, Chapter, Check, Lesson, Step } from './build'

/** Le parcours, dans l'ordre pédagogique : chaque chapitre s'appuie sur les précédents. */
export const COURSE: Chapter[] = [mat, os, lin, net, sto, hyp, lvm, vnet, pve, clu, vmw]

export const CHAPTER_INDEX = new Map<ThemeId, number>(COURSE.map((c, i) => [c.id, i]))

export const LESSON_COUNT = COURSE.reduce((n, c) => n + c.lessons.length, 0)
