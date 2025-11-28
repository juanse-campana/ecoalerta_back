const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando proyecto EcoAlerta Backend...\n');

// Crear estructura de carpetas
const folders = [
  'src',
  'src/config',
  'src/middlewares',
  'src/models',
  'src/controllers',
  'src/routes',
  'src/services',
  'src/utils',
  'uploads',
  'uploads/images',
  'uploads/videos',
  'uploads/audio'
];

folders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ Carpeta creada: ${folder}`);
  } else {
    console.log(`⏭️  Carpeta ya existe: ${folder}`);
  }
});

// Crear archivo .env si no existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=ecoalerta_backend_usr
DB_PASSWORD=contrasena-segura
DB_NAME=ecoalerta
DB_PORT=3306

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion_${Date.now()}
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Archivo .env creado');
  console.log('⚠️  IMPORTANTE: Revisa y actualiza las credenciales en .env\n');
} else {
  console.log('\n⏭️  Archivo .env ya existe\n');
}

// Crear .gitignore si no existe
const gitignorePath = path.join(__dirname, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  const gitignoreContent = `# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# Uploads
uploads/*
!uploads/.gitkeep

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build
dist/
build/
`;
  
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ Archivo .gitignore creado\n');
}

// Crear archivos .gitkeep en carpetas de uploads
const gitkeepFolders = ['uploads/images', 'uploads/videos', 'uploads/audio'];
gitkeepFolders.forEach(folder => {
  const gitkeepPath = path.join(__dirname, folder, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
  }
});

console.log('✨ ¡Configuración completada!\n');
console.log('📋 Próximos pasos:');
console.log('   1. Revisa el archivo .env y actualiza las credenciales');
console.log('   2. Ejecuta: npm run dev');
console.log('   3. El servidor estará en http://localhost:3000\n');