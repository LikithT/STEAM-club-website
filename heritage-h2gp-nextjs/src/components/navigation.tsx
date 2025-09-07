"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, X, Zap, Car, Users, Trophy, BookOpen, Mail } from 'lucide-react'

const navItems = [
  {
    title: "About",
    href: "#about",
    icon: Users,
    description: "Learn about our STEAM club and mission"
  },
  {
    title: "H2GP Racing",
    href: "#racing",
    icon: Car,
    description: "Hydrogen-powered RC car racing"
  },
  {
    title: "Projects",
    href: "#projects", 
    icon: Zap,
    description: "Our innovative STEAM projects"
  },
  {
    title: "Achievements",
    href: "#achievements",
    icon: Trophy,
    description: "Competition results and awards"
  },
  {
    title: "Fuel Cell Guide",
    href: "#fuel-cell",
    icon: BookOpen,
    description: "Learn about hydrogen fuel cells"
  },
  {
    title: "Contact",
    href: "#contact",
    icon: Mail,
    description: "Get in touch with our team"
  }
]

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-900" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Heritage H2GP
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList className="space-x-1">
                  {navItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      <NavigationMenuTrigger 
                        className="bg-transparent hover:bg-white/10 data-[state=open]:bg-white/10 backdrop-blur-sm border border-white/10 text-foreground"
                        onClick={() => scrollToSection(item.href)}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.title}
                      </NavigationMenuTrigger>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="ml-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div className="bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
              <div className="container mx-auto px-4 py-4">
                <div className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => scrollToSection(item.href)}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                    >
                      <item.icon className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
