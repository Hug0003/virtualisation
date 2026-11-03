export function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => acc * 256 + Number(octet), 0)
}

export function intToIp(n: number): string {
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

export function maskFromCidr(cidr: number): number {
  return cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0
}

export function cidrFromMask(mask: string): number {
  return ipToInt(mask).toString(2).replace(/0/g, '').length
}

export interface SubnetInfo {
  network: string
  broadcast: string
  mask: string
  first: string
  last: string
  /** Nombre total d'adresses du bloc. */
  size: number
  /** Nombre d'adresses utilisables par des machines. */
  hosts: number
}

/** Calcule un sous-réseau IPv4 (préfixes de /1 à /30). */
export function subnetInfo(ip: string, cidr: number): SubnetInfo {
  const mask = maskFromCidr(cidr)
  const network = (ipToInt(ip) & mask) >>> 0
  const size = 2 ** (32 - cidr)
  const broadcast = network + size - 1
  return {
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    mask: intToIp(mask),
    first: intToIp(network + 1),
    last: intToIp(broadcast - 1),
    size,
    hosts: size - 2,
  }
}

export function sameNetwork(a: string, b: string, cidr: number): boolean {
  const mask = maskFromCidr(cidr)
  return ((ipToInt(a) & mask) >>> 0) === ((ipToInt(b) & mask) >>> 0)
}
