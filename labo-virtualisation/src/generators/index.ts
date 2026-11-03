import type { Generator, Question } from '../types'
import { fr } from '../lib/check'
import { intToIp, ipToInt, maskFromCidr, sameNetwork, subnetInfo } from './ip'
import { int, pick, type Rng } from './random'

function randomPrivateIp(rng: Rng): { ip: string; cidr: number } {
  const family = pick(rng, ['10', '172', '192'] as const)
  if (family === '192') {
    return { ip: `192.168.${int(rng, 0, 255)}.${int(rng, 1, 254)}`, cidr: pick(rng, [22, 23, 24, 24, 25, 26, 27, 28, 29, 30]) }
  }
  const second = family === '10' ? int(rng, 0, 255) : int(rng, 16, 31)
  return {
    ip: `${family}.${second}.${int(rng, 0, 255)}.${int(rng, 1, 254)}`,
    cidr: pick(rng, [16, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]),
  }
}

function explainSubnet(ip: string, cidr: number): string {
  const s = subnetInfo(ip, cidr)
  return (
    `/${cidr} → masque ${s.mask}. Le bloc fait 2^(32−${cidr}) = ${fr(s.size)} adresses. ` +
    `${ip} tombe dans le bloc qui commence à ${s.network} : réseau ${s.network}, broadcast ${s.broadcast}, ` +
    `machines de ${s.first} à ${s.last}, soit ${fr(s.hosts)} adresses utilisables (on retire le réseau et le broadcast).`
  )
}

const subnet: Generator = {
  id: 'subnet',
  theme: 'net',
  label: 'Calcul de sous-réseau',
  make(rng = Math.random): Question {
    const { ip, cidr } = randomPrivateIp(rng)
    const s = subnetInfo(ip, cidr)
    const explain = explainSubnet(ip, cidr)
    const variant = pick(rng, ['network', 'broadcast', 'hosts', 'first', 'last'] as const)
    if (variant === 'hosts') {
      return { kind: 'num', theme: 'net', q: `Combien de machines peut-on adresser dans le réseau de [[${ip}/${cidr}]] ?`, answer: s.hosts, tolerance: 0, unit: 'machines', explain }
    }
    const labels = {
      network: "l'adresse du réseau",
      broadcast: "l'adresse de broadcast",
      first: 'la première adresse utilisable',
      last: 'la dernière adresse utilisable',
    } as const
    return { kind: 'text', theme: 'net', q: `Quelle est ${labels[variant]} de [[${ip}/${cidr}]] ?`, answers: [s[variant]], placeholder: 'ex. 192.168.1.0', explain }
  },
}

const samenet: Generator = {
  id: 'samenet',
  theme: 'net',
  label: 'Même réseau ou pas ?',
  make(rng = Math.random): Question {
    const cidr = pick(rng, [20, 22, 23, 24, 25, 26, 27, 28])
    const base = `192.168.${int(rng, 0, 250)}.${int(rng, 1, 254)}`
    const s = subnetInfo(base, cidr)
    const net = ipToInt(s.network)
    const inside = rng() < 0.5
    const offset = int(rng, 1, s.size - 2)
    const other = intToIp(inside ? net + offset : net + s.size + offset)
    const same = sameNetwork(base, other, cidr)
    const s2 = subnetInfo(other, cidr)
    return {
      kind: 'mcq',
      theme: 'net',
      q: `Avec un masque /${cidr}, les machines [[${base}]] et [[${other}]] sont-elles dans le même réseau ?`,
      options: ['Oui, même réseau', 'Non, il faut un routeur'],
      answer: same ? 0 : 1,
      keepOrder: true,
      explain: `/${cidr} = ${intToIp(maskFromCidr(cidr))}, blocs de ${fr(s.size)} adresses. ${base} est dans ${s.network}/${cidr}, ${other} est dans ${s2.network}/${cidr}. ${same ? 'Même réseau : elles se parlent directement.' : 'Réseaux différents : il faut passer par un routeur.'}`,
    }
  },
}

const mask: Generator = {
  id: 'mask',
  theme: 'net',
  label: 'CIDR et masque',
  make(rng = Math.random): Question {
    const cidr = int(rng, 8, 30)
    const m = intToIp(maskFromCidr(cidr))
    const explain = `/${cidr} = ${cidr} bits à 1 en partant de la gauche, soit ${m}. Chaque octet plein vaut 255 ; un octet partiel vaut 128, 192, 224, 240, 248, 252 ou 254.`
    if (rng() < 0.5) {
      return { kind: 'text', theme: 'net', q: `Quel masque décimal correspond à [[/${cidr}]] ?`, answers: [m], placeholder: 'ex. 255.255.255.0', explain }
    }
    return { kind: 'text', theme: 'net', q: `Quelle notation CIDR correspond au masque [[${m}]] ?`, answers: [`/${cidr}`, `${cidr}`], placeholder: 'ex. /24', explain }
  },
}

const bandwidth: Generator = {
  id: 'bandwidth',
  theme: 'mat',
  label: 'Débits : bits et octets',
  make(rng = Math.random): Question {
    if (rng() < 0.6) {
      const v = pick(rng, [1, 2.5, 5, 10, 25, 40, 100])
      return {
        kind: 'num', theme: 'mat', unit: 'Mo/s', answer: v * 125, tolerance: 0.5,
        q: `Quel est le débit théorique maximal d'une carte [[${fr(v)} Gb/s]], en Mo/s ?`,
        explain: `${fr(v)} Gb/s = ${fr(v * 1000)} Mb/s ; on divise par 8 bits par octet : ${fr(v * 125)} Mo/s.`,
      }
    }
    const v = int(rng, 2, 20) * 50
    return {
      kind: 'num', theme: 'mat', unit: 'Mb/s', answer: v * 8, tolerance: 0.5,
      q: `Une copie avance à [[${fr(v)} Mo/s]]. Combien de Mb/s cela représente-t-il sur le réseau ?`,
      explain: `On multiplie par 8 : ${fr(v)} × 8 = ${fr(v * 8)} Mb/s. ${v * 8 > 1000 ? 'Une carte 1 Gb/s ne suffit donc pas.' : 'Une carte 1 Gb/s suffit.'}`,
    }
  },
}

const disk: Generator = {
  id: 'disk',
  theme: 'mat',
  label: 'To fabricant → Gio',
  make(rng = Math.random): Question {
    const v = pick(rng, [0.5, 1, 2, 4, 8, 12, 16, 20])
    const gib = (v * 1e12) / 2 ** 30
    return {
      kind: 'num', theme: 'mat', unit: 'Gio', answer: Math.round(gib), tolerance: Math.max(2, gib * 0.01),
      q: `Un disque est vendu [[${fr(v)} To]]. Combien de Gio l'OS affichera-t-il (arrondi) ?`,
      explain: `${fr(v)} To = ${fr(v)} × 10¹² octets. 1 Gio = 1 024³ = 1 073 741 824 octets. ${fr(v)} × 10¹² ÷ 1 073 741 824 ≈ ${fr(gib, 0)} Gio.`,
    }
  },
}

const threads: Generator = {
  id: 'threads',
  theme: 'mat',
  label: 'Threads disponibles',
  make(rng = Math.random): Question {
    const sockets = pick(rng, [1, 2, 2])
    const cores = pick(rng, [4, 6, 8, 12, 16, 24, 32])
    const ht = rng() < 0.6
    const total = sockets * cores * (ht ? 2 : 1)
    return {
      kind: 'num', theme: 'mat', unit: 'threads', answer: total, tolerance: 0,
      q: `Un serveur a ${sockets} socket${sockets > 1 ? 's' : ''} de ${cores} cœurs, ${ht ? 'avec' : 'sans'} Hyper-Threading. Combien de threads (cœurs logiques) offre-t-il ?`,
      explain: `${sockets} × ${cores} cœurs${ht ? ' × 2 threads par cœur' : ''} = ${total}. ${ht ? "Rappel : l'Hyper-Threading n'apporte qu'environ 15 à 30 % de puissance en plus." : ''}`,
    }
  },
}

const RWX = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx']

const chmod: Generator = {
  id: 'chmod',
  theme: 'lin',
  label: 'Droits chmod',
  make(rng = Math.random): Question {
    const digits = [pick(rng, [7, 6, 6, 7, 5, 4]), pick(rng, [5, 4, 0, 6, 7]), pick(rng, [4, 0, 5, 0])]
    const octal = digits.join('')
    const text = digits.map((d) => RWX[d]).join('')
    const explain = `r = 4, w = 2, x = 1. ${digits.map((d) => `${RWX[d]} = ${d}`).join(', ')}. Donc ${text} = ${octal} (propriétaire, groupe, autres).`
    if (rng() < 0.5) {
      return { kind: 'text', theme: 'lin', q: `Quelle valeur octale correspond aux droits [[${text}]] ?`, answers: [octal], placeholder: 'ex. 644', explain }
    }
    return { kind: 'text', theme: 'lin', q: `Quels droits donne [[chmod ${octal}]] ? (format rwxr-xr-x)`, answers: [text], placeholder: 'ex. rw-r--r--', explain }
  },
}

const quorum: Generator = {
  id: 'quorum',
  theme: 'clu',
  label: 'Quorum de cluster',
  make(rng = Math.random): Question {
    const n = int(rng, 2, 9)
    const needed = Math.floor(n / 2) + 1
    const tolerated = n - needed
    const explain = `Le quorum demande plus de la moitié des votes : ${n} votes → ${needed} nécessaires. On peut donc perdre ${tolerated} nœud${tolerated > 1 ? 's' : ''}.${n % 2 === 0 ? " Un nombre pair n'apporte rien de plus que le nombre impair juste en dessous." : ''}${n === 2 ? ' Avec 2 nœuds, il faut un QDevice.' : ''}`
    if (rng() < 0.5) {
      return { kind: 'num', theme: 'clu', unit: 'nœuds', answer: tolerated, tolerance: 0, q: `Un cluster Proxmox compte ${n} nœuds (1 vote chacun). Combien de nœuds peut-il perdre en gardant le quorum ?`, explain }
    }
    return { kind: 'num', theme: 'clu', unit: 'votes', answer: needed, tolerance: 0, q: `Un cluster compte ${n} nœuds. Combien de votes faut-il au minimum pour avoir le quorum ?`, explain }
  },
}

const raid: Generator = {
  id: 'raid',
  theme: 'sto',
  label: 'Capacité RAID',
  make(rng = Math.random): Question {
    const level = pick(rng, ['1', '5', '6', '10'] as const)
    const size = pick(rng, [1, 2, 4, 8, 12, 16])
    const n = level === '1' ? 2 : level === '5' ? int(rng, 3, 8) : level === '6' ? int(rng, 4, 10) : int(rng, 2, 6) * 2
    const usable = level === '1' ? size : level === '5' ? (n - 1) * size : level === '6' ? (n - 2) * size : (n / 2) * size
    const rule = {
      '1': 'RAID 1 = miroir : on ne garde que la capacité d’un disque.',
      '5': 'RAID 5 = une parité : (n − 1) × taille.',
      '6': 'RAID 6 = double parité : (n − 2) × taille.',
      '10': 'RAID 10 = miroirs agrégés : la moitié des disques.',
    }[level]
    return {
      kind: 'num', theme: 'sto', unit: 'To', answer: usable, tolerance: 0,
      q: `Quelle est la capacité utile d'un RAID ${level} de ${n} disques de ${size} To ?`,
      explain: `${rule} Ici : ${fr(usable)} To utiles sur ${fr(n * size)} To bruts.`,
    }
  },
}

const ceph: Generator = {
  id: 'ceph',
  theme: 'lvm',
  label: 'Capacité Ceph',
  make(rng = Math.random): Question {
    const nodes = int(rng, 3, 6)
    const disks = int(rng, 2, 6)
    const size = pick(rng, [2, 4, 8])
    const raw = nodes * disks * size
    const usable = Math.round((raw / 3) * 10) / 10
    return {
      kind: 'num', theme: 'lvm', unit: 'To', answer: usable, tolerance: 0.15,
      q: `Un cluster Ceph a ${nodes} nœuds de ${disks} disques de ${size} To, avec un pool en size=3. Quelle capacité utile théorique ?`,
      explain: `Brut : ${nodes} × ${disks} × ${size} = ${raw} To. Avec 3 copies : ${raw} ÷ 3 ≈ ${fr(usable, 1)} To. En pratique, on garde en plus 20 à 30 % de marge pour que Ceph puisse se reconstruire.`,
    }
  },
}

export const GENERATORS: Generator[] = [subnet, samenet, mask, bandwidth, disk, threads, chmod, quorum, raid, ceph]

export const GENERATOR_BY_ID = new Map(GENERATORS.map((g) => [g.id, g]))
