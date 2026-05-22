import Navbar from './Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
      <footer className="bg-white border-t border-gray-100 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm font-medium text-gray-800">
              <span className="text-green-600">Medi</span>Find GH
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Finding medicines and products near you</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">About</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Contact</a>
            <a href="#" className="hover:text-gray-600 transition-colors">List your shop</a>
          </div>
          <p className="text-xs text-gray-300">© 2025 MediFind GH · Built in Ghana</p>
        </div>
      </footer>
    </div>
  );
}