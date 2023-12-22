'use client'

import { HomePageUIService } from './components/home'

export default function Home() {
  return HomePageUIService.create().getElement()
}
