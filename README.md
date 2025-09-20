# 🧪 Interactive Chemistry Lab Emulator

A web-based Interactive Chemistry Lab powered by **Matter.js** for real-time physics simulation and **Gemini AI** for intelligent chemistry assistance.

## 🌟 Live Demo

**🔗 [View Live Demo](https://jes-win-hac-ker.github.io/browser-lab-experiments/)**

[![Deploy Status](https://github.com/Jes-win-hac-ker/browser-lab-experiments/actions/workflows/deploy.yml/badge.svg)](https://github.com/Jes-win-hac-ker/browser-lab-experiments/actions/workflows/deploy.yml)

## ✨ Features

### 🔬 **Virtual Chemistry Experiments**
- **Acid-Base Neutralization** with real-time pH monitoring
- **Gas Evolution Reactions** with dynamic bubble effects  
- **Precipitation Formation** with realistic settling physics
- **Simple Distillation** with heat-based separation

### ⚗️ **Interactive Lab Equipment**
- Drag-and-drop beakers, test tubes, burners, and droppers
- Real-time pH, temperature, and concentration monitoring
- Professional measurement tools and indicators
- Realistic particle physics with Matter.js

### 🤖 **AI Chemistry Assistant**
- **Gemini AI-powered** ChatBot for instant help
- Context-aware responses based on current experiment state
- Educational explanations of chemical reactions
- Safety guidelines and best practices

### 🎯 **Educational Features**
- Pre-built experiment templates
- Real-time data visualization with charts
- Challenge mode for prediction-based learning
- Professional lab interface with modern design

## 🚀 Quick Start

### **Option 1: Run Locally**

```bash
# Clone the repository
git clone https://github.com/Jes-win-hac-ker/browser-lab-experiments.git
cd browser-lab-experiments

# Install dependencies
npm install

# Add your Gemini API key (optional)
cp .env.example .env.local
# Edit .env.local and add your API key

# Start development server
npm run dev
```

### **Option 2: Deploy to GitHub Pages**

1. **Fork this repository**
2. **Add Gemini API Key** (optional):
   - Go to your repo **Settings → Secrets and variables → Actions**
   - Add secret: `VITE_GEMINI_API_KEY` with your [Gemini API key](https://makersuite.google.com/app/apikey)
3. **Enable GitHub Pages**:
   - Go to **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: **gh-pages**
4. **Push to main branch** - GitHub Actions will automatically deploy!

## 🔧 Configuration

### **Environment Variables**

Create a `.env.local` file:

```bash
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

### **GitHub Pages Setup**

1. **Repository Settings**:
   - Go to **Settings → Pages**
   - **Source**: Deploy from a branch
   - **Branch**: gh-pages
   - **Folder**: / (root)

2. **GitHub Secrets** (for AI features):
   - **Settings → Secrets and variables → Actions**
   - **New repository secret**: `VITE_GEMINI_API_KEY`

## 🛠️ Technologies Used

- **⚛️ React 18** - Modern UI framework
- **🎨 Tailwind CSS** - Utility-first styling
- **⚡ Vite** - Fast build tool and dev server
- **🎲 Matter.js** - 2D physics engine for realistic simulations
- **🤖 Google Gemini AI** - Intelligent chemistry assistance
- **📊 Recharts** - Real-time data visualization
- **🔧 TypeScript** - Type-safe development

## 🧪 How to Use

1. **Select an Experiment**: Choose from acid-base, precipitation, or gas evolution
2. **Add Chemicals**: Drag equipment from the sidebar to the beaker
3. **Monitor Results**: Watch real-time pH, temperature, and reaction progress
4. **Ask Questions**: Use the AI ChatBot for chemistry explanations
5. **Reset & Repeat**: Try different combinations safely

## 🤖 AI Assistant Features

The ChatBot provides:
- **Context-aware responses** based on your current experiment
- **Real-time analysis** of pH, temperature, and visual changes
- **Educational explanations** of chemical reactions
- **Safety guidelines** and best practices
- **Experiment suggestions** and troubleshooting

---

**🧪 Start experimenting with chemistry today!** [Launch the Lab →](https://jes-win-hac-ker.github.io/browser-lab-experiments/)

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/115ff1ee-abd4-477e-8549-dc10a506817c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/115ff1ee-abd4-477e-8549-dc10a506817c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
