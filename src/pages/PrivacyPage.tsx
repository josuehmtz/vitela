import { useEffect } from 'react'
import SiteFooter from '../components/layout/SiteFooter'
import SiteHeader from '../components/layout/SiteHeader'
import { CONTACT_EMAIL } from '../lib/site'
import './legal.css'

const UPDATED = '18 de noviembre de 2026'

/**
 * Aviso de privacidad (LFPDPPP, México). También es la "política de privacidad"
 * que Google pide para publicar el inicio de sesión con Google.
 */
export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Aviso de privacidad · Vitela'
  }, [])

  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>

  return (
    <div className="legal-page">
      <SiteHeader links={false} />
      <main className="legal">
        <p className="eyebrow">Legal</p>
        <h1>Aviso de privacidad</h1>
        <p className="muted">Última actualización: {UPDATED}</p>

        <p>
          En <strong>Vitela</strong> cuidamos la información de quienes organizan su evento con nosotros y de sus
          invitados. Este aviso explica qué datos usamos, para qué y cómo puedes ejercer tus derechos, conforme a la
          Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
        </p>

        <h2>Responsable</h2>
        <p>
          Vitela, servicio de invitaciones digitales, es responsable del tratamiento de tus datos personales. Para
          cualquier tema relacionado con tu información puedes escribirnos a {mail}.
        </p>

        <h2>Qué datos usamos</h2>
        <ul>
          <li>
            <strong>Si organizas un evento:</strong> tu correo electrónico y, si entras con Google, el nombre y correo
            de tu cuenta de Google. También los datos de tu evento (nombre, fecha, lugar y diseño de la invitación).
          </li>
          <li>
            <strong>De tus invitados:</strong> el nombre de cada invitación, el número de lugares, el teléfono si lo
            agregas, su respuesta de asistencia, los nombres de quienes asistirán, el mensaje que te dejen y su mesa.
          </li>
          <li>
            <strong>Del personal de recepción:</strong> el nombre con el que das de alta su acceso y las entradas que
            registran.
          </li>
          <li>
            <strong>Pagos:</strong> los datos de tu tarjeta los captura directamente nuestro procesador de pagos
            (Stripe). Vitela no ve ni guarda el número de tu tarjeta; solo recibimos la confirmación del pago.
          </li>
        </ul>
        <p>No solicitamos datos personales sensibles.</p>

        <h2>Para qué los usamos</h2>
        <ul>
          <li>Crear tu cuenta y permitirte iniciar sesión.</li>
          <li>Mostrar a cada invitado su invitación y registrar su confirmación de asistencia.</li>
          <li>Generar los pases de entrada y permitir que tu personal registre la llegada de los invitados.</li>
          <li>Organizar el acomodo de mesas de tu evento.</li>
          <li>Procesar el pago de tu paquete y darte soporte.</li>
        </ul>
        <p>
          No vendemos tus datos ni los de tus invitados, no los usamos para publicidad y no enviamos mensajes a tus
          invitados por nuestra cuenta: los recordatorios por WhatsApp los envías tú desde tu teléfono.
        </p>

        <h2>Con quién se comparten</h2>
        <p>
          Para que el servicio funcione, tus datos se almacenan y procesan con proveedores que actúan por cuenta de
          Vitela: servicios de alojamiento y base de datos (Google Cloud, Neon y Netlify), el procesador de pagos
          (Stripe) y, si eliges entrar con Google, el servicio de inicio de sesión de Google. Estos proveedores pueden
          estar fuera de México. No compartimos tus datos con terceros para fines distintos a los de este aviso.
        </p>

        <h2>Cookies</h2>
        <p>
          Usamos únicamente las cookies necesarias para mantener tu sesión iniciada. No usamos cookies de publicidad
          ni de rastreo.
        </p>

        <h2>Tus derechos (ARCO)</h2>
        <p>
          Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su uso, así como revocar tu
          consentimiento. Escríbenos a {mail} indicando tu nombre, el correo de tu cuenta y lo que solicitas; te
          responderemos en un plazo máximo de 20 días hábiles. Si eres invitado de un evento, también puedes pedir al
          organizador que elimine tu invitación.
        </p>

        <h2>Conservación</h2>
        <p>
          Conservamos la información de tu evento mientras tengas tu cuenta activa. Si nos pides eliminar tu cuenta,
          borraremos tus eventos y los datos de sus invitados, salvo lo que debamos conservar por obligaciones
          legales (por ejemplo, registros de pagos).
        </p>

        <h2>Cambios a este aviso</h2>
        <p>
          Si cambiamos este aviso, publicaremos la nueva versión en esta página con su fecha de actualización.
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
