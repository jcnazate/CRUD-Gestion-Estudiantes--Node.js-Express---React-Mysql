const mysql = require("mysql2/promise");

const ConnectDB = async () => {
  // 1. Crear pool temporal para crear la base de datos si no existe
  const poolTmp = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    waitForConnections: process.env.DB_WAITFORCONNECTIONS,
    connectionLimit: process.env.DB_CONNECTIONLIMIT,
    queueLimit: process.env.DB_QUEUELIMIT
  });

  // 2. Crea la base de datos si no existe
  await poolTmp.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\``
  );
  console.log(`Database ${process.env.DB_DATABASE} created or already exists.`);
  await poolTmp.end();

  // 3. Crear pool principal usando la base de datos
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: process.env.DB_WAITFORCONNECTIONS,
    connectionLimit: process.env.DB_CONNECTIONLIMIT,
    queueLimit: process.env.DB_QUEUELIMIT
  });

  // 4. Crea las tablas como antes
  await pool.query(`CREATE TABLE IF NOT EXISTS \`${process.env.DB_TABLENAME}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre_completo VARCHAR(100) NOT NULL,
        fecha_nacimiento DATE NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        telefono VARCHAR(20),
        matricula VARCHAR(30) NOT NULL UNIQUE,
        carrera VARCHAR(100) NOT NULL,
        anio_semestre VARCHAR(20) NOT NULL,
        promedio DECIMAL(4,2),
        estado ENUM('activo','egresado','suspendido') DEFAULT 'activo',
        fecha_ingreso DATE NOT NULL,
        fecha_egreso DATE,
        direccion VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  console.log(`${process.env.DB_TABLENAME} table created or already exists.`);

  await pool.query(`CREATE TABLE IF NOT EXISTS auth_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  console.log(`auth_users table created or already exists.`);

  // Tabla profesores
  await pool.query(`CREATE TABLE IF NOT EXISTS profesores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE
  )`);
  console.log(`profesores table created or already exists.`);

  // Tabla materias (asignada a un profesor)
  await pool.query(`CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    creditos INT NOT NULL,
    horas INT NOT NULL,
    profesor_id INT,
    FOREIGN KEY (profesor_id) REFERENCES profesores(id)
      ON DELETE SET NULL ON UPDATE CASCADE
  )`);
  console.log(`materias table created or already exists.`);

  // Tabla intermedia estudiante_materia (muchos a muchos)
  await pool.query(`CREATE TABLE IF NOT EXISTS estudiante_materia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    materia_id INT NOT NULL,
    FOREIGN KEY (estudiante_id) REFERENCES ${process.env.DB_TABLENAME}(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  )`);
  console.log(`estudiante_materia table created or already exists.`);

  // Crear tabla estudiantes
  await pool.query(`CREATE TABLE IF NOT EXISTS estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  console.log('estudiantes table created or already exists.');

  // Insertar datos de prueba solo si la tabla está vacía
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM estudiantes');
  if (rows[0].count === 0) {
    await pool.query(`INSERT INTO estudiantes (nombre_completo, matricula, email) VALUES
      ('Juan Pérez', '12345', 'juan@example.com'),
      ('María López', '67890', 'maria@example.com')`);
    console.log('Test data inserted into estudiantes table.');
  }

  return pool;
}

module.exports = ConnectDB;