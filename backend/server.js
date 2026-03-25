const dotenv = require('dotenv');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const client = require('./src/config/redis');

dotenv.config();

const User = require("./src/models/User");
const bcrypt = require("bcryptjs");

const Producto = require('./src/models/Producto');

async function seedDB() {
  try {
    // 1. Usuarios base
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await User.create({ username: 'admin', password: adminPassword, role: 'admin' });
      console.log('✅ Usuario admin creado');
    } else if (adminExists.role !== 'admin') {
      adminExists.role = 'admin'; await adminExists.save();
    }

    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      const userPassword = await bcrypt.hash('user123', 10);
      await User.create({ username: 'user', password: userPassword, role: 'user' });
      console.log('✅ Usuario normal creado (user)');
    }

    // 2. Usuarios aleatorios (coleccionistas)
    const coleccionistas = ['ash_ketchum', 'yugi_muto', 'kaiba_corp', 'collector99', 'pokemaniac'];
    for (const username of coleccionistas) {
      const exists = await User.findOne({ username });
      if (!exists) {
        const pass = await bcrypt.hash('123456', 10);
        await User.create({ username, password: pass, role: 'user' });
      }
    }

    // 3. Cromos aleatorios con imágenes reales si está vacío
    const count = await Producto.countDocuments();
    if (count === 0) {
      const cromos = [
        { nombre: "Charizard Base Set 1st Edition", precio: 2500, vendedor: "ash_ketchum", descripcion: "Holográfica en perfecto estado PSA 9.", imagen: "https://images.unsplash.com/photo-1613589417855-46747f43391b?auto=format&fit=crop&w=600&q=80" },
        { nombre: "Blue-Eyes White Dragon", precio: 1200, vendedor: "kaiba_corp", descripcion: "Legend of Blue Eyes White Dragon. First Edition.", imagen: "https://images.unsplash.com/photo-1620336655174-32684ab34c76?auto=format&fit=crop&w=600&q=80" },
        { nombre: "Pikachu Illustrator", precio: 50000, vendedor: "collector99", descripcion: "El santo grial de los cromos Pokémon.", imagen: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&w=600&q=80" },
        { nombre: "Dark Magician", precio: 800, vendedor: "yugi_muto", descripcion: "El mago definitivo en cuanto a ataque y defensa.", imagen: "https://images.unsplash.com/photo-1563200004-bb52c222956c?auto=format&fit=crop&w=600&q=80" },
        { nombre: "Mewtwo Star Gold Star", precio: 1500, vendedor: "pokemaniac", descripcion: "EX Holon Phantoms. Ligeros signos de uso en los bordes.", imagen: "https://images.unsplash.com/photo-1542779283-429940ce8336?auto=format&fit=crop&w=600&q=80" },
        { nombre: "Gengar VMAX Alt Art", precio: 300, vendedor: "user", descripcion: "Arte alternativo de Fusion Strike. Preciosa carta.", imagen: "https://images.unsplash.com/photo-1618365908648-e71bd5716cba?auto=format&fit=crop&w=600&q=80" },
        { nombre: "Black Lotus - Alpha", precio: 150000, vendedor: "collector99", descripcion: "Magic The Gathering - Alpha Edition. BGS 9.5", imagen: "https://images.unsplash.com/photo-1518712399996-0f7feded1184?auto=format&fit=crop&w=600&q=80" },
        { nombre: "Lugia Neo Genesis Holo", precio: 950, vendedor: "ash_ketchum", descripcion: "1st Edition. Una de las cartas más bonitas de Johto.", imagen: "https://images.unsplash.com/photo-1596775697669-e70d4fcfa6e0?auto=format&fit=crop&w=600&q=80" },
        { nombre: "Slifer the Sky Dragon", precio: 450, vendedor: "yugi_muto", descripcion: "God Card original no jugable GBI.", imagen: "https://images.unsplash.com/photo-1618520847971-ce45bf6ab9e5?auto=format&fit=crop&w=600&q=80" }
      ];

      await Producto.insertMany(cromos);
      console.log(`✅ Base de datos rellenada con ${cromos.length} cromos aleatorios!`);
    }

  } catch (err) {
    console.log('Error en seeder:', err.message);
  }
}

async function startServer() {
  await client.connect();
  await connectDB();
  await seedDB();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
}

if (require.main === module) {
  startServer();
}

module.exports = app;
