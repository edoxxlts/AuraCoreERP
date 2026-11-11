# AuraCore ERP - Sistema ERP, Cobranzas, POS e Inventario

Sistema ERP integral con gestor de cobranzas, emisión de recibos de pago y tickets POS, control de inventario y módulo de consultas de ventas.

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:

1. **Node.js**: Versión 18.x, 20.x o superior.
   - Puedes descargarlo gratis desde: [https://nodejs.org/](https://nodejs.org/) (se recomienda la versión **LTS**).
   - Para verificar si lo tienes instalado, abre tu terminal o consola (CMD / PowerShell / Terminal) y escribe:
     ```bash
     node -v
     npm -v
     ```
2. **Git** (Opcional, para clonar el repositorio):
   - [https://git-scm.com/](https://git-scm.com/)

---

## 🛠️ Guía Paso a Paso para Correr la Aplicación

### Paso 1: Descargar o Clonar el Código
Si descargaste el archivo en `.zip`, descomprímelo en la carpeta de tu preferencia (por ejemplo, en `C:\proyectos\cobranza-erp` o en tu Escritorio).

Si usas Git, clónalo en tu terminal:
```bash
git clone <URL_DE_TU_REPOSITORIO>
```

---

### Paso 2: Abrir la Terminal en la Carpeta del Proyecto
Abre tu terminal (PowerShell, Símbolo del sistema o Terminal en Mac/Linux) y dirígete a la carpeta del proyecto:
```bash
cd ruta/a/la/carpeta/del/proyecto
```
*(Tip en Windows: Puedes abrir la carpeta en el Explorador de archivos, hacer clic en la barra de direcciones superior, escribir `cmd` o `powershell` y presionar Enter).*

---

### Paso 3: Instalar las Dependencias
Ejecuta el siguiente comando para descargar e instalar todas las librerías necesarias:
```bash
npm install
```
En caso de fallar la instalacion con ejecutar un force basta.

*(Espera unos momentos mientras npm descarga los paquetes).*

---

### Paso 4: Configurar Variables de Entorno (Opcional)
Crea una copia del archivo `.env.example` y nómbralo `.env`:
- En Windows (PowerShell):
  ```powershell
  Copy-Item .env.example .env
  ```
- En Mac / Linux:
  ```bash
  cp .env.example .env
  ```

---

### Paso 5: Iniciar el Servidor de Desarrollo
Para correr la aplicación en modo desarrollo, ejecuta:
```bash
npm run dev
```

Verás una salida similar a esta en tu consola:
```
  VITE v8.3.0  ready in 320 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

---

### Paso 6: Abrir en tu Navegador Web
Abre tu navegador (Google Chrome, Edge, Brave, Firefox, etc.) y visita:
👉 **`http://localhost:3000`**

¡Listo! Ya tienes la aplicación **CobranzaERP** corriendo al 100% en tu computadora con persistencia de datos local (localStorage).

---

## 📦 Construir para Producción (Opcional)

Si deseas generar los archivos optimizados listos para desplegar en un servidor web (como Nginx, Apache, Vercel, Netlify o Cloud Run):

1. Compila el proyecto:
   ```bash
   npm run build
   ```
2. La compilación se generará en la carpeta `dist/`.
3. Para previsualizar la compilación de producción en local:
   ```bash
   npm run preview
   ```

---

## 📋 Funcionalidades Incluidas

- **Punto de Venta (POS):** Escaneo de código de barras, cálculo de IVA, descuentos, ventas de contado y ventas a crédito.
- **Gestor de Cobranzas:** Cuentas por cobrar, estados de cartera (corriente, vencida, saldada), registro de abonos y recordatorios por WhatsApp.
- **Emisión de Recibos de Pago:** Formato Ticket Térmico (80mm) y Formato Formal Carta/A4 con código QR y firmas.
- **Control de Inventario:** Catálogo completo, costo vs venta, alertas de stock mínimo, ajustes y Libro Kardex cronológico.
- **Consultas de Ventas:** Auditoría, filtros por fecha y método, anulación con reversión automática a almacén y exportación a CSV.
- **Respaldos e Inicialización a Cero:** Descarga/restauración de copias JSON y puesta a 0 con un solo clic desde Configuración.

---

## 🧹 ¿Cómo Inicializar la Base de Datos a 0 (Limpia)?

Si deseas borrar los datos de prueba y comenzar tu negocio desde cero con la base de datos limpia:

Toma en cuenta que estos ajustes solo pueden realizarse desde el modulo de usuario administrador, ninguno de los otros usuarios deberia contar 
con este ajuste

### Opción 1: Directamente desde la interfaz (Recomendado)
1. Ingresa al módulo **Configuración** en el menú lateral.
2. Baja a la sección **"Inicialización y Puesta a Cero de la Base de Datos"**.
3. Elige:
   - **"Borrar Todo e Inicializar a 0"**: Deja el sistema 100% en blanco (0 productos, 0 clientes, 0 ventas, 0 deudas).
   - **"Limpiar Ventas y Cobranzas"**: Mantiene tus productos y clientes, pero resetea a $0.00 todas las ventas y cobranzas.
4. Escribe la palabra de confirmación `RESETEAR` y presiona el botón.

### Opción 2: Desde la consola del navegador
Si prefieres un reseteo instantáneo del almacenamiento local:
1. En tu navegador presiona `F12` para abrir las herramientas de desarrollador.
2. Ve a la pestaña **Consola** (Console).
3. Pega este comando y presiona Enter:
   ```javascript
   localStorage.clear(); location.reload();
   ```
