// Datos mock que simulan lo que devolvería la instancia real de Oracle Fusion
// (IDCS SCIM + FSCM/HCM REST APIs). Reemplazar por datos reales cuando existan
// endpoints confirmados por el Agente 2 (ver docs/API_CONTRACT.md).

export const BASE_ROLE = {
  id: 'ROLE_BASE_ERP_STD',
  code: 'ERP_STANDARD_USER',
  name: 'ERP Standard User (Rol base)',
  module: 'Common',
  description: 'Rol mínimo requerido para acceder a cualquier módulo de Fusion. Se asigna automáticamente a todo usuario nuevo.',
  isBase: true,
}

export const mockRoles = [
  BASE_ROLE,
  {
    id: 'ROLE_AP_SPEC',
    code: 'AP_INVOICE_SPECIALIST',
    name: 'Accounts Payable Invoice Specialist',
    module: 'FSCM',
    description: 'Crea y gestiona facturas de proveedores.',
  },
  {
    id: 'ROLE_AP_MGR',
    code: 'AP_MANAGER',
    name: 'Accounts Payable Manager',
    module: 'FSCM',
    description: 'Supervisa el ciclo completo de cuentas por pagar.',
  },
  {
    id: 'ROLE_GL_ACCT',
    code: 'GENERAL_ACCOUNTING_ACCOUNTANT',
    name: 'General Accounting Accountant',
    module: 'FSCM',
    description: 'Registra asientos contables y concilia cuentas.',
  },
  {
    id: 'ROLE_GL_MGR',
    code: 'GENERAL_ACCOUNTING_MANAGER',
    name: 'General Accounting Manager',
    module: 'FSCM',
    description: 'Administra el proceso de cierre contable.',
  },
  {
    id: 'ROLE_BUDGET_ANALYST',
    code: 'BUDGET_ANALYST',
    name: 'Budget Analyst',
    module: 'FSCM',
    description: 'Prepara y monitorea presupuestos.',
  },
  {
    id: 'ROLE_PROC_BUYER',
    code: 'PROCUREMENT_BUYER',
    name: 'Procurement Buyer',
    module: 'FSCM',
    description: 'Gestiona órdenes de compra y proveedores.',
  },
  {
    id: 'ROLE_PROC_MGR',
    code: 'PROCUREMENT_MANAGER',
    name: 'Procurement Manager',
    module: 'FSCM',
    description: 'Aprueba órdenes de compra y contratos.',
  },
  {
    id: 'ROLE_HCM_EMP',
    code: 'EMPLOYEE',
    name: 'Employee (Autoservicio)',
    module: 'HCM',
    description: 'Acceso a autoservicio de empleado (mi información, nómina, ausencias).',
  },
  {
    id: 'ROLE_HCM_HR_SPEC',
    code: 'HUMAN_RESOURCE_SPECIALIST',
    name: 'Human Resource Specialist',
    module: 'HCM',
    description: 'Gestiona datos de personal y procesos de RRHH.',
  },
  {
    id: 'ROLE_HCM_LINE_MGR',
    code: 'LINE_MANAGER',
    name: 'Line Manager',
    module: 'HCM',
    description: 'Autoservicio de gestión de equipo directo.',
  },
  {
    id: 'ROLE_FIN_APP_ADMIN',
    code: 'APPLICATION_IMPLEMENTATION_CONSULTANT',
    name: 'Financial Application Administrator',
    module: 'FSCM',
    description: 'Configura setups funcionales de Financials.',
  },
  {
    id: 'ROLE_IT_SEC_MGR',
    code: 'IT_SECURITY_MANAGER',
    name: 'IT Security Manager',
    module: 'Common',
    description: 'Administra roles, usuarios y políticas de seguridad en Fusion.',
  },
]

export const mockDataAccessSets = [
  {
    id: 'DAS_ALL_BU_RW',
    name: 'InacapTEST - Todas las BU (Read/Write)',
    businessUnit: 'Todas',
    accessLevel: 'Read/Write',
  },
  {
    id: 'DAS_SANTIAGO_RO',
    name: 'InacapTEST - BU Santiago (Read Only)',
    businessUnit: 'Santiago',
    accessLevel: 'Read Only',
  },
  {
    id: 'DAS_REGIONES_RW',
    name: 'InacapTEST - BU Regiones (Read/Write)',
    businessUnit: 'Regiones',
    accessLevel: 'Read/Write',
  },
  {
    id: 'DAS_CORP_LEDGER',
    name: 'Corporate Ledger - Full Access',
    businessUnit: 'Corporativo',
    accessLevel: 'Read/Write',
  },
  {
    id: 'DAS_PAYROLL_RO',
    name: 'Payroll Business Unit (Read Only)',
    businessUnit: 'Payroll',
    accessLevel: 'Read Only',
  },
]

// "Base de datos" simulada de usuarios existentes en IDCS/Fusion.
export const mockUsers = [
  {
    id: 'u-1001',
    userName: 'jperez',
    displayName: 'Juan Pérez',
    email: 'juan.perez@inacap.cl',
    department: 'Finanzas',
    active: true,
    roleIds: ['ROLE_BASE_ERP_STD', 'ROLE_AP_SPEC', 'ROLE_GL_ACCT'],
    dataAccessSetIds: ['DAS_SANTIAGO_RO'],
  },
  {
    id: 'u-1002',
    userName: 'mgonzalez',
    displayName: 'María González',
    email: 'maria.gonzalez@inacap.cl',
    department: 'Contabilidad',
    active: true,
    roleIds: ['ROLE_BASE_ERP_STD', 'ROLE_GL_MGR', 'ROLE_BUDGET_ANALYST', 'ROLE_AP_MGR'],
    dataAccessSetIds: ['DAS_ALL_BU_RW', 'DAS_CORP_LEDGER'],
  },
  {
    id: 'u-1003',
    userName: 'crodriguez',
    displayName: 'Carla Rodríguez',
    email: 'carla.rodriguez@inacap.cl',
    department: 'Recursos Humanos',
    active: true,
    roleIds: ['ROLE_BASE_ERP_STD', 'ROLE_HCM_HR_SPEC', 'ROLE_HCM_EMP'],
    dataAccessSetIds: ['DAS_PAYROLL_RO'],
  },
  {
    id: 'u-1004',
    userName: 'ftorres',
    displayName: 'Felipe Torres',
    email: 'felipe.torres@inacap.cl',
    department: 'Abastecimiento',
    active: true,
    roleIds: ['ROLE_BASE_ERP_STD', 'ROLE_PROC_BUYER'],
    dataAccessSetIds: ['DAS_REGIONES_RW'],
  },
  {
    id: 'u-1005',
    userName: 'lsilva',
    displayName: 'Lorena Silva',
    email: 'lorena.silva@inacap.cl',
    department: 'TI',
    active: true,
    roleIds: ['ROLE_BASE_ERP_STD', 'ROLE_IT_SEC_MGR'],
    dataAccessSetIds: ['DAS_ALL_BU_RW'],
  },
  {
    id: 'u-1006',
    userName: 'dfuentes',
    displayName: 'Diego Fuentes',
    email: 'diego.fuentes@inacap.cl',
    department: 'Operaciones',
    active: false,
    roleIds: ['ROLE_BASE_ERP_STD', 'ROLE_HCM_LINE_MGR'],
    dataAccessSetIds: [],
  },
]
