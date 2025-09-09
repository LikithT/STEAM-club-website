"use client"

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/navigation'
import Hero3D from '@/components/hero-3d'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Zap, 
  Car, 
  Users, 
  Trophy, 
  BookOpen, 
  Mail, 
  Github, 
  Instagram, 
  MessageCircle,
  Atom,
  Battery,
  Gauge,
  Target,
  Award,
  Calendar,
  MapPin
} from 'lucide-react'

export default function Home() {
  useEffect(() => {
    // Initialize Lenis smooth scrolling
    import('lenis').then((Lenis) => {
      const lenis = new Lenis.default()
      
      function raf(time: number) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      
      requestAnimationFrame(raf)
      
      return () => lenis.destroy()
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Hero3D />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
              Heritage H2GP
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Pioneering the future of sustainable energy through hydrogen-powered racing and STEAM education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-blue-900 font-semibold"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Zap className="mr-2 h-5 w-5" />
                Discover Our Mission
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-blue-900"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Users className="mr-2 h-5 w-5" />
                Join Our Team
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-yellow-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              About Heritage H2GP
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We are Heritage High School&apos;s premier STEAM club, dedicated to advancing sustainable energy education through competitive hydrogen-powered RC car racing.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Atom,
                title: "Innovation",
                description: "Pushing the boundaries of hydrogen fuel cell technology in competitive racing environments."
              },
              {
                icon: Users,
                title: "Education",
                description: "Inspiring the next generation of engineers and scientists through hands-on STEAM learning."
              },
              {
                icon: Trophy,
                title: "Competition",
                description: "Competing at the highest levels in H2GP racing championships across the nation."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-blue-900" />
                    </div>
                    <CardTitle className="text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-center">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* H2GP Racing Section */}
      <section id="racing" className="py-20 px-4 bg-gradient-to-r from-blue-900/20 to-slate-900/20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              H2GP Racing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the thrill of hydrogen-powered racing with our cutting-edge RC cars designed for maximum performance and efficiency.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-white mb-6">Our Racing Technology</h3>
              <div className="space-y-4">
                {[
                  { icon: Battery, text: "Advanced PEM fuel cell systems" },
                  { icon: Gauge, text: "Precision-engineered chassis design" },
                  { icon: Target, text: "Optimized aerodynamics for speed" },
                  { icon: Zap, text: "Real-time performance monitoring" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-blue-900" />
                    </div>
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-yellow-400/20 to-blue-600/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <Car className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-white text-center mb-4">Heritage H2GP Car</h4>
                <p className="text-gray-300 text-center">
                  Our Car featuring hydrogen fuel cell technology, 
                  custom aerodynamic design, and precision engineering for optimal performance.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fuel Cell Education Section */}
      <section id="fuel-cell" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Hydrogen Fuel Cell Technology
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Learn about the revolutionary technology powering our racing cars and the future of clean energy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Basic Principle",
                description: "Hydrogen fuel cells convert chemical energy directly into electrical energy through a electrochemical reaction. This is an oxidation reduction reaction.",
                
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Main Components",
                description: "Anode, cathode, and PEM (Proton Exchange Membrane) work together to generate clean electricity.",
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Chemical Reactions",
                description: "H₂ → 2H⁺ + 2e⁻ at anode, O₂ + 4H⁺ + 4e⁻ → 2H₂O at cathode.",
                color: "from-purple-500 to-violet-500"
              },
              {
                title: "H2GP Application",
                description: "Optimized fuel cells provide consistent power for high-performance racing applications.",
                color: "from-yellow-500 to-orange-500"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-20 px-4 bg-gradient-to-r from-slate-900/20 to-blue-900/20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Our Achievements
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Celebrating our success in competitive hydrogen racing and STEAM education excellence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "Regional Champions",
                description: "2024 H2GP Regional Championship Winners",
                date: "March 2024"
              },
              {
                icon: Trophy,
                title: "Innovation Award",
                description: "Best Technical Innovation in Fuel Cell Design",
                date: "February 2024"
              },
              {
                icon: Target,
                title: "Efficiency Record",
                description: "Highest fuel efficiency in competition history",
                date: "January 2024"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-yellow-400/10 to-blue-600/10 backdrop-blur-sm border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-blue-900" />
                    </div>
                    <CardTitle className="text-white">{item.title}</CardTitle>
                    <CardDescription className="text-yellow-400">{item.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-center">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Join Our Mission
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Ready to be part of the future of sustainable energy? Connect with us and join the Heritage H2GP team.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Get In Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Heritage High School, Brentwood, CA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">heritage.h2gp@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Meetings: Tuesdays & Thursdays, 3:30 PM</span>
                </div>
              </div>

              <Separator className="my-8 bg-white/20" />

              <h4 className="text-xl font-semibold text-white mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {[
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: MessageCircle, href: "https://discord.gg/yfaWm3K8", label: "Discord" },
                  { icon: Github, href: "#", label: "GitHub" }
                ].map((social, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="icon"
                    className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-blue-900"
                    asChild
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                      <social.icon className="w-5 h-5" />
                    </a>
                  </Button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Ready to Join?</CardTitle>
                  <CardDescription className="text-gray-300">
                    Become part of our innovative STEAM community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Whether you&apos;re interested in engineering, design, programming, or just curious about sustainable energy, 
                    there&apos;s a place for you on our team. No prior experience required – just enthusiasm for learning and innovation!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Engineering", "Design", "Programming", "Research", "Marketing"].map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-yellow-400/20 text-yellow-400">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-blue-900 font-semibold"
                    asChild
                  >
                    <a href="mailto:heritage.h2gp@gmail.com">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Us Today
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-900" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Heritage H2GP
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 Heritage H2GP STEAM Club. Powering the future with hydrogen.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
