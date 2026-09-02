# Contrato de endpoints — Agente 2 (Especialista Oracle Fusion ERP)

> Este documento es el "contrato de datos" que el Agente 1 (UX/UI) consume para
> construir el wizard. Todos los nombres de recursos deben confirmarse contra
> la instancia real (ej. `InacapTEST`) antes de reemplazar la capa mock en
> `src/api/mockApi.js`. Mientras no existan credenciales/endpoints reales, el
> prototipo usa esta capa simulada como *fuente de verdad* de la forma de los
> datos.
>
> La spec original estimaba **~4 endpoints**. Al construir la UI completa
> aparece un 5to necesario: listar el catálogo de Data Access Sets (Endpoint 4
> abajo), sin el cual la pantalla de accesos a datos no tendría de dónde
> obtener las opciones para mostrar.

## Autenticación

- **Método:** OAuth 2.0 — Client Credentials, con un cliente externo ya
  registrado en la **Consola de Seguridad de Fusion** (Security Console →
  API Authentication).
- El token se obtiene contra el endpoint de token de IDCS y se envía como
  `Authorization: Bearer {access_token}` en cada llamada, tanto a endpoints
  IDCS/SCIM como a endpoints FSCM REST.
- Scopes esperados: acceso de administrador a `Users`, `Roles` (IDCS) y a los
  recursos de seguridad de FSCM (`dataAccessSets` o equivalente en la Security
  Console API).
- El token debe refrescarse server-side (BFF/backend intermedio); el frontend
  **no** debe manejar client secret directamente — llama a un backend propio
  que hace de proxy hacia Fusion.

## Endpoint 1 — Buscar/validar usuario

`GET {idcsBaseUrl}/admin/v1/Users?filter=userName eq "{userName}"`

**Response (200, usuario encontrado):**
```json
{
  "totalResults": 1,
  "Resources": [
    {
      "id": "u-1001",
      "userName": "jperez",
      "displayName": "Juan Pérez",
      "emails": [{ "value": "juan.perez@inacap.cl", "primary": true }],
      "active": true,
      "urn:ietf:params:scim:schemas:oracle:idcs:extension:user:User": {
        "department": "Finanzas"
      }
    }
  ]
}
```

**Errores esperados:**
| Caso | HTTP | Código interno |
|---|---|---|
| Usuario no existe | 200 con `totalResults: 0` (SCIM no usa 404 en filtros) — mapear a `USER_NOT_FOUND` en el backend | `USER_NOT_FOUND` |
| Usuario inactivo/bloqueado | 200, `active: false` → mapear a error de negocio | `USER_INACTIVE` |
| Token expirado/ inválido | 401 | `AUTH_ERROR` |
| Fusion no disponible | 502/503 | `NETWORK_ERROR` |

> Nota: el prototipo simplifica esto devolviendo directamente un objeto de
> usuario o lanzando un error tipado (`ApiError` con `status`/`code`), para
> que la UI no tenga que interpretar la envoltura SCIM cruda.

## Endpoint 2 — Listar roles disponibles / roles de un usuario

- **Catálogo completo:** `GET {fscmBaseUrl}/hcmRestApi/resources/11.13.18.05/roles`
  (o el recurso de "Roles" expuesto vía SCIM Roles API `/admin/v1/Roles`,
  a confirmar cuál expone mejor el catálogo combinado FSCM+HCM en la instancia).
- **Roles de un usuario puntual:** se puede obtener del mismo recurso `Users`
  (IDCS SCIM) expandiendo el atributo `roles`, o vía
  `GET {fscmBaseUrl}/hcmRestApi/resources/.../roles?userId={id}`.

**Response (catálogo, ejemplo simplificado):**
```json
{
  "items": [
    {
      "roleId": "ROLE_AP_SPEC",
      "roleCode": "AP_INVOICE_SPECIALIST",
      "roleName": "Accounts Payable Invoice Specialist",
      "module": "FSCM"
    }
  ]
}
```

**Errores esperados:** `NETWORK_ERROR` (503), `AUTH_ERROR` (401), `USER_NOT_FOUND`
(404, al pedir roles de un usuario origen inexistente para la función de copiar roles).

## Endpoint 3 — Asignar roles a usuario

`PATCH {idcsBaseUrl}/admin/v1/Users/{id}`

**Request:**
```json
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
  "Operations": [
    {
      "op": "add",
      "path": "roles",
      "value": [
        { "value": "ROLE_BASE_ERP_STD" },
        { "value": "ROLE_AP_SPEC" }
      ]
    }
  ]
}
```

**Response (200):** representación actualizada del usuario con la lista de
roles resultante.

**Errores esperados:**
| Caso | HTTP | Código interno |
|---|---|---|
| Rol duplicado (ya asignado) | 200 idempotente en SCIM, pero puede devolver warning — decidir si se filtra client-side antes de enviar | `ROLE_DUPLICATE` (validación previa en UI) |
| Rol inexistente/código incorrecto | 400 | `VALIDATION_ERROR` |
| Falla de escritura en Fusion | 500 | `PATCH_FAILED` |

> **Limitación de Fusion señalada por Agente 2:** no existe una operación
> nativa de "copiar roles" entre usuarios. El flujo de "Copiar roles de otro
> usuario" es **compuesto**: 1) `GET` roles del usuario origen (Endpoint 2),
> 2) el usuario final selecciona cuáles copiar en la UI, 3) se reescriben como
> parte del mismo payload de este Endpoint 3 sobre el usuario destino.

## Endpoint 4 — Listar catálogo de Data Access Sets disponibles

> **No estaba en el listado original de 4 endpoints de la spec** — se agrega
> porque la UI necesita mostrarle al Master Admin qué data access sets existen
> antes de poder elegir uno. Sin este endpoint, el catálogo tendría que estar
> hardcodeado en el frontend, lo cual no es viable en un ambiente real donde
> los sets cambian por instancia/Business Unit.

`GET {fscmBaseUrl}/fscmRestApi/resources/11.13.18.05/dataAccessSets`
(o el recurso equivalente que exponga la Security Console para "Manage Data
Access Sets"; confirmar nombre exacto contra la instancia).

**Response (200):**
```json
{
  "items": [
    {
      "dataAccessSetId": "DAS_SANTIAGO_RO",
      "name": "InacapTEST - BU Santiago (Read Only)",
      "businessUnit": "Santiago",
      "accessLevel": "READ_ONLY"
    }
  ]
}
```

**Errores esperados:** `NETWORK_ERROR` (503), `AUTH_ERROR` (401).

## Endpoint 5 — Asignar data access sets a un usuario

`POST {fscmBaseUrl}/fscmRestApi/resources/11.13.18.05/dataAccessSets/action/assignToUser`
(nombre de recurso de ejemplo — Fusion también expone esto vía la interfaz de
"Manage Data Access for Users" de la Security Console; confirmar si hay REST
directo o si requiere un job/proceso ESS en la instancia real).

**Request:**
```json
{
  "userId": "u-1001",
  "dataAccessSetIds": ["DAS_SANTIAGO_RO", "DAS_ALL_BU_RW"]
}
```

**Response (200):**
```json
{
  "userId": "u-1001",
  "dataAccessSetIds": ["DAS_SANTIAGO_RO", "DAS_ALL_BU_RW"],
  "updatedAt": "2026-09-02T15:30:00Z"
}
```

**Errores esperados:** `VALIDATION_ERROR` (400, sin sets seleccionados),
`DAS_ASSIGN_FAILED` (500), `AUTH_ERROR` (401).

## Resumen de mapeo UI ↔ endpoints

| Paso del wizard | Endpoint(s) |
|---|---|
| 1. Buscar usuario | Endpoint 1 |
| 2. Asignar roles | Endpoint 2 (catálogo) |
| 3. Copiar roles (opcional) | Endpoint 1 (buscar origen) + Endpoint 2 (roles del origen) |
| 4. Accesos a datos | Endpoint 4 (catálogo de data access sets) |
| 5. Confirmar | Endpoint 3 (roles) + Endpoint 5 (data access sets), en secuencia |

## Estado de esta versión

Todo lo anterior está **simulado** en `src/api/mockApi.js` con la misma forma
de datos, delays de red artificiales y errores tipados, para que el reemplazo
por las llamadas reales sea un cambio acotado a esa capa.
