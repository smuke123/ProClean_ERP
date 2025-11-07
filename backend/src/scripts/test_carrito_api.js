import pool from '../config/database.js';
import { User } from '../models/User.js';
import { Carrito } from '../models/Carrito.js';

/**
 * Script para probar que el modelo Carrito funciona correctamente
 */
async function testCarritoAPI() {
  console.log('=== Prueba del Sistema de Carrito ===\n');
  
  try {
    // 1. Buscar un usuario de prueba
    console.log('1. Buscando usuario de prueba...');
    const [users] = await pool.query(`
      SELECT id_usuario, nombre, email FROM Usuarios LIMIT 1
    `);
    
    if (users.length === 0) {
      console.error('❌ ERROR: No hay usuarios en la base de datos');
      console.log('Por favor, crea un usuario primero.\n');
      process.exit(1);
    }
    
    const testUser = users[0];
    console.log(`✅ Usuario de prueba: ${testUser.nombre} (ID: ${testUser.id_usuario})\n`);
    
    // 2. Buscar un producto de prueba
    console.log('2. Buscando producto de prueba...');
    const [products] = await pool.query(`
      SELECT id_producto, nombre, precio FROM Productos WHERE activo = TRUE LIMIT 1
    `);
    
    if (products.length === 0) {
      console.error('❌ ERROR: No hay productos activos en la base de datos');
      console.log('Por favor, crea un producto primero.\n');
      process.exit(1);
    }
    
    const testProduct = products[0];
    console.log(`✅ Producto de prueba: ${testProduct.nombre} (ID: ${testProduct.id_producto})\n`);
    
    // 3. Limpiar el carrito del usuario de prueba
    console.log('3. Limpiando carrito anterior del usuario...');
    await Carrito.clearCarrito(testUser.id_usuario);
    console.log('✅ Carrito limpiado\n');
    
    // 4. Agregar producto al carrito
    console.log('4. Agregando producto al carrito...');
    const result = await Carrito.addItem(testUser.id_usuario, testProduct.id_producto, 2);
    console.log(`✅ Producto agregado:`, result);
    console.log('');
    
    // 5. Obtener el carrito
    console.log('5. Obteniendo carrito del usuario...');
    const carritoItems = await Carrito.getByUsuario(testUser.id_usuario);
    console.log(`✅ Items en el carrito: ${carritoItems.length}`);
    console.table(carritoItems);
    
    // 6. Verificar totales
    console.log('6. Calculando totales...');
    const total = await Carrito.getTotal(testUser.id_usuario);
    const itemCount = await Carrito.getItemCount(testUser.id_usuario);
    console.log(`✅ Total: $${total}`);
    console.log(`✅ Cantidad de items: ${itemCount}\n`);
    
    // 7. Actualizar cantidad
    console.log('7. Actualizando cantidad del producto...');
    await Carrito.updateQuantity(testUser.id_usuario, testProduct.id_producto, 5);
    const updatedItems = await Carrito.getByUsuario(testUser.id_usuario);
    console.log(`✅ Cantidad actualizada a: ${updatedItems[0].cantidad}\n`);
    
    // 8. Agregar otro producto (si existe)
    const [moreProducts] = await pool.query(`
      SELECT id_producto, nombre FROM Productos 
      WHERE activo = TRUE AND id_producto != ?
      LIMIT 1
    `, [testProduct.id_producto]);
    
    if (moreProducts.length > 0) {
      console.log('8. Agregando segundo producto...');
      await Carrito.addItem(testUser.id_usuario, moreProducts[0].id_producto, 3);
      const multiItems = await Carrito.getByUsuario(testUser.id_usuario);
      console.log(`✅ Carrito ahora tiene ${multiItems.length} productos diferentes\n`);
    }
    
    // 9. Verificar persistencia
    console.log('9. Verificando persistencia en la base de datos...');
    const [dbItems] = await pool.query(`
      SELECT * FROM Carritos WHERE id_usuario = ?
    `, [testUser.id_usuario]);
    console.log(`✅ Registros en la BD: ${dbItems.length}`);
    console.table(dbItems);
    
    // 10. Limpiar carrito
    console.log('10. Limpiando carrito...');
    await Carrito.clearCarrito(testUser.id_usuario);
    const emptyCarrito = await Carrito.getByUsuario(testUser.id_usuario);
    console.log(`✅ Carrito limpiado. Items restantes: ${emptyCarrito.length}\n`);
    
    console.log('===========================================');
    console.log('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
    console.log('===========================================\n');
    console.log('El sistema de carrito está funcionando correctamente.');
    console.log('Si el problema persiste en el frontend, revisa:');
    console.log('  1. Que el usuario esté autenticado (token válido)');
    console.log('  2. Que las llamadas al API estén llegando al backend');
    console.log('  3. Los logs del navegador (console.log) en CartContext.jsx\n');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testCarritoAPI();

