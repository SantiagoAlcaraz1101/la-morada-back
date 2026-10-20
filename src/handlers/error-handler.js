const STATUS = require("./status-handler");
const logger = require("../utils/logger");

const ERROR_MAP = {
  "MISSING CREDENTIALS": ["Credenciales faltantes", STATUS.BAD_REQUEST],
  "INVALID EMAIL": ["Correo electrónico inválido", STATUS.BAD_REQUEST],
  "INVALID PASSWORD": ["La contraseña no cumple la política definida", STATUS.BAD_REQUEST],
  "WRONG PASSWORD": ["Contraseña incorrecta", STATUS.UNAUTHORIZED],
  "UNAUTHORIZED": ["No autorizado", STATUS.FORBIDDEN],
  "ACCESS DENIED": ["Acceso denegado", STATUS.FORBIDDEN],
  "INVALID TOKEN": ["Token inválido o expirado", STATUS.UNAUTHORIZED],
  "TOKEN REQUIRED": ["Se requiere un token", STATUS.UNAUTHORIZED],
  "CORS ORIGIN NOT ALLOWED": ["Origen no permitido", STATUS.FORBIDDEN],

  "PATIENTID REQUIRED": ["Se requiere el ID del paciente", STATUS.BAD_REQUEST],
  "PSYCHOLOGISTID REQUIRED": ["Se requiere el ID del psicólogo", STATUS.BAD_REQUEST],
  "INVALID PATIENT": ["Paciente inválido", STATUS.BAD_REQUEST],
  "INVALID PSYCHOLOGIST": ["Psicólogo inválido", STATUS.BAD_REQUEST],
  "INVALID START DATE": ["Fecha de inicio inválida", STATUS.BAD_REQUEST],
  "INVALID STATUS": ["Estado inválido", STATUS.BAD_REQUEST],
  "APPOINTMENT NOT FOUND": ["Cita no encontrada", STATUS.NOT_FOUND],
  "TIME ALREADY BOOKED": ["Ya existe una cita en este horario", STATUS.CONFLICT],
  "TIME NOT AVAILABLE IN SLOT": ["La hora no pertenece a un horario disponible", STATUS.BAD_REQUEST],
  "PSYCHOLOGIST HAS NO AVAILABILITY": ["El psicólogo no ha publicado disponibilidad", STATUS.BAD_REQUEST],
  "DATE MUST BE IN THE FUTURE": ["La fecha debe ser futura", STATUS.BAD_REQUEST],
  "DAY NOT AVAILABLE": ["El psicólogo no atiende ese día", STATUS.BAD_REQUEST],
  "CANNOT CHANGE COMPLETED APPOINTMENT": ["No se puede cambiar una cita completada", STATUS.CONFLICT],
  "CANNOT CHANGE CANCELLED APPOINTMENT": ["No se puede cambiar una cita cancelada", STATUS.CONFLICT],

  "PSYCHOLOGIST_ID REQUIRED": ["Se requiere el ID del psicólogo", STATUS.BAD_REQUEST],
  "DAYS REQUIRED": ["Se deben especificar días de disponibilidad", STATUS.BAD_REQUEST],
  "SLOTS REQUIRED": ["Se debe especificar al menos un horario", STATUS.BAD_REQUEST],
  "DUPLICATE DAY": ["No se permiten días duplicados", STATUS.BAD_REQUEST],
  "INVALID DAY": ["Día inválido", STATUS.BAD_REQUEST],
  "INVALID SLOT TIME": ["Horario inválido", STATUS.BAD_REQUEST],
  "AVAILABILITY NOT FOUND": ["Disponibilidad no encontrada", STATUS.NOT_FOUND],

  "ID EXISTS": ["Identificación ya registrada", STATUS.CONFLICT],
  "EMAIL EXISTS": ["Correo electrónico ya registrado", STATUS.CONFLICT],
  "USER NOT FOUND": ["Usuario no encontrado", STATUS.NOT_FOUND],
  "USER NOT FOUND OR NOT PSYCHOLOGIST": ["Usuario no encontrado o sin rol de psicólogo", STATUS.FORBIDDEN],
  "INVALID ROLE": ["El usuario no tiene el rol requerido", STATUS.FORBIDDEN],
  "INVALID PARAMS": ["Parámetros inválidos", STATUS.BAD_REQUEST],
  "INVALID ID": ["Identificación inválida", STATUS.BAD_REQUEST],
  "INVALID DOC TYPE": ["Tipo de documento inválido", STATUS.BAD_REQUEST],
  "INVALID NAME": ["Nombre inválido", STATUS.BAD_REQUEST],
  "INVALID LASTNAME1": ["Primer apellido inválido", STATUS.BAD_REQUEST],
  "INVALID LASTNAME2": ["Segundo apellido inválido", STATUS.BAD_REQUEST],
  "INVALID AGE": ["Edad inválida", STATUS.BAD_REQUEST],
  "INVALID PHONE": ["Teléfono inválido", STATUS.BAD_REQUEST],
  "FIELDS NOT UPDATABLE": ["Algunos campos no se pueden actualizar", STATUS.BAD_REQUEST],
  "PASSWORD_MISMATCH": ["Las contraseñas no coinciden", STATUS.BAD_REQUEST],
  "CODE EXPIRED OR NOT FOUND": ["Código vencido o inexistente", STATUS.BAD_REQUEST],
  "INVALID CODE": ["Código inválido", STATUS.BAD_REQUEST],

  "INVALID CARD NUMBER": ["Número de tarjeta inválido", STATUS.BAD_REQUEST],
  "INVALID CARD NAME": ["Nombre de tarjeta inválido", STATUS.BAD_REQUEST],
  "INVALID EXPIRATION DATE": ["Fecha de expiración inválida", STATUS.BAD_REQUEST],
  "INVALID CVV": ["CVV inválido", STATUS.BAD_REQUEST],
  "PAYMENT NOT FOUND": ["Método de pago no encontrado", STATUS.NOT_FOUND],

  "PRODUCT NOT FOUND": ["Producto no encontrado", STATUS.NOT_FOUND],
  "PRODUCT EXISTS": ["El producto ya existe", STATUS.CONFLICT],
  "INVALID PRODUCT_ID": ["ID de producto inválido", STATUS.BAD_REQUEST],
  "INVALID QUANTITY": ["Cantidad inválida", STATUS.BAD_REQUEST],
  "CART NOT FOUND": ["Carrito no encontrado", STATUS.NOT_FOUND],
  "CART EMPTY": ["El carrito está vacío", STATUS.BAD_REQUEST],

  "POST NOT FOUND": ["Publicación no encontrada", STATUS.NOT_FOUND],
  "INVALID TITLE": ["Título inválido", STATUS.BAD_REQUEST],
  "INVALID AUTHOR": ["Autor inválido", STATUS.BAD_REQUEST],
  "INVALID PUBLISH_YEAR": ["Año de publicación inválido", STATUS.BAD_REQUEST],
  "INVALID PRICE": ["Precio inválido", STATUS.BAD_REQUEST],
  "INVALID COVER_URL": ["URL de portada inválida", STATUS.BAD_REQUEST],
  "INVALID CONTENT": ["Contenido inválido", STATUS.BAD_REQUEST],
  "INVALID ACTIVE": ["Estado activo inválido", STATUS.BAD_REQUEST],
  "INVALID YOUTUBE ID": ["ID de YouTube inválido", STATUS.BAD_REQUEST],
  "INVALID DESCRIPTION": ["Descripción inválida", STATUS.BAD_REQUEST],
};

function handleError(res, err) {
  const key = err.message?.toUpperCase?.() || "DEFAULT";
  const [message, status] = ERROR_MAP[key] || [
    "Error interno del servidor",
    STATUS.INTERNAL_SERVER_ERROR,
  ];

  logger.error(`Error handled: ${err.message}`, { stack: err.stack });
  return res.status(status).json({ success: false, message });
}

module.exports = { handleError };