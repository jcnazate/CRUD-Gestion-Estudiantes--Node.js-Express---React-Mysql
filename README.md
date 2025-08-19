<h1>MySQL CRUD - Node.js, React.js</h1>

<p>Este proyecto es una aplicación CRUD (Crear, Leer, Actualizar, Eliminar) para la gestión de estudiantes. Permite registrar, listar, editar y eliminar estudiantes, almacenando los datos en una base de datos MySQL. Además, incluye autenticación de usuarios mediante JWT para proteger las operaciones del backend.</p>

<h2>Tecnologías Utilizadas</h2>
<ul>
  <li><b>Node.js</b>: Entorno de ejecución para el backend.</li>
  <li><b>Express.js</b>: Framework para manejar la lógica del servidor.</li>
  <li><b>MySQL</b>: Base de datos relacional para almacenar los datos de los estudiantes y usuarios.</li>
  <li><b>React.js</b>: Biblioteca para construir la interfaz de usuario del frontend.</li>
  <li><b>JWT (JSON Web Tokens)</b>: Para la autenticación y autorización de usuarios.</li>
  <li><b>Docker Compose</b>: Para configurar y ejecutar el contenedor de MySQL.</li>
</ul>

<h3>Cómo Ejecutar el Proyecto Localmente</h3>
<p>Sigue estos pasos para ejecutar el proyecto en tu máquina local:</p>

<h4>1. Configurar el Contenedor de MySQL</h4>
<p>El proyecto utiliza Docker Compose para configurar y ejecutar un contenedor de MySQL. Asegúrate de tener Docker y Docker Compose instalados en tu máquina.</p>

1. Navega al directorio raíz del proyecto:
   ```bash
   cd d:\Mysql-CRUD-Operations-With-Nodejs-And-Reactjs-main
   ```

2. Inicia el contenedor de MySQL:
   ```bash
   docker-compose up -d
   ```

3. Verifica que el contenedor esté corriendo:
   ```bash
   docker ps
   ```

<h4>2. Configurar el Backend</h4>
1. Navega al directorio del backend:
   ```bash
   cd server
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en el directorio `server` basado en el archivo `.env.sample`. Asegúrate de configurar correctamente las variables de entorno, como `DB_HOST`, `DB_USER`, `DB_PASSWORD`, y `JWT_SECRET`.

4. Inicia el servidor backend:
   ```bash
   npm start
   ```

5. El backend estará disponible en `http://localhost:5000`.

<h4>3. Configurar el Frontend</h4>
1. Navega al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor del frontend:
   ```bash
   npm start
   ```

4. El frontend estará disponible en `http://localhost:3000`.

<h4>4. Acceso a la Aplicación</h4>
- Abre tu navegador y accede a:
  - Frontend: `http://localhost:3000`
  - Backend (API): `http://localhost:5000`

<h3>Descripción del Proyecto</h3>
<p>La aplicación permite gestionar estudiantes con los siguientes datos:</p>
<ul>
  <li>Nombre completo</li>
  <li>Fecha de nacimiento</li>
  <li>Correo electrónico</li>
  <li>Teléfono</li>
  <li>Matrícula</li>
  <li>Carrera</li>
  <li>Año o semestre</li>
  <li>Promedio</li>
  <li>Estado (activo, egresado, suspendido)</li>
  <li>Fecha de ingreso</li>
  <li>Fecha de egreso</li>
  <li>Dirección</li>
</ul>

<p>Además, incluye autenticación de usuarios para proteger las operaciones del backend. Los usuarios deben registrarse e iniciar sesión para realizar operaciones como crear, editar o eliminar estudiantes.</p>

<h3>Notas Importantes</h3>
<ul>
  <li>Asegúrate de que el contenedor de MySQL esté corriendo antes de iniciar el backend.</li>
  <li>El archivo `.env` debe estar correctamente configurado en el directorio `server`.</li>
  <li>Instala las dependencias tanto en el backend como en el frontend antes de iniciar los servidores.</li>
</ul>
