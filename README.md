# 🧭 Mag Cal - Magnetic Declination Calculator

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Mantine UI](https://img.shields.io/badge/Mantine-339AF0?style=for-the-badge&logo=mantine&logoColor=white)](https://mantine.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

## 🌐 Navigate True North

**Mag Cal** is a modern web application that calculates magnetic declination for any location on Earth using NOAA's World Magnetic Model. This tool helps you understand the difference between true north and magnetic north for accurate navigation.

## ✨ Features

- 🌍 Calculate magnetic declination for any coordinates worldwide
- 🗺️ Interactive map interface using Leaflet
- 📱 Responsive design for desktop and mobile
- 🌓 Dark mode support with Mantine UI
- 📊 Visual data representation using Recharts
- 📅 Date-based calculations
- 🔍 Location search functionality
- 📈 Real-time declination updates

## 🚀 Quick Start

```bash
# Clone the project
git clone https://github.com/yourusername/mag-cal.git
cd mag-cal

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Components**: Mantine UI v7
- **Mapping**: Leaflet with React-Leaflet
- **Charts**: Recharts and Chart.js
- **Date Handling**: Day.js
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Router**: React Router DOM

## 🔧 How It Works

The application connects to NOAA's Geomagnetic Calculator API to provide accurate magnetic declination calculations. Users can:

1. Enter coordinates manually
2. Select a location on the interactive map
3. View real-time declination results
4. Analyze historical data through charts

## 🗺️ Interactive Map Features

- Click-to-select coordinates
- Real-time coordinate updates
- Responsive map controls
- Theme-aware map display

## 📝 License

MIT

## 🔗 Useful Links

- [World Magnetic Model](https://www.ngdc.noaa.gov/geomag/WMM/DoDWMM.shtml)
- [NOAA Geomagnetic Calculator](https://www.ngdc.noaa.gov/geomag-web/#declination)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔄 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

<p align="center">Made with ❤️ for the navigation community</p> 