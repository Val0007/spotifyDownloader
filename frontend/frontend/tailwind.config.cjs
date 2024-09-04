/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'playlistblue':'#335678',
        'playlistblack':'#0f0f0f',
        'playlistcard':'#171717',
        'playlistname':'#cdcdcd',
        'playlistauthor':'#646464',
        'spotifygreen':'#24d864'

      }
    },

  },
  plugins: [],
}

