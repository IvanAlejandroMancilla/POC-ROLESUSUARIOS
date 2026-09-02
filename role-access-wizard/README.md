# Roles & Data Access Wizard — Oracle Fusion (prototipo)

Prototipo funcional del wizard de administración de usuarios y seguridad
(roles + data access sets) para un Master Admin de Oracle Fusion FSCM/HCM.
Construido según `../# Prompt para agentes — Interfaz de asig.md` (spec de
los dos agentes: Arquitecto UX/UI + Especialista Oracle Fusion ERP).

**Todo lo que toca Fusion está simulado** (mock data + mock API con delays y
errores realistas) para que el flujo se pueda navegar de punta a punta sin
credenciales ni instancia real. Ver [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)
para el contrato de endpoints que reemplazaría la capa mock.

## Correr el prototipo

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`).

## Flujo del wizard

1. **Buscar usuario** — valida un `userName` contra IDCS (mock). Prueba con
   `jperez`, `mgonzalez`, `crodriguez`, `ftorres`, `lsilva`, o un username
   inexistente para ver el error.
2. **Asignar roles** — catálogo de roles FSCM/HCM con buscador y filtro por
   módulo. El rol base se asigna automáticamente y no se puede quitar.
3. **Copiar roles de otro usuario** (opcional) — busca un usuario origen,
   revisa sus roles y copia los que quieras hacia el destino.
4. **Accesos a datos** — selección de uno o varios *data access sets*.
5. **Confirmar** — resumen de todo lo seleccionado y botón para "guardar"
   (llama a la API mock, con estados de carga y error).

Usa el checkbox **"Simular fallos de red"** en el header para forzar errores
aleatorios en cualquier llamada y probar el manejo de errores por paso.

## Estructura

```text
src/
  api/mockApi.js          # Implementación mock de los 4 endpoints del contrato
  data/mockData.js        # Usuarios, roles y data access sets de ejemplo
  context/WizardContext.jsx  # Estado global del wizard (useReducer + Context API)
  components/
    Stepper.jsx
    UserSearch.jsx
    RoleAssigner.jsx
    RoleCopier.jsx
    DataAccessAssigner.jsx
    SummaryStep.jsx
    common/               # Spinner, ErrorBanner, Chip
docs/API_CONTRACT.md      # Contrato de endpoints (entregable Agente 2)
```

## Siguientes pasos hacia producción

- Reemplazar `src/api/mockApi.js` por llamadas reales a un backend/BFF que
  haga de proxy OAuth hacia IDCS/FSCM (ver `docs/API_CONTRACT.md`).
- Confirmar nombres exactos de recursos contra la instancia real (ej.
  `InacapTEST`).
- Agregar tests (no incluidos en este prototipo).
