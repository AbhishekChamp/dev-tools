import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Wrench,
  FileJson,
  Regex,
  KeyRound,
  ArrowLeftRight,
  Lock,
  Zap,
  Shield,
  Globe,
  Github,
  ExternalLink,
  Cpu,
  Palette,
  Code2,
  Layers,
} from 'lucide-react';
import { getIconComponent, builtInTools } from '@/utils/tools';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const tools = [
  {
    id: 'json-formatter',
    route: '/json',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data with syntax highlighting and statistics.',
    features: ['Syntax highlighting', 'Format/Minify toggle', 'File upload', 'Statistics'],
    color: 'bg-blue-500',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'regex-tester',
    route: '/regex',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with real-time matching and visual feedback.',
    features: ['Real-time matching', 'Match highlighting', 'Common patterns', 'Capture groups'],
    color: 'bg-purple-500',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'jwt-decoder',
    route: '/jwt',
    name: 'JWT Decoder',
    description: 'Decode and inspect JWT tokens with payload analysis and validation.',
    features: ['Header/Payload decode', 'Signature view', 'Expiration check', 'Claims display'],
    color: 'bg-green-500',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'base64-tool',
    route: '/base64',
    name: 'Base64 Tool',
    description: 'Encode and decode Base64 strings with URL-safe option and file support.',
    features: ['Encode/Decode', 'URL-safe option', 'File support', 'Statistics'],
    color: 'bg-orange-500',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'password-generator',
    route: '/password',
    name: 'Password Generator',
    description: 'Generate secure, random passwords with customizable options and strength meter.',
    features: ['Strength meter', 'Customizable options', 'Password history', 'Cryptographically secure'],
    color: 'bg-red-500',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
];

const techStack = [
  { name: 'React', icon: Code2, description: 'UI library with concurrent features' },
  { name: 'TypeScript', icon: Code2, description: 'Type-safe development' },
  { name: 'Vite', icon: Zap, description: 'Fast builds and HMR' },
  { name: 'Tailwind CSS', icon: Palette, description: 'Utility-first styling' },
  { name: 'Module Federation', icon: Layers, description: 'Micro-frontend architecture' },
  { name: 'Framer Motion', icon: Zap, description: 'Smooth animations' },
];

function AboutPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
        >
          <Wrench className="h-10 w-10" />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          DevTools Platform
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          A collection of powerful developer utilities built with modern micro-frontend architecture. 
          All tools run locally in your browser for maximum privacy and speed.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            <Zap className="h-4 w-4" />
            Explore Tools
          </Link>
          <a
            href="https://github.com/AbhishekChamp/dev-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-input bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section variants={itemVariants}>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Shield,
              title: 'Privacy First',
              description: 'All processing happens locally in your browser. No data is ever sent to any server.',
            },
            {
              icon: Zap,
              title: 'Lightning Fast',
              description: 'Built with Vite for instant startup and hot module replacement during development.',
            },
            {
              icon: Globe,
              title: 'Always Available',
              description: 'Works offline as a Progressive Web App. Install to your home screen.',
            },
            {
              icon: Cpu,
              title: 'Micro-Frontend Architecture',
              description: 'Each tool is an independent application that can be developed and deployed separately.',
            },
            {
              icon: Palette,
              title: 'Beautiful Design',
              description: 'Modern, accessible UI with smooth animations and dark mode support.',
            },
            {
              icon: Layers,
              title: 'Extensible',
              description: 'Easy to add new tools. Just create a new micro-frontend and register it.',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tools Section */}
      <motion.section variants={itemVariants}>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Available Tools</h2>
          <p className="mt-2 text-muted-foreground">
            {tools.length} powerful utilities at your fingertips
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => {
            const Icon = getIconComponent(builtInTools.find(t => t.id === tool.id)?.icon || 'Wrench');
            return (
              <motion.div
                key={tool.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${tool.bgColor}`}>
                  <Icon className={`h-6 w-6 ${tool.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold">{tool.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
                <ul className="mt-4 space-y-1">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`h-1.5 w-1.5 rounded-full ${tool.color}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={tool.route}
                  className={`mt-6 inline-flex items-center gap-2 text-sm font-medium ${tool.iconColor} hover:underline`}
                >
                  Open Tool
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Architecture Section */}
      <motion.section variants={itemVariants} className="rounded-3xl bg-muted/50 p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-4 text-muted-foreground">
              DevTools Platform uses Module Federation to compose multiple independent applications 
              into a unified experience. Each tool is a standalone micro-frontend that can be 
              developed, tested, and deployed independently.
            </p>
            <div className="mt-6 space-y-4">
              {[
                'Shell application provides navigation and shared UI',
                'Tools load on-demand via Module Federation',
                'Shared dependencies deduplicated automatically',
                'Independent deployments without coordination',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {i + 1}
                  </div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Architecture Diagram</h3>
            <div className="space-y-3">
              <div className="rounded-xl border bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Shell Application</p>
                    <p className="text-xs text-muted-foreground">Host / Router / Navigation</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="h-8 w-px bg-border" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['JSON Formatter', 'Regex Tester', 'JWT Decoder', 'Base64 Tool', 'Password Generator'].map((tool) => (
                  <div key={tool} className="rounded-xl border bg-card p-3 text-center text-sm">
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Tech Stack Section */}
      <motion.section variants={itemVariants}>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Technology Stack</h2>
          <p className="mt-2 text-muted-foreground">Built with modern, battle-tested technologies</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              variants={itemVariants}
              className="flex items-center gap-4 rounded-xl border bg-card p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <tech.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{tech.name}</p>
                <p className="text-xs text-muted-foreground">{tech.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contributing Section */}
      <motion.section variants={itemVariants} className="rounded-3xl bg-primary p-8 text-primary-foreground lg:p-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Contributing</h2>
          <p className="mx-auto mt-4 max-w-2xl opacity-90">
            DevTools Platform is open source. Contributions are welcome! 
            Whether you want to add a new tool, fix a bug, or improve documentation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/AbhishekChamp/dev-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-all hover:opacity-90"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-foreground/20 px-6 py-3 text-sm font-semibold transition-all hover:bg-primary-foreground/10"
            >
              <Wrench className="h-4 w-4" />
              Start Using Tools
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer variants={itemVariants} className="border-t pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 DevTools Platform. Built with ❤️ for developers.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Version 1.0.0 • MIT License
        </p>
      </motion.footer>
    </motion.div>
  );
}
