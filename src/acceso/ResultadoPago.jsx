// Retorno de Mercado Pago: /success, /pending y /failure (el backend envía ahí con ?payment_id=…)
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AccesoLayout from './AccesoLayout';
import { usePagina } from '../lib/hooks';
import { API, WA_ASESOR_PEDIDO } from '../config';

const ESTADOS = { approved: 'Aprobado', pending: 'Pendiente', in_process: 'En proceso', failed: 'No aprobado', rejected: 'Rechazado', cancelled: 'Cancelado' };

const INICIAL = {
  success: {
    tituloPagina: 'Resultado del pago',
    icono: 'fa-solid fa-circle-notch spin', titulo: ['Verificando', 'tu pago…'], error: false,
    cuerpo: <p>Estamos confirmando la transacción con Mercado Pago. Espera un momento.</p>
  },
  pending: {
    tituloPagina: 'Pago pendiente',
    icono: 'fa-regular fa-clock', titulo: ['Pago en', 'espera.'], error: false,
    cuerpo: (
      <>
        <p><i className="fa-solid fa-circle-notch spin" aria-hidden="true" /> Estamos verificando el estado de tu transacción…</p>
        <p>Esto puede tardar unos minutos dependiendo de tu entidad bancaria.</p>
      </>
    )
  },
  failure: {
    tituloPagina: 'Pago no aprobado',
    icono: 'fa-solid fa-xmark', titulo: ['Pago no', 'aprobado.'], error: true,
    cuerpo: (
      <>
        <p>Tu transacción no pudo completarse en este momento. Tu bolsa sigue guardada.</p>
        <p>Puedes intentar con otro medio de pago o contactar a tu banco.</p>
      </>
    )
  }
};

function Referencia({ order }) {
  return (
    <div className="result-ref">
      <div><span className="up">Referencia</span><strong>{order.external_reference}</strong></div>
      {order.total != null && <div><span className="up">Total</span><strong>${Number(order.total).toLocaleString('es-CO')} COP</strong></div>}
      <div><span className="up">Estado</span><strong>{ESTADOS[order.status] || order.status}</strong></div>
    </div>
  );
}

export default function ResultadoPago({ tipo }) {
  const { search } = useLocation();
  const [vista, setVista] = useState(INICIAL[tipo]);
  usePagina({ titulo: `${INICIAL[tipo].tituloPagina} | Fragancias de Alta Densidad`, descripcion: 'Resultado de tu pago en Fragancias de Alta Densidad.', ruta: `/${tipo}`, indexar: false });

  useEffect(() => {
    const params = new URLSearchParams(search);
    const paymentId = params.get('payment_id') || params.get('collection_id');
    const pintar = (icono, titulo, cuerpo, error = false) => setVista((v) => ({ ...v, icono, titulo, cuerpo, error }));

    if (!paymentId) {
      if (tipo === 'success') {
        pintar('fa-solid fa-question', ['Sin', 'referencia.'],
          <p>No se detectó un identificador de pago en la dirección. Si ya pagaste, escríbenos y lo verificamos.</p>, true);
      }
      return;
    }

    let vivo = true;
    fetch(`${API}/mercadopago/verify_payment${search}`)
      .then((r) => r.json())
      .then((data) => {
        if (!vivo) return;
        if (tipo !== 'success') {
          if (!data.success || !data.order) return;
          const texto = tipo === 'pending'
            ? 'Te enviaremos un correo en cuanto se confirme el pago.'
            : 'Si crees que es un error, comunícate con nosotros. Tu bolsa sigue guardada.';
          setVista((v) => ({ ...v, cuerpo: <><p>{texto}</p><Referencia order={data.order} /></> }));
          return;
        }
        if (!data.success) {
          pintar('fa-solid fa-triangle-exclamation', ['No pudimos', 'verificar.'], <p>{data.message || 'Intenta recargar la página en unos minutos.'}</p>, true);
          return;
        }
        const order = data.order;
        if (order && (order.status === 'approved' || order.status === 'pending')) {
          // El pedido quedó registrado: vaciar la bolsa
          try {
            localStorage.removeItem('altadensidad_carrito');
            localStorage.removeItem('ad_cart_v2');
            sessionStorage.removeItem('altadensidad_carrito');
          } catch { /* sin almacenamiento */ }
        }
        if (order && order.status === 'approved') {
          pintar('fa-solid fa-check', ['Gracias por', 'tu compra.'],
            <><p>Tu pago fue aprobado. Recibirás un correo de confirmación y te contactaremos para coordinar el envío.</p><Referencia order={order} /></>);
        } else {
          pintar('fa-regular fa-clock', ['Pago en', 'proceso.'],
            <><p>Te notificaremos cuando se complete la validación.</p>{order && <Referencia order={order} />}</>);
        }
      })
      .catch((err) => {
        if (!vivo) return;
        if (tipo === 'success') {
          pintar('fa-solid fa-wifi', ['Sin', 'conexión.'], <p>Error de red al verificar el pago. Recarga la página para intentarlo de nuevo.</p>, true);
        } else {
          console.error(err);
        }
      });
    return () => { vivo = false; };
  }, [tipo, search]);

  return (
    <AccesoLayout>
      <section className="acc-card acc-card--result">
        <div className={`status-mark ${vista.error ? 'is-error' : ''}`} aria-hidden="true"><i className={vista.icono} /></div>
        <h1>{vista.titulo[0]} <em>{vista.titulo[1]}</em></h1>
        <div className="result-body" role="status">{vista.cuerpo}</div>
        <div className="result-actions">
          <Link className="btn up btn--full" to="/">Volver a la colección</Link>
          <a className="btn btn--line up btn--full" href={WA_ASESOR_PEDIDO} target="_blank" rel="noopener noreferrer">Hablar con un asesor</a>
        </div>
      </section>
    </AccesoLayout>
  );
}
