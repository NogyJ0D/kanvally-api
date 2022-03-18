# kanvally-api

Rol global de usuario:
  
  0 - Sin verificar   > No puede hacer nada
  
  1 - Usuario normal  > Puede crear y pertenecer a proyectos
  
  2 - Administrador   > Puede hacer todo

Rol de usuario por equipo:
  
  1 - Miembro     > Realiza las tareas
  
  2 - Tester      > Prueba las tareas
  
  3 - Líder       > Crea y edita las tareas

Rol de usuario por proyecto:
  
  1 - Miembro
  
  2 - Jefe

Rol máximo de proyecto: Jefe / Boss > Puede ver todos los equipos, tareas, usuarios y editarlos

Orden:
  Proyecto > Equipos > Tareas

Listas / Estados de tareas:
  
  0 > Congelada
  
  1 > Emergencia
  
  2 > Por hacer
  
  3 > Haciendo
  
  4 > Probando
  
  5 > Pendiente de aprobación

  6 > Completada
  

-------------------------------

Listo:
  >Auth / Usuarios:
    login, validate, signup, logout, passport (google, spotify)
  
  >Proyectos:
    CRUD, invite, expulsar

  >Equipos:
    CRUD, invite, cambiar rol, expulsar

  >Tareas:
    Crear/eliminar, crear/eliminar comentario, cambiar estado.

-------------------------------

Por hacer:

  Manejo de archivos

  >Cosa que podría pero no quiero hacer: 
    >refactorizar todas las queries para que usen promesas
    >agregar mas roles a los proyectos
