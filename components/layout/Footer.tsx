import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="font-bold text-xl text-white mb-2">
            Tool<span className="text-brand-400">Boxy</span>
          </div>
          <p className="text-sm">Free online tools for everyone.</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Tools</h4>
          <ul className="space-y-2 text-sm">
            {['PDF', 'Image', 'Video', 'Developer'].map((cat) => (
              <li key={cat}>
                <Link
                  href={`/en/tools/${cat.toLowerCase()}`}
                  className="hover:text-white transition-colors"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'About', href: '/en/about' },
              { label: 'Blog', href: '/en/blog' },
              { label: 'Pricing', href: '/en/pricing' },
              { label: 'Contact', href: '/en/contact' },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Privacy Policy', href: '/en/privacy' },
              { label: 'Terms of Service', href: '/en/terms' },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 px-4">
        <p className="text-center text-xs text-gray-600">
          © {year} ToolBoxy. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
