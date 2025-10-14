# Frontend ProClean ERP - Estructura Reorganizada

## 📁 Nueva Estructura de Carpetas

```
frontend/src/
├── components/
│   ├── ui/                    # Componentes base reutilizables
│   │   ├── Button.jsx         # Botón con variantes y tamaños
│   │   ├── Input.jsx          # Input con label y validación
│   │   ├── Sidebar.jsx        # Sidebar base reutilizable
│   │   ├── Badge.jsx          # Badge con variantes
│   │   ├── Card.jsx           # Card con hover y padding
│   │   └── index.js           # Exportaciones centralizadas
│   ├── layout/               # Componentes de layout
│   │   ├── Header.jsx         # Header principal con navegación
│   │   └── Footer.jsx         # Footer de la aplicación
│   ├── features/             # Componentes específicos por funcionalidad
│   │   ├── auth/
│   │   │   └── UserSidebar.jsx
│   │   ├── cart/
│   │   │   └── CartSidebar.jsx
│   │   ├── favorites/
│   │   │   └── FavoritesSidebar.jsx
│   │   └── products/
│   │       └── (futuros componentes de productos)
│   └── forms/                # Formularios
│       ├── ComprasForm.jsx
│       ├── PedidosForm.jsx
│       └── ProductosCrud.jsx
├── contexts/                 # Contextos de estado
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── FavoritesContext.jsx
├── hooks/                    # Custom hooks (futuro)
├── pages/                    # Páginas principales
│   ├── Home.jsx
│   ├── Categories.jsx
│   ├── Contact.jsx
│   ├── Login.jsx
│   ├── Gestion.jsx
│   └── Informes.jsx
├── utils/                    # Utilidades
│   └── api.js
├── styles/                   # Estilos globales (futuro)
└── App.jsx
```

## 🎨 Componentes UI con Tailwind

### **Button**
- **Variantes**: `primary`, `secondary`, `danger`, `success`, `ghost`
- **Tamaños**: `sm`, `md`, `lg`, `xl`
- **Props**: `variant`, `size`, `className`, `onClick`, `disabled`

### **Input**
- **Props**: `label`, `error`, `className`
- **Estilos**: Focus ring, validación de errores

### **Sidebar**
- **Props**: `isOpen`, `onClose`, `title`, `children`, `width`
- **Responsive**: Ancho configurable

### **Badge**
- **Variantes**: `default`, `primary`, `success`, `danger`, `warning`, `info`
- **Tamaños**: `sm`, `md`, `lg`

### **Card**
- **Props**: `children`, `className`, `padding`, `hover`
- **Efectos**: Hover shadow opcional
