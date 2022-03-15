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
  0 > Por hacer
  1 > Haciendo
  2 > Probando
  3 > Completada
  4 > Congelada
  5 > Emergencia

Listo:
  >Auth / Usuarios:
    login, validate, signup, logout, passport (google, spotify)
  
  >Proyectos:
    CRUD, invite

  >Equipos:
    CRUD, invite

Por hacer:

  Equipos
    expulsar miembro

  Listas / Tareas
    CRUD