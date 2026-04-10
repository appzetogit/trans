import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem('view_mode') || 'transport'
  )
  const [language, setLanguage] = useState(
    () => localStorage.getItem('app_lang') || 'en'
  )

  const toggleSidebar = () => setSidebarCollapsed(p => !p)
  const toggleMobileMenu = () => setMobileMenuOpen(p => !p)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const switchViewMode = (mode) => {
    setViewMode(mode)
    localStorage.setItem('view_mode', mode)
  }

  const changeLanguage = (lang) => {
    import('../i18n/i18n').then(({ default: i18n }) => {
      i18n.changeLanguage(lang)
      setLanguage(lang)
      localStorage.setItem('app_lang', lang)
    })
  }

  return (
    <AppContext.Provider value={{
      sidebarCollapsed,
      toggleSidebar,
      mobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      viewMode,
      switchViewMode,
      language,
      changeLanguage,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
