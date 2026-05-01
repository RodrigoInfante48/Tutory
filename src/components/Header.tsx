import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <h1 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {/* User avatar placeholder */}
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-gray-800 cursor-pointer">
          V
        </div>
      </div>
    </header>
  )
}
