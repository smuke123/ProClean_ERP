import pool from '../config/database.js';

/**
 * Script para verificar que la tabla Carritos existe y está funcionando correctamente
 */
async function verifyCarritosTable() {
  console.log('=== Verificación de tabla Carritos ===\n');
  
  try {
    // 1. Verificar que la tabla existe
    console.log('1. Verificando que la tabla Carritos existe...');
    const [tables] = await pool.query(`
      SHOW TABLES LIKE 'Carritos'
    `);
    
    if (tables.length === 0) {
      console.error('❌ ERROR: La tabla Carritos NO existe');
      console.log('\nPara crear la tabla, ejecuta:');
      console.log('mysql -u root -p < backend/src/database/migrations/001_add_carritos_table.sql\n');
      process.exit(1);
    }
    
    console.log('✅ La tabla Carritos existe\n');
    
    // 2. Verificar estructura de la tabla
    console.log('2. Estructura de la tabla:');
    const [columns] = await pool.query(`
      DESCRIBE Carritos
    `);
    console.table(columns);
    
    // 3. Contar registros
    console.log('3. Contando registros en la tabla...');
    const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) as total FROM Carritos
    `);
    console.log(`Total de registros: ${total}\n`);
    
    // 4. Mostrar registros por usuario
    console.log('4. Registros por usuario:');
    const [usuarioStats] = await pool.query(`
      SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        COUNT(c.id_carrito) as items_en_carrito,
        SUM(c.cantidad) as total_productos
      FROM Usuarios u
      LEFT JOIN Carritos c ON u.id_usuario = c.id_usuario
      GROUP BY u.id_usuario
      HAVING items_en_carrito > 0
      ORDER BY items_en_carrito DESC
    `);
    
    if (usuarioStats.length > 0) {
      console.table(usuarioStats);
    } else {
      console.log('No hay carritos con productos.\n');
    }
    
    // 5. Mostrar últimos 10 registros
    console.log('5. Últimos 10 registros en Carritos:');
    const [recentItems] = await pool.query(`
      SELECT 
        c.id_carrito,
        c.id_usuario,
        u.nombre as usuario,
        c.id_producto,
        p.nombre as producto,
        c.cantidad,
        c.fecha_agregado,
        c.fecha_actualizado
      FROM Carritos c
      INNER JOIN Usuarios u ON c.id_usuario = u.id_usuario
      INNER JOIN Productos p ON c.id_producto = p.id_producto
      ORDER BY c.fecha_actualizado DESC
      LIMIT 10
    `);
    
    if (recentItems.length > 0) {
      console.table(recentItems);
    } else {
      console.log('No hay registros en la tabla Carritos.\n');
    }
    
    console.log('✅ Verificación completada exitosamente\n');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar la verificación
verifyCarritosTable();

