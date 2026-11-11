/**
 * Script para poner a 0 todo el sistema ERP desde la terminal.
 * Ejecutar con: npm run reset-db
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const initialDataPath = path.resolve(__dirname, '../src/data/initialData.ts');

const emptyInitialDataContent = `import { CompanySettings, Customer, DebtRecord, ERPUser, InventoryMovement, Product, Sale } from '../types/erp';

export const initialCompanySettings: CompanySettings = {
  companyName: 'MI EMPRESA C.A.',
  tradeName: 'Mi Negocio ERP',
  taxId: 'J-00000000-0',
  phone: '+1 (555) 000-0000',
  email: 'administracion@miempresa.com',
  address: 'Dirección Comercial Principal',
  currencySymbol: '$',
  currencyCode: 'USD',
  secondaryCurrencySymbol: 'Bs.',
  exchangeRate: 36.50,
  taxRatePercent: 16,
  receiptFooterNote: '¡Gracias por su preferencia! Garantía oficial con este recibo.',
  cashierName: 'Administrador'
};

// BASE DE DATOS INICIALIZADA A CERO (0 REGISTROS)
export const initialProducts: Product[] = [];
export const initialCustomers: Customer[] = [];
export const initialSales: Sale[] = [];
export const initialDebts: DebtRecord[] = [];
export const initialInventoryMovements: InventoryMovement[] = [];

// USUARIOS DEL SISTEMA - ADMIN CON ACCESO TOTAL (CLAVE: 1234)
export const initialUsers: ERPUser[] = [
  {
    id: 'user-admin',
    username: 'ADMIN',
    password: '1234',
    name: 'Administrador General',
    role: 'admin',
    isActive: true,
    permissions: {
      dashboard: true,
      pos: true,
      cobranzas: true,
      inventario: true,
      consultas: true,
      clientes: true,
      usuarios: true,
      configuracion: true
    },
    createdAt: new Date().toISOString().split('T')[0]
  }
];
`;

try {
  fs.writeFileSync(initialDataPath, emptyInitialDataContent, 'utf-8');
  console.log('====================================================');
  console.log('✅ SISTEMA ERP INICIALIZADO A CERO EXITOSAMENTE');
  console.log('====================================================');
  console.log('• Productos en catálogo: 0');
  console.log('• Clientes registrados: 0');
  console.log('• Ventas históricas: 0');
  console.log('• Cuentas por cobrar: 0');
  console.log('• Movimientos de Kardex: 0');
  console.log('• Usuario ADMIN configurado con clave: 1234 (Acceso Total)');
  console.log('');
  console.log('NOTA: En tu navegador, recuerda hacer un refresco forzado o pulsar');
  console.log('"Inicializar a Cero" en Configuración para limpiar el localStorage.');
  console.log('====================================================');
} catch (err) {
  console.error('Error al inicializar la base de datos a 0:', err);
  process.exit(1);
}
