// wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http, createConfig } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'

export const config = createConfig(
  getDefaultConfig({
    appName: 'Movo Demo',
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // daftar gratis di cloud.walletconnect.com
    chains: [mainnet, base],
    ssr: true
  })
)
