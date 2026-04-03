import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MobileActionBar from '../components/MobileActionBar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-black">
      <Navbar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-0">{children}</main>
      <MobileActionBar />
      <Footer />
    </div>
  )
}
